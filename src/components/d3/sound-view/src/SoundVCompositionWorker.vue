<script setup>
import { computed, defineProps, onUnmounted, ref, watch } from 'vue';
import Analyser from './analyser.js';
import Hls from 'hls.js';


const props = defineProps({
    type: {
        type: String,
        default: 'mp3'
    },
    mode: {
        type: String,
        default: 'floatTimeDomain',
        validator(value) {
            return [ 'byteFrequency', 'byteTimeDomain', 'floatFrequency', 'floatTimeDomain' ].includes(value);
        }
    },
    src: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        default: 1200
    },
    height: {
        type: Number,
        default: 200
    },
    fill: {
        type: String,
        default: '#78C5F7'
    },
    fftSize: {
        type: Number,
        default: 32768
        // default: 4096 / 2
    }
});

const styleRef = computed(() => {
    return {
        width: `${ props.width }px`
    };
});

const { mode, fftSize, width, height } = props;

const soundViewRef = ref();
const audioPlayerRef = ref();
const canvasRef = ref();
let canvasContext;

let anyInstance;
let waveformWorker = null;

const waveformWorkerCreate = () => {
    if (typeof Worker !== 'undefined') {
        try {
            waveformWorker = new Worker(new URL('./worker.waveform.calculate.js', import.meta.url));

            // 监听 Web Worker 的消息
            waveformWorker.onmessage = (e) => {

                const { type, data, error } = e.data;

                switch (type) {
                    case 'WAVEFORM_CALCULATED': {
                        waveformDraw(data);
                        break;
                    }
                    case 'WAVEFORM_ERROR': {
                        console.error('波形计算错误:', error);
                        break;
                    }
                    default: {
                        console.warn('未知的 Worker 消息类型:', type);
                    }
                }
            };

            waveformWorker.onerror = (error) => {
                console.error('Web Worker 错误:', error);
            };
        } catch (error) {
            console.warn('Web Worker 不支持，回退到主线程计算:', error);
            waveformWorker = null;
        }
    } else {
        console.warn('Web Worker 不支持，回退到主线程计算');
        waveformWorker = null;
    }
};

const waveformWorkerCleanup = () => {
    if (waveformWorker) {
        waveformWorker.postMessage({ type: 'TERMINATE' });
        waveformWorker.terminate();
        waveformWorker = null;
    }
};

const waveformCalculateWithWorker = (audioData) => {
    if (waveformWorker) {

        const config = {
            mode: props.mode,
            width: props.width,
            height: props.height,
            dataLength: audioData.length
        };

        waveformWorker.postMessage({
            type: 'CALCULATE_WAVEFORM',
            data: audioData,
            config: config
        });
    }
};

const waveformDraw = (waveformData) => {
    canvasContext.clearRect(0, 0, props.width, props.height);
    for (const d of waveformData) {
        canvasContext.fillRect(d.x, d.y, d.width, d.height);
    }
};

const createAudio = () => {

    canvasRef.value.width = width;
    canvasRef.value.height = height;
    canvasContext = canvasRef.value.getContext('2d');

    audioPlayerRef.value.src = props.src;
    audioPlayerRef.value.load();
    audioPlayerRef.value.onplay = () => {
        if (anyInstance) {
            anyInstance.start();
        }
    };
    audioPlayerRef.value.onpause = () => {
        if (anyInstance) {
            anyInstance.pause();
        }
    };

    if (props.type === 'm3u8') {
        if (Hls.isSupported()) {
            let hlsInstance = new Hls();
            hlsInstance.attachMedia(audioPlayerRef.value);
            hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
                hlsInstance.loadSource(props.src);
            });
        } else if (audioPlayerRef.value.canPlayType('application/vnd.apple.mpegurl')) {
            audioPlayerRef.value.src = props.src;
        }
    }
};

const createAnalyser = () => {

    anyInstance = new Analyser({ source: audioPlayerRef.value, mode, fftSize });

    anyInstance.on('update', () => {
        waveformCalculateWithWorker(anyInstance.data);
    });
};

waveformWorkerCreate();

// 组件卸载时清理资源
onUnmounted(() => {
    waveformWorkerCleanup();
    if (anyInstance) {
        anyInstance.destroy();
    }
});

watch(() => audioPlayerRef.value && props.src, () => {
    createAudio();
    createAnalyser();
});
</script>

<template>
<div ref="soundViewRef" :style="styleRef" class="sound-view">
    <canvas ref="canvasRef" class="sound-canvas"></canvas>
    <audio ref="audioPlayerRef" controls crossorigin="anonymous">
        <!-- <source :src="props.src"> -->
    </audio>
</div>
</template>

<style lang="scss" scoped>
.sound-view {
    position: relative;
    border: 1px solid rgba(0, 0, 0, .2);

    .sound-record {
        position: relative;
        width: 1000px;
    }
}
</style>