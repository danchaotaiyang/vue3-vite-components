import { computed, ref } from 'vue';
import axios from 'axios';
import axiosInstance from './UploaderAxios.js';


const fileSizeMaxRef = ref(0);
const uploadingRef = ref(false);
const statusRef = ref('');
const chosenFileRef = ref(null);
const filePreviewRef = ref();
const chunksRef = ref({});
const exceptionRef = ref('');
const progressRef = computed(() => {
    if (!chosenFileRef.value) {
        return 0;
    }
    let loaded = Object.values(chunksRef.value).reduce((cur, nxt) => cur + nxt[ 'loaded' ], 0);
    let percentage = Math.round(loaded / chosenFileRef.value[ 'size' ] * 100);
    return { loaded, percentage };
});
const retriesCountRef = ref(0);
const fileListRef = ref([]);

let cancelTokens = [];

/**
 * 计算文件Hash值
 * @async
 * @param { File } file 文件对象
 * @return { Promise<string> } 文件十六进制Hash值字符
 */
const calculateFileHash = async (file) => {
    statusRef.value = 'calculating';
    let worker = new Worker(new URL('./UploaderWorker.js', import.meta.url));
    // 计算文件Hash值
    return new Promise((resolve) => {
        worker.postMessage({ method: 'fileHashName', data: { file } });
        worker.onmessage = async (event) => {
            const fileHashName = event.data;
            resolve(fileHashName);
            worker.terminate();
        };
        worker.onerror = (e) => {
            statusRef.value = '';
            chosenFileRef.value = null;
            filePreviewRef.value = null;
            exceptionRef.value = `${ e.name }: ${ e.message }`;
            resolve('');
            worker.terminate();
        };
    });
};

/**
 * 根据文件对象内容获取Hash文件名
 * @async
 * @param { File } file 文件对象
 * @return { Promise<string> } Hash件名
 */
export const getFileHashName = async (file) => {
    try {
        const fileHashName = await calculateFileHash(file);
        if (!fileHashName) {
            return '';
        }
        return fileHashName;
    } catch (e) {
        statusRef.value = '';
        chosenFileRef.value = null;
        filePreviewRef.value = null;
        exceptionRef.value = `${ e.name }: ${ e.message }`;
        return '';
    }
};

/**
 * 生成文件加密秘钥
 * @return { object } 返回秘钥
 */
const generateKey = async () => {
    return window.crypto.subtle.generateKey({
        name: 'AES-GCM',
        length: 256
    }, true, [ 'encrypt', 'decrypt' ]);
};

/**
 * 切片文件加密
 * @param { ArrayBuffer } chunk 切片文件
 * @param { CryptoKey } key 秘钥
 * @return { object }返回值说明
 * @info 存在异常，方法不正确
 */
const encryptChunk = async (chunk, key) => {
    let algorithm = {
        name: 'AES-GCM',
        iv: window.crypto.getRandomValues(new Uint8Array(12))
    };
    let encryptedChunk = await window.crypto.subtle.encrypt(algorithm, key, chunk);

    return { encryptedChunk, iv: algorithm.iv };
};

/**
 * 将大文件进行切片
 * @param { File } file 文件对象
 * @param { number } size 切片大小
 * @param { string } name 文件名
 * @return { Array<{ chunk: Blob, chunkFileName: String }> } 返回值说明
 */
export const createFileChunks = (file, size, name) => {
    statusRef.value = 'splitting';
    // 切片结果集
    let chunks = [];
    // 切片总数 1.1 = 2、2.8 = 3
    let count = Math.ceil(file.size / size);
    for (let i = 0; i < count; i++) {
        let chunkFileName = `${ name }-${ i }`;
        let chunk = file.slice(i * size, (i + 1) * size);
        let chunkItem = {
            chunk,
            chunkFileName,
            total: chunk.size,
            loaded: 0,
            percentage: 0
        };
        chunks.push(chunkItem);
        chunksRef.value[ chunkFileName ] = chunkItem;
    }
    return chunks;
};

/**
 * 创建切片请求
 * @param { string } action 上传地址
 * @param { Blob } chunk 文件切片
 * @param { number } chunkStart 上传起始位置
 * @param { string } chunkFileName 文件切片名称
 * @param { string } fileName 文件名称
 * @param { object } cancelToken 文件名称
 * @return { Promise<AxiosInstance> } 返回请求
 */
