<script setup>
import { computed, onMounted, reactive, ref, toRaw, watch } from 'vue';
import { formatByte, getFileHashName, uploadFile, uploadPause, useUploader } from './UploaderMain.js';


const props = defineProps({
    action: {
        type: String,
        required: true
    },
    chunkSize: {
        type: Number,
        default: 1024 * 1024 * 10
    },
    fileSizeMax: {
        type: Number,
        default: 1024 * 1024 * 1024
    },
    autoUpload: {
        type: Boolean,
        default: false
    },
    useClick: {
        type: Boolean,
        default: true
    },
    useDrag: {
        type: Boolean,
        default: false
    },
    maxRetries: {
        type: Number,
        default: 3
    },
    maxConcurrent: {
        type: Number,
        default: 0
    },
    onChange: Function,
    onRemove: Function,
    onExceed: Function,
    onPreview: Function,
    beforeUpload: Function,
    onSuccess: Function,
    onError: Function
});

let icons = import.meta.glob('./icons/*.png', { eager: true });
let fileTypes = {};

for (const key in icons) {
    let ni = key.lastIndexOf('/');
    let type = '';
    if (ni > -1) {
        type = key.slice(ni + 1).replace('.png', '');
    }
    fileTypes[ type ] = icons[ key ].default;
}

const uploaderRef = ref();

const fileState = reactive({
    uploading: false,
    status: '',
    chosen: null,
    preview: null,
    chunks: {},
    progress: {},
    fileList: []
});

const exceptionState = reactive({
    content: ''
});

const fileSizeMaxRef = computed(() => {
    return formatByte(props.fileSizeMax);
});

const progressLoadedRef = computed(() => {
    if (!fileState.progress[ 'loaded' ]) {
        return '';
    }
    return formatByte(fileState.progress[ 'loaded' ]);
});

const statusRef = computed(() => {
    switch (fileState.status) {
        case 'calculating': {
            return '正在计算';
        }
        case 'splitting': {
            return '正在切片';
        }
        case 'uploading': {
            return `已上传 ${ fileState.progress[ 'percentage' ] }%`;
        }
        case 'merging': {
            return '正在合并';
        }
        case 'success': {
            return '上传成功';
        }
        case 'fail': {
            return '上传失败';
        }
        case 'paused': {
            return '已暂停';
        }
        default: {
            return '';
        }
    }
});

const fileSize = computed(() => {

    if (!fileState.preview) {
        return 0;
    }

    return formatByte(fileState.preview[ 'size' ]);
});

const fileTypeRef = computed(() => {

    let type = 'unknown';

    if (fileState.preview) {
        type = fileState.preview[ 'type' ];
    }

    return fileTypes[ type ];
});

const visibleAction = computed(() => {

    let status = [ 'splitting', 'uploading', 'paused' ];

    if (!props.autoUpload) {
        status.push('');
    }

    return status.includes(fileState.status);
});

const visibleActionStart = computed(() => {

    let status = [];

    if (!props.autoUpload) {
        status.push('');
    }

    return status.includes(fileState.status);
});

const visibleActionPause = computed(() => {

    let status = [ 'uploading' ];

    return status.includes(fileState.status);
});

const visibleActionResume = computed(() => {

    let status = [ 'paused' ];

    return status.includes(fileState.status);
});

const uploaderMounted = () => {

    if (typeof uploaderRef.value === 'undefined') {
        return;
    }

    try {

        let { fileSizeMax = 0, useClick = false, useDrag = false } = props;
        let uploadFile = useUploader(uploaderRef.value, { fileSizeMax, useClick, useDrag });

        if (!uploadFile) {
            return;
        }

        const { uploading, status, chosenFile, filePreview, chunks, progress, fileList, exception } = uploadFile;

        fileState.uploading = uploading;
        fileState.status = status;
        fileState.chosen = chosenFile;
        fileState.preview = filePreview;
        fileState.chunks = chunks;
        fileState.progress = progress;
        fileState.fileList = fileList;
        exceptionState.content = exception;
    } catch (e) {

        console.warn(e);
        exceptionState.content = JSON.stringify(e);
        typeof props.onError === 'function' && props.onError(e);
    }
};

