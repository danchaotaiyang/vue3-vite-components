<script setup>
import { computed, defineProps, onMounted, ref, watch } from 'vue';
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
            //  将当前频率数据复制到传入的 Uint8Array（无符号字节数组）中。
            //  如果数组的长度小于 AnalyserNode.frequencyBinCount, 那么 Analyser 多出的元素会被删除。如果是大于，那么数组多余的元素会被忽略。
            //  analyserNode.getByteFrequencyData(dataArrayCurrent);

            //  复制当前波形或时域数据到传递给它的 Uint8Array (无符号字节数组) 中
            //  analyserNode.getByteTimeDomainData(dataArrayCurrent);

            //  将当前分析节点（AnalyserNode）的频率数据拷贝进一个 Float32Array 数组对象。
            //  此数组表示的频率范围为 0 ~ 22050 Hz，每个元素表示对应频率上的信号分量强度，单位为分贝。
            //  如果你需要更好的性能并且不太在意数据的精度，你可以使用 AnalyserNode.getByteFrequencyData() 作为代替，这一接口使用 Uint8Array来存储数据（对应的也是这个精度的格式）.
            //  analyserNode.getFloatFrequencyData(dataArrayCurrent);

            //  将当前波形或时域数据复制到Float32Array传入的数组中。每个数组值都是一个样本，即特定时间的信号幅度。
            //  analyserNode.getFloatTimeDomainData(dataArrayCurrent);

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
        default: 32768 / 4
        // default: 4096
    }
});

const styleRef = computed(() => {
    return {
        width: `${ props.width }px`
    };
});

const modeRef = computed(() => {
    return modes[ props.mode ];
});

const { width, height } = props;
const zoomScale = 200;

const soundViewRef = ref();
const audioPlayerRef = ref();
const canvasRef = ref();
const playingRef = ref(false);
const recordRef = ref();

let audioContext;
let analyserNode;
let audioSource;
let dataArrayCurrent;
let dataArrayRecord = [];
let canvasContext;
let recordContext;

let modes = {
    byteFrequency: 'getByteFrequencyData',
    byteTimeDomain: 'getByteTimeDomainData',
    floatFrequency: 'getFloatFrequencyData',
    floatTimeDomain: 'getFloatTimeDomainData'
};

let hlsInstance;
let __bar_width__;


const audioPlay = () => {

    if (playingRef.value) {
        return;
    }

    let { width, fftSize } = props;

    if (!audioContext && !analyserNode && !audioSource) {
        audioContext = new AudioContext();
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = fftSize;
        analyserNode.connect(audioContext.destination);
        audioSource = audioContext.createMediaElementSource(audioPlayerRef.value);
        audioSource.connect(analyserNode);
    }

    switch (props.mode) {
        case 'byteFrequency': {
            dataArrayCurrent = new Uint8Array(analyserNode.frequencyBinCount);
            break;
        }
        case 'byteTimeDomain': {
            dataArrayCurrent = new Uint8Array(analyserNode.fftSize);
            break;
        }
        case 'floatFrequency': {
            dataArrayCurrent = new Float32Array(analyserNode.frequencyBinCount);
            break;
        }
        case 'floatTimeDomain': {
            dataArrayCurrent = new Float32Array(analyserNode.fftSize);
            break;
        }
    }

    if (!__bar_width__) {
        __bar_width__ = width / dataArrayCurrent.length;
    }

    playingRef.value = true;

    audioAnimation();

};

const audioPause = () => {
    playingRef.value = false;
    createRecord();
};

const createCanvas = () => {
    const { width, height } = props;
    canvasRef.value.width = width;
    canvasRef.value.height = height;
    canvasContext = canvasRef.value.getContext('2d');
};

const createAudio = () => {

    audioPlayerRef.value.src = props.src;
    audioPlayerRef.value.load();
    audioPlayerRef.value.onplay = audioPlay;
    audioPlayerRef.value.onpause = audioPause;

    if (props.type === 'm3u8') {
        if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.attachMedia(audioPlayerRef.value);
            hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
                hlsInstance.loadSource(props.src);
            });
        } else if (audioPlayerRef.value.canPlayType('application/vnd.apple.mpegurl')) {
            audioPlayerRef.value.src = props.src;
        }
    }
    // canvasContext.fillStyle = props.fill;
};

const createRecord = () => {

    if (![ 'byteTimeDomain', 'floatTimeDomain' ].includes(props.mode)) {
        return;
    }

    let length = dataArrayRecord.length;
    let step = props.fftSize / 50;
    let scale = .3;
    let record = [];
    for (let i = 0; i < length; i++) {
        let item = dataArrayRecord[ i ];
        let r = [];
        let l;
        if (i < length - 1) {
            l = step;
        } else {
            l = item.length;
        }
        for (let n = 0; n < l; n++) {
            r.push(item[ n ]);
        }
        record.push(r);
    }

    let count = record.reduce((a, b) => a + b.length, 0);
    let __w__ = count * __bar_width__ - width;
    __w__ = Math.max(width, __w__);
    let __h__ = height * scale;
    let __b__w__ = __bar_width__;
    let __z__ = zoomScale * scale;
    recordRef.value.width = __w__;
    recordRef.value.height = __h__;
    recordContext = recordRef.value.getContext('2d');
    recordContext.clearRect(0, 0, __w__, __h__);

    for (let r = 0; r < record.length; r++) {
        let item = record[ r ];
        for (let i = 0; i < item.length; i++) {
            let __bar__height__ = 0;
            let d = item[ i ];
            let x = i * __b__w__ + (r * __b__w__ * step) - width;
            switch (props.mode) {
                case 'byteTimeDomain': {
                    __bar__height__ = d - 128;
                    break;
                }
                case 'floatTimeDomain': {
                    __bar__height__ = d * __z__;
                    break;
                }
            }
            let y = __h__ / 2 - __bar__height__ / 2;
            recordContext.fillRect(x, y, __b__w__, __bar__height__);
        }
    }

};

const audioAnimation = () => {

    if (!playingRef.value) {
        return;
    }

    requestAnimationFrame(audioAnimation);

    canvasContext.clearRect(0, 0, width, height);
    analyserNode[ modeRef.value ](dataArrayCurrent);

    let length = dataArrayCurrent.length;
    let current = [];

    for (let i = 0; i < length; i++) {
        let __bar__height__ = 0;
        let d = dataArrayCurrent[ i ];
        let x = i * __bar_width__;
        switch (props.mode) {
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
                __bar__height__ = d * zoomScale;
                break;
            }
        }
        let y = height / 2 - __bar__height__ / 2;
        canvasContext.fillRect(x, y, __bar_width__, __bar__height__);

        current.push(d);
    }

    dataArrayRecord.push(current);
};

onMounted(() => {
    createCanvas();
});

watch(() => audioPlayerRef.value && props.src, () => {
    createAudio();
});
</script>

<template>
<div ref="soundViewRef" :style="styleRef" class="sound-view">
    <canvas ref="canvasRef" class="sound-canvas"></canvas>
    <audio ref="audioPlayerRef" controls crossorigin="anonymous">
        <!-- <source :src="props.src"> -->
    </audio>
    <div class="sound-record">
        <canvas ref="recordRef" class="record-canvas"></canvas>
    </div>
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