const createChunkRequest = (action, chunk, chunkStart, chunkFileName, fileName, cancelToken) => {
    let total = chunk.size + chunkStart;
    chunksRef.value[ chunkFileName ].total = total;
    return axiosInstance.post(`/${ action }/chunk/${ fileName }`, chunk, {
        headers: {
            // 通知服务器请求体为二进制格式字节流
            'Content-Type': 'application/octet-stream'
        },
        params: {
            // 切片文件名
            chunkFileName,
            // 写入文件起始位置
            chunkStart
        },
        onUploadProgress: (progressEvent) => {
            let { loaded } = progressEvent;
            loaded += chunkStart;
            chunksRef.value[ chunkFileName ].loaded = loaded;
            chunksRef.value[ chunkFileName ].percentage = loaded / total * 100;
        },
        cancelToken: cancelToken.token
    });
};

/**
 * 创建合并请求
 * @param { string } action 上传地址
 * @param { string } fileName 文件名称
 * @param { number } chunkSize 切片大小
 * @return { Promise<AxiosInstance> } 返回请求
 */
const createMergeRequest = (action, fileName, chunkSize) => {
    return axiosInstance.post(`/${ action }/merge`, { fileName, chunkSize });
};

/**
 * 创建校验文件请求
 * @param { string } action 上传地址
 * @param { string } fileName 文件名
 * @return { Promise<AxiosInstance> } 返回请求
 */
const createVerifyFile = (action, fileName) => {
    return axiosInstance.get(`/${ action }/verify/${ fileName }`);
};

/**
 * 校验文件是否存在
 * @param { string } action 上传地址
 * @param { string } fileName 文件名
 * @return { object } 返回文件
 */
const verifyFile = async (action, fileName) => {
    try {
        uploadingRef.value = true;
        statusRef.value = 'verifying';
        return createVerifyFile(action, fileName);
    } catch (e) {
        console.warn(e);
    }
};

/**
 * 检查上传文件
 * @param { Object } files 检查文件列表
 */
const checkUploadFile = (files) => {
    statusRef.value = '';
    filePreviewRef.value = null;
    chosenFileRef.value = null;
    if (!files.length) {
        exceptionRef.value = `没有选择任何文件!`;
        return;
    }
    const [ file ] = files;
    const { size, name } = file;
    if (size > fileSizeMaxRef.value) {
        exceptionRef.value = `请选择小于 ${ formatByte(fileSizeMaxRef.value) } 的文件!`;
        return;
    }
    let url = URL.createObjectURL(file);
    filePreviewRef.value = { url, type: getFileType(name), name, size };
    chosenFileRef.value = file;
};

/**
 * 切片上传
 * @param { function[] } chunkRequests chunk请求
 * @param { number } maxConcurrent 并发数量
 * @return { Promise<void> }
 */
const uploadChunks = async (chunkRequests, maxConcurrent) => {
    let concurrentRequests = [];
    let length = chunkRequests.length;
    let index = 0;
    return new Promise(async (resolve) => {
        if (length === 0) {
            resolve();
            return;
        }
        let next = async () => {
            index += 1;
            let chunkRequest = chunkRequests[ index ];
            if (chunkRequest) {
                await chunkRequest().then(next);
                concurrentRequests.push(chunkRequest);
            }
            if (concurrentRequests.length === length) {
                resolve();
                next = null;
            }
        };
        for (let i = 0; i < maxConcurrent; i++) {
            let chunkRequest = chunkRequests[ i ];
            if (chunkRequest) {
                index = i;
                let request = Promise.resolve().then(chunkRequest).then(next);
                concurrentRequests.push(request);
            }
        }
        await Promise.all(concurrentRequests);
    });
};

/**
 * 文件上传
 * @async
 * @param { string } action 接口地址
 * @param { File } file 文件
 * @param { string } fileName 文件名
 * @param { object } option 配置项
 * @param { number } option.chunkSize 切片大小
 * @param { number } option.maxRetries 重试次数
 * @param { number } option.maxConcurrent 并发数
 * @returns { Promise<void> }
 */