const uploaderAction = async (file, fileName) => {

    try {

        let { chunkSize, maxRetries, maxConcurrent } = props;

        // 文件切片上传
        await uploadFile(props.action, file, fileName, { chunkSize, maxRetries, maxConcurrent });

        typeof props.onSuccess === 'function' && props.onSuccess();
    } catch (e) {

        console.warn(e);
        typeof props.onError === 'function' && props.onError(e);
    }
};

const clearFiles = () => {

    fileState.uploading = false;
    fileState.status = '';
    fileState.chosen = null;
    fileState.preview = null;
    fileState.chunks = {};
    fileState.progress = {};
    fileState.fileList = [];
    exceptionState.content = '';
};

const sendFile = async () => {

    let { chosen } = fileState;
    let before = true;

    try {
        if (typeof props.beforeUpload === 'function') {

            before = await props.beforeUpload(chosen);
        }
        if (!chosen) {

            exceptionState.content = '请选择文件!';
            return;
        }
        if (before && chosen instanceof File) {

            const fileName = await getFileHashName(chosen);

            if (!fileName) {
                return;
            }
            if (fileState.status === 'paused') {
                return;
            }

            await uploaderAction(chosen, fileName);
        }
    } catch (e) {

        console.warn(e);
        exceptionState.content = JSON.stringify(e);
        typeof props.onError === 'function' && props.onError(e);
    }
};

const submit = () => {

    if (fileState.status !== '') {
        return;
    }
    // 开始上传
    // 如果不是自动上传, 则可以手动上传, 否则不可重复上传!
    !props.autoUpload && sendFile();
};

const pause = () => {
    // 暂停上传
    uploadPause();
};

const resume = () => {
    // 继续上传
    sendFile();
};

const remove = (index) => {
    fileState.fileList.splice(index, 1);
};

watch(() => fileState.chosen, () => {

    if (!fileState.chosen) {
        return;
    }

    if (typeof props.onChange === 'function') {
        props.onChange(fileState.chosen);
    }

    if (props.autoUpload) {
        sendFile();
    }
});

let timer;
watch(() => exceptionState.content, () => {

    if (exceptionState.content) {

        typeof props.onError === 'function' && props.onError(toRaw(exceptionState));

        timer = setTimeout(async () => {

            exceptionState.content = '';
            clearTimeout(timer);
        }, 3000);
    }
});

onMounted(() => {
    uploaderMounted();
});

defineExpose({
    submit,
    pause,
    clearFiles
});
</script>

<template>
<div class="uploader-composition">
    <div ref="uploaderRef" class="uploader-container">
        <slot>
            <div class="uploader-default">
                <div class="uploader-icon">
                    <img alt="" src="./icons/folder.png">
                </div>
                <div class="uploader-placeholder">
                    <strong>将文件拖到此处，或<span>点击选择文件</span></strong>
                </div>
                <div class="uploader-tip">
                    可选择小于 <strong>{{ fileSizeMaxRef }}</strong> 的文件
                </div>
            </div>
        </slot>
    </div>
    <transition name="fade">
        <slot :file="fileState" name="file">
            <div v-if="fileState.preview && fileState.preview.url" class="uploader-file">
                <div class="uploader-progress">
                    <div v-for="(value, key) in fileState.chunks" :key="key" class="progress-bar-outer">
                        <div :style="{ width: `${ value.percentage }%` }" class="progress-bar-inner"></div>
                    </div>
                </div>
                <div class="uploader-thumbnail">
                    <img :src="fileTypeRef" alt="">
                </div>
                <div class="uploader-file-info">
                    <div class="uploader-file-name">{{ fileState.preview.name }}</div>
                    <div class="uploader-file-size"><span v-if="progressLoadedRef">{{ progressLoadedRef }} / </span><span>{{ fileSize }}</span></div>
                </div>
                <div class="uploader-status">
                    <slot :state="fileState" name="status">{{ statusRef }}</slot>
                </div>
                <div v-if="visibleAction" class="uploader-action">
                    <div v-if="visibleActionStart" class="uploader-button uploader-submit" @click="submit">
                        上传
                    </div>
                    <div v-if="visibleActionPause" class="uploader-button uploader-pause" @click="pause">
                        暂停
                    </div>
                    <div v-if="visibleActionResume" class="uploader-button uploader-resume" @click="resume">
                        恢复
                    </div>
                </div>
            </div>
            <div v-for="(item, index) in fileState.fileList" :key="index" class="uploader-file">
                <div class="uploader-thumbnail">
                    <img v-if="item.type" :src="fileTypeRef(item.type)" alt="">
                </div>
                <div class="uploader-file-info">
                    <div class="uploader-file-name">{{ item.name }}</div>
                    <div class="uploader-file-size"><span>{{ item.size }}</span></div>
                </div>
                <div class="uploader-action">
                    <div class="uploader-button uploader-remove" @click="remove(index)">
                        删除
                    </div>
                </div>
            </div>
        </slot>
    </transition>
    <transition name="fade">
        <div v-if="exceptionState.content" class="uploader-exception">
            <svg viewBox="0 0 1024 1024" width="16">
                <path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z" fill="currentColor"></path>
            </svg>
            <div class="message">
                {{ exceptionState.content }}
            </div>
        </div>
    </transition>
