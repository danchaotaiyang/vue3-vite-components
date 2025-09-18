<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ZLMRTCClient } from '../lib/ZLMRTCClient.js';


const loading = defineModel({ type: Boolean, default: false });

defineOptions({
    name: 'WebrtcPlayer'
});

const props = defineProps({
    src: {
        type: String,
        required: true
    },
    // 拉流为true 推流为false
    receive: {
        type: Boolean,
        default: false
    },
    volume: {
        type: Number,
        default: 1
    },
    muted: {
        type: Boolean,
        default: false
    },
    autoplay: {
        type: Boolean,
        default: false
    },
    width: {
        type: Number,
        default: 640
    },
    height: {
        type: Number,
        default: 480
    },
    video: {
        type: Boolean,
        default: false
    },
    audio: {
        type: Boolean,
        default: false
    },
    simulcast: {
        type: Boolean,
        default: false
    },
    debug: {
        type: Boolean,
        default: false
    }
});

const webrtcStatus = ref('connecting');
const playerId = ref(`webrtc-player-${ Date.now() }-${ Math.floor(Math.random() * 10000) }`);
const webRtcElement = ref();

let webRtcPlayer;

const create = () => {

    webRtcElement.value = document.getElementById(playerId.value);
    webRtcElement.value.volume = props.volume;
    webRtcElement.value.muted = props.muted ? 'muted' : '';

    if (!props.src) {
        return;
    }
    if (webRtcPlayer) {
        dispose();
    }

    webrtcStatus.value = 'connecting';

    webRtcPlayer = new ZLMRTCClient.Endpoint({
        element: webRtcElement.value, // video 标签
        zlmsdpUrl: props.src, //流地址
        simulcast: props.simulcast,
        useCamera: true,
        audioEnable: props.audio,
        videoEnable: props.video,
        recvOnly: props.receive,
        resolution: {
            w: props.width,
            h: props.height
        },
        // usedatachannel: true,
        debug: props.debug // 是否打印日志
    });

    webRtcPlayer.on(ZLMRTCClient.Events[ 'WEBRTC_ICE_CANDIDATE_ERROR' ], (e) => {
        // ICE 协商出错
        // console.log('ICE 协商出错');
    });

    webRtcPlayer.on(ZLMRTCClient.Events[ 'WEBRTC_ON_REMOTE_STREAMS' ], (e) => {
        //获取到了远端流，可以播放
        webRtcElement.value.addEventListener('canplay', (e) => {
            webRtcElement.value.play();
        });
    });
    webRtcPlayer.on(ZLMRTCClient.Events[ 'WEBRTC_OFFER_ANWSER_EXCHANGE_FAILED' ], (e) => {
        // offer anwser 交换失败
        // console.log('offer anwser 交换失败', e);
        dispose();
    });

    webRtcPlayer.on(ZLMRTCClient.Events[ 'WEBRTC_ON_LOCAL_STREAM' ], (s) => {
        // 获取到了本地流
        // console.log('offer anwser 交换失败', s);
    });

    webRtcPlayer.on(ZLMRTCClient.Events[ 'CAPTURE_STREAM_FAILED' ], (s) => {
        // 获取本地流失败
        // console.log('获取本地流失败');
    });

    webRtcPlayer.on(ZLMRTCClient.Events[ 'WEBRTC_ON_CONNECTION_STATE_CHANGE' ], (state) => {
        // RTC 状态变化 ,详情参考 https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionState
        // console.log('当前状态==>', state);
        webrtcStatus.value = state;
        loading.value = webrtcStatus.value === 'connecting';
    });

    webRtcPlayer.on(ZLMRTCClient.Events[ 'WEBRTC_ON_DATA_CHANNEL_OPEN' ], (event) => {
        // console.log('rtc datachannel 打开 :', event);
    });

    webRtcPlayer.on(ZLMRTCClient.Events[ 'WEBRTC_ON_DATA_CHANNEL_MSG' ], (event) => {
        // console.log('rtc datachannel 消息 :', event.data);
    });
    webRtcPlayer.on(ZLMRTCClient.Events[ 'WEBRTC_ON_DATA_CHANNEL_ERR' ], (event) => {
        // console.log('rtc datachannel 错误 :', event);
    });
    webRtcPlayer.on(ZLMRTCClient.Events[ 'WEBRTC_ON_DATA_CHANNEL_CLOSE' ], (event) => {
        // console.log('rtc datachannel 关闭 :', event);
    });
};

const dispose = () => {
    webrtcStatus.value = '';
    if (webRtcPlayer) {
        webRtcElement.value.pause();
        webRtcPlayer.close();
        webRtcPlayer = null;
    }
};

onMounted(() => {
    create();
});

onBeforeUnmount(() => {
    dispose();
});

watch(() => props.volume, () => {
    webRtcElement.value.volume = props.volume;
});

watch(() => props.volume, () => {
    webRtcElement.value.muted = props.muted ? 'muted' : '';
});
</script>

<template>
<div v-loading="loading" class="webrtc-player">
    <video :id="playerId" class="webrtc-video pointer-events-none" controls="controls"></video>
</div>
</template>

<style lang="scss">
.webrtc-player {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background: #000;

    .webrtc-video {
        width: 100%;
        height: 100%;
    }
}
</style>
