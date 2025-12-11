<script setup>
import { computed, defineProps, ref, watch } from 'vue';
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


const soundViewRef = ref();
const audioPlayerRef = ref();
const canvasRef = ref();

let anyInstance;

const createAudio = () => {

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

    const { mode, fftSize, width, height } = props;

    canvasRef.value.width = width;
    canvasRef.value.height = height;
    let canvasContext = canvasRef.value.getContext('2d');

    anyInstance = new Analyser({ source: audioPlayerRef.value, mode, fftSize });

    let dataLength = anyInstance.data.length;
    let __bar_width__ = width / dataLength;
    anyInstance.on('update', () => {

        canvasContext.clearRect(0, 0, width, height);

        for (let i = 0; i < dataLength; i++) {
            let __bar__height__ = 0;
            let d = anyInstance.data[ i ];
            let x = i * __bar_width__;
            switch (mode) {
                case 'byteFrequency': {
                    __bar__height__ = d / 2;
                    break;
                }
                case 'byteTimeDomain': {
                    __bar__height__ = d - 128;
                    break;
                }
                case 'floatFrequency': {
                    __bar__height__ = d + height;
                    break;
                }
                case 'floatTimeDomain': {
                    __bar__height__ = d * 200;
                    break;
                }
            }
            let y = height / 2 - __bar__height__ / 2;
            canvasContext.fillRect(x, y, __bar_width__, __bar__height__);
        }
    });
};

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