export const uploadFile = async (action, file, fileName, option) => {
    let cancelTokensCollection = [];
    let chunkRequests = [];
    let { chunkSize, maxRetries, maxConcurrent } = option;
    try {
        const { data: { uploaded, chunkLoaded, filePath } } = await verifyFile(action, fileName);
        if (uploaded) {
            statusRef.value = 'success';
            updateFileList(filePath);
            uploadingRef.value = false;
            return;
        }
        // 将文件进行切片
        let chunks = createFileChunks(file, chunkSize, fileName);
        if (chunks.length === 0) {
            statusRef.value = 'fail';
            return;
        }
        chunkRequests = chunks.map((d) => {
            let __chunk__ = d.chunk;
            let __start__ = 0;
            const cancelToken = axios.CancelToken.source();
            cancelTokensCollection.push(cancelToken);
            const existingChunk = chunkLoaded[ d.chunkFileName ];
            if (existingChunk) {
                let { loaded } = existingChunk;
                const remainingChunk = d.chunk.slice(loaded);
                if (remainingChunk.size === 0) {
                    chunksRef.value[ d.chunkFileName ].loaded = d.chunk.size;
                    chunksRef.value[ d.chunkFileName ].percentage = 100;
                    return () => Promise.resolve();
                    // return new Promise(resolve => resolve());
                }
                __chunk__ = remainingChunk;
                __start__ = loaded;
                chunksRef.value[ d.chunkFileName ].loaded = __start__;
                chunksRef.value[ d.chunkFileName ].percentage = __start__ / d.chunk.size * 100;
            }
            return () => createChunkRequest(action, __chunk__, __start__, d.chunkFileName, fileName, cancelToken);
        });
        cancelTokens = cancelTokensCollection;
        statusRef.value = 'uploading';
        if (maxConcurrent && maxConcurrent > 0) {
            await uploadChunks(chunkRequests, maxConcurrent);
        } else {
            await Promise.all(chunkRequests.map(d => d()));
        }
        statusRef.value = 'merging';
        let { data } = await createMergeRequest(action, fileName, chunkSize);
        if (data[ 'isTampered' ]) {
            statusRef.value = 'fail';
            exceptionRef.value = '文件校验：文件上传中,可能被篡改!';
        } else {
            statusRef.value = 'success';
            updateFileList(data.filePath);
        }
        uploadingRef.value = false;
        chunksRef.value = {};
    } catch (e) {
        if (axios.isCancel(e)) {
            statusRef.value = e.message;
        } else {
            if (maxRetries > 0 && retriesCountRef.value < maxRetries) {
                retriesCountRef.value += 1;
                console.warn('>=-------');
                console.warn(e);
                console.warn(`重试第${ retriesCountRef.value }次`);
                await uploadFile(action, file, fileName, option);
            } else {
                console.warn(e);
                statusRef.value = 'fail';
                exceptionRef.value = JSON.stringify(e);
            }
        }
    } finally {
        cancelTokensCollection = null;
        cancelTokens = [];
        chunkRequests = null;
    }
};

/**
 * 暂停上传
 */
export const uploadPause = () => {
    statusRef.value = 'paused';
    for (const cancelToken of cancelTokens) {
        cancelToken?.cancel('paused');
    }
};

/**
 * 启用拖拽上传
 * @param { HTMLElement } container 挂载DOM
 * @param { object } option 配置项
 * @param { number } option.fileSizeMax 文件大小限制
 * @param { boolean } option.userClick 启用点击
 * @param { boolean } option.useDrag 启用拖拽
 * @returns { object | null } 返回文件
 */
export const useUploader = (container, option) => {

    if (!container) {
        return null;
    }

    const { fileSizeMax, useClick, useDrag } = option;

    fileSizeMaxRef.value = fileSizeMax;

    //>>>  事件处理  <<<//
    container.addEventListener('dragenter', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (uploadingRef.value) {
            return;
        }
        container.classList.add('dragging');
    });
    container.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
    });
    container.addEventListener('drop', (event) => {

        event.preventDefault();
        event.stopPropagation();

        if (!useDrag) {
            return;
        }

        if (uploadingRef.value) {
            return;
        }

        container.classList.remove('dragging');
        // 通过事件对象的dataTransfer属性获得文件
        checkUploadFile(event.dataTransfer.files);
    });
    container.addEventListener('dragleave', (event) => {
        event.preventDefault();
        event.stopPropagation();
        container.classList.remove('dragging');
    });
    container.addEventListener('click', (event) => {

        event.preventDefault();
        event.stopPropagation();

        if (!useClick) {
            return;
        }

        if (uploadingRef.value) {
            return;
        }

        let $input = document.createElement('input');
        $input.type = 'file';
        $input.click();
        $input.addEventListener('change', (event) => {

            checkUploadFile(event.target[ 'files' ]);
            $input = null;
        });
    });

    return {
        uploading: uploadingRef,
        status: statusRef,
        chosenFile: chosenFileRef,
        filePreview: filePreviewRef,
        chunks: chunksRef,
        progress: progressRef,
        fileList: fileListRef,
        exception: exceptionRef
    };
};

