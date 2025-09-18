self.addEventListener('message', async (event) => {
    const { method, data } = event.data;
    switch (method) {
        case 'fileHashName': {
            await fileHashName(data.file);
            break;
        }
    }
});

const fileHashName = async (file) => {
    try {
        const filename = await calculateFileHash(file);
        //>>>  取文件后缀  <<<//
        const fileExtension = file.name.split('.').pop();
        //>>>  Hash文件名与后缀拼接  <<<//
        self.postMessage(`${ filename }.${ fileExtension }`);
        self.close();
    } catch (e) {
        console.warn(e);
    }
};

/**
 * ArrayBuffer 转十六进制字符
 * @param { ArrayBuffer } buffer ArrayBuffer对象
 * @return { string } 十六进制字符
 */
const bufferToHex = (buffer) => {
    try {
        return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        return '';
    }
};

/**
 * 计算文件Hash值
 * @async
 * @param { File } file 文件对象
 * @return { Promise<string> } 文件十六进制Hash值字符
 */
const calculateFileHash = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        return bufferToHex(hashBuffer);
    } catch (e) {
        console.warn(e);
    }
};