</div>
</template>

<style lang="scss">
.uploader-composition {
    --color-default: #ffffff;
    --color-primary: #409EFF;
    --color-success: #67C23A;
    --color-danger: #F56C6C;
    --color-warning: #E6A23C;
    --color-border: #a89f9f;
    --color-text: #636980;

    position: relative;
    font-family: Inter, Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, "微软雅黑", Arial, sans-serif;
}

.uploader-container {
    background-color: var(--color-default);
    border: 1px dotted var(--color-border);
    border-radius: 4px;
    cursor: pointer;

    .uploader-default {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 24px;

        .uploader-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            padding-bottom: 5px;
            font-size: 40px;
            line-height: 1;

            img {
                width: 100%;
            }
        }

        .uploader-placeholder {
            padding: 8px 0;
            font-weight: 900;
            font-size: 18px;
            line-height: 1;
            color: var(--color-text);
        }

        .uploader-tip {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    &.dragging {
        border-color: var(--color-success);

        .uploader-icon {
            color: var(--color-success);
        }
    }
}

.uploader-file {
    position: relative;
    display: flex;
    align-items: center;
    border: 1px dotted #a89f9f;
    margin-top: 5px;
    padding: 10px;
    border-radius: 4px;

    .uploader-progress {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: stretch;

        .progress-bar-outer {
            flex: 1;
            width: 100%;
            overflow: hidden;

            .progress-bar-inner {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                height: 100%;
                background: #d3f4c3;
                line-height: 1;
                color: var(--color-default);

                &:before {
                    content: attr(data-uploader-status);
                    transform: translateX(-5px);
                }
            }
        }
    }

    .uploader-thumbnail {
        position: relative;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        cursor: pointer;

        video, img {
            display: block;
            max-width: 100%;
            max-height: 100%;
        }
    }

    .uploader-file-info {
        position: relative;
        z-index: 10;
        flex: 1;
        padding: 0 10px;
        line-height: 1.5;

        .uploader-file-size {
            font-weight: bold;
        }
    }

    .uploader-status {
        position: relative;
        z-index: 10;
        padding: 0 10px;
    }

    .uploader-action {
        position: relative;
        z-index: 10;
        padding: 0 10px;

        .uploader-button {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            padding: 5px 11px;
            line-height: 1;
            font-size: 12px;
            color: var(--color-default);
            border-radius: 4px;
            cursor: pointer;
            box-sizing: border-box;

            &.uploader-submit {
                background: var(--color-success);
            }

            &.uploader-pause {
                background: var(--color-warning);
            }

            &.uploader-resume {
                background: var(--color-success);
            }

            &.uploader-remove {
                background: var(--color-danger);
            }
        }
    }

    & + .uploader-file {
        margin-top: 5px;
    }
}

.uploader-exception {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    align-items: center;
    margin: 5px;
    padding: 10px;
    background-color: #fef0f0;
    color: var(--color-danger);
    line-height: 1;
    border-radius: 2px;

    .message {
        margin-left: 5px;
    }
}
</style>

<style lang="scss">
.fade-enter-active {
    animation: fade-in-top 0.3s ease-out both;
}

.fade-leave-active {
    animation: fade-in-top 0.3s ease-in both reverse;
}

@keyframes fade-in-top {
    0% {
        transform: translateY(-5px);
        opacity: 0;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

</style>