const pow1024 = (value) => Math.pow(1024, value);

/**
 * 存储容量转换
 * @param { number } value 原字节值
 * @param { number } [fixed = 2] 保留原值精度
 * @return { string } 结果
 */
export const formatByte = (value, fixed = 2) => {
    if (!value) {
        return '';
    }
    if (value < pow1024(1)) {
        return value + 'B';
    }
    if (value < pow1024(2)) {
        return Number((value / pow1024(1)).toFixed(fixed)) + 'KB';
    }
    if (value < pow1024(3)) {
        return Number((value / pow1024(2)).toFixed(fixed)) + 'MB';
    }
    if (value < pow1024(4)) {
        return Number((value / pow1024(3)).toFixed(fixed)) + 'GB';
    }
    return Number((value / pow1024(4)).toFixed(fixed)) + 'TB';
};

/**
 * 文件后缀返回文件类型
 * @param { string } fileName 文件后缀
 * @returns { string } 文件类型
 */
export const getFileType = (fileName) => {
    let suffix = '';
    let index = fileName.lastIndexOf('.');
    if (index > -1) {
        suffix = fileName.slice(index + 1).toLowerCase();
    }
    switch (suffix) {
        case 'txt': {
            return 'txt';
        }
        case 'jpg':
        case 'jpeg':
        case 'jpe':
        case 'jpf':
        case 'jpx':
        case 'jp2':
        case 'j2c':
        case 'j2k':
        case 'jpc':
        case 'jps':
        case 'png':
        case 'pns':
        case 'bmp':
        case 'rle':
        case 'dib':
        case 'gif':
        case 'tif':
        case 'tiff':
        case 'psd':
        case 'pdd':
        case 'psb':
        case 'pcx':
        case 'eps':
        case 'pxr':
        case 'mpo': {
            return 'image';
        }
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
        case 'flv':
        case 'mkv':
        case 'mpeg':
        case '3gp':
        case 'webm':
        case 'ogv':
        case 'f4v':
        case 'm4v':
        case 'asf':
        case 'vob':
        case 'ts': {
            return 'video';
        }
        case 'mp3':
        case 'wav':
        case 'aac':
        case 'flac':
        case 'ogg':
        case 'm4a':
        case 'wma':
        case 'alac':
        case 'aiff':
        case 'au':
        case 'mid':
        case 'ra':
        case 'vorbis':
        case 'ape':
        case 'ac3': {
            return 'sound';
        }
        case 'pdf': {
            return 'pdf';
        }
        case 'doc':
        case 'docx':
        case 'dot':
        case 'dotx':
        case 'docm':
        case 'dotm':
        case 'rtf':
        case 'wps':
        case 'wpt': {
            return 'word';
        }
        case 'xls':
        case 'xlsx':
        case 'xlt':
        case 'xla':
        case 'xlsm':
        case 'dbf':
        case 'csv':
        case 'prn':
        case 'dif':
        case 'xltx':
        case 'xltm':
        case 'xlam':
        case 'et':
        case 'ett': {
            return 'excel';
        }
        case 'ppt':
        case 'pptx':
        case 'pps':
        case 'pot':
        case 'pptm':
        case 'potx':
        case 'potm':
        case 'ppsx':
        case 'pds':
        case 'pdt': {
            return 'ppt';
        }
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gzip':
        case 'bzip2':
        case 'jar':
        case 'war':
        case 'ear':
        case 'cab':
        case 'ace':
        case 'lzh':
        case 'iso':
        case 'dmg':
        case 'apk':
        case 'deb':
        case 'rpm':
        case 'bz2':
        case 'gz':
        case 'xz':
        case 'zst': {
            return 'zip';
        }
        case 'link':
        case 'url':
        case 'lnk':
        case 'shortcut':
        case 'sym':
        case 'in':
        case 'pif':
        case 'desktop':
        case 'appref-ms': {
            return 'link';
        }
        default: {
            return 'unknown';
        }
    }
};

const updateFileList = (filePath) => {
    let { type, name, size, url } = filePreviewRef.value;
    fileListRef.value.unshift({
        type, name, size: formatByte(size), url, filePath
    });
    filePreviewRef.value = null;
};
