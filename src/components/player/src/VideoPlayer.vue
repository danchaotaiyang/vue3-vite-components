<script setup>
import { computed, onBeforeUnmount, ref, watchEffect } from 'vue';
import VideoJS from 'video.js';
import zhCN from 'video.js/dist/lang/zh-CN.json';
import 'video.js/dist/video-js.min.css';
import Playback from './Playback.vue';


defineOptions({
    name: 'VideoPlayer'
});

const props = defineProps({
    src: {
        type: String
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
    loop: {
        type: Boolean,
        default: false
    },
    width: {
        type: [ Number, String ],
        default: '100%'
    },
    height: {
        type: [ Number, String ],
        default: '100%'
    }
});

let player = null;
const state = ref('stop');
const duration = ref(0);
const currentTime = ref(0);
const progress = ref(0);
const volume = ref(1);
const muted = ref(false);
const error = ref();
const videoRef = ref();

const option = computed(() => {
    return {
        controls: false,
        preload: 'auto',
        volume: props.volume,
        muted: props.muted,
        loop: props.loop,
        autoplay: props.autoplay,
        src: props.src
    };
});

const style = computed(() => {
    let { width, height } = props;
    return {
        width: typeof width === 'number' ? `${ props.width }px` : width,
        height: typeof height === 'number' ? `${ props.height }px` : height
    };
});

const timeFormatter = (secs) => {
    const minutes = Math.floor(secs / 60) || 0;
    const seconds = Math.floor(secs - minutes * 60) || 0;
    return `${ minutes.toString().padStart(2, 0) }:${ seconds.toString().padStart(2, 0) }`;
};

const durationTimeRef = computed(() => {
    if (!duration.value) {
        return '00:00';
    }
    return timeFormatter(duration.value);
});

const currentTimeRef = computed(() => {
    return timeFormatter(currentTime.value);
});

const create = () => {
    if (!videoRef.value) {
        return;
    }
    VideoJS.addLanguage('zh-CN', zhCN);
    player = VideoJS(videoRef.value, {
        autoplay: option.value.autoplay,
        controls: option.value.controls,
        preload: option.value.preload || 'auto',
        language: 'zh-CN',
        sources: [
            {
                src: option.value.src
            }
        ]
    });

    player.on('loadedmetadata', () => {
        state.value = 'loaded';
        duration.value = player.duration();
    });

    player.on('play', () => {
        state.value = 'play';
    });

    player.on('playing', () => {
        state.value = 'playing';
    });

    player.on('pause', () => {
        state.value = 'pause';
    });

    player.on('ended', () => {
        state.value = 'ended';
    });

    player.on('timeupdate', () => {
        currentTime.value = player.currentTime();
        progress.value = duration.value > 0 ? currentTime.value / duration.value : 0;
    });

    player.on('error', () => {
        state.value = 'error';
        let { message } = player.error();
        error.value = `${ zhCN[ message ] } '${ option.value.src }'`;
    });
};

const dispose = () => {
    if (player) {
        player.dispose();
        player = null;
    }
};

const eventPlay = () => {
    if (player) {
        player.play();
    }
};

const eventPause = () => {
    if (player) {
        player.pause();
    }
};

const eventSeek = (value) => {
    if (player) {
        player.currentTime(value * duration.value);
    }
};

const eventVolume = (value) => {
    if (player) {
        player.volume(value);
        muted.value = Number(value) === 0;
    }
};

const eventMute = () => {
    if (player) {
        player.muted(!muted.value);
    }
};

const eventDownload = () => {
    if (!option.value.src) {
        return;
    }
    let filePath = option.value.src;
    let fileName = filePath.split('/').pop();
    if (!filePath) {
        return;
    }
    if (fileName) {
        var downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.setAttribute('download', fileName);
        downloadLink.setAttribute('href', filePath);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else {
        window.location.href = filePath;
    }
};

const eventTogglePlay = () => {
    if (!player.paused()) {
        player.pause();
    } else {
        player.play();
    }
};

onBeforeUnmount(() => {
    dispose();
});

watchEffect(() => {
    if (!videoRef.value) {
        return;
    }
    if (props.volume) {
        volume.value = props.volume;
    }
    if (props.muted) {
        muted.value = props.muted;
    }
    error.value = !props.src;
    if (error.value) {
        return;
    }
    create();
});
</script>

<template>
<div :style="style" class="video-player">
    <div class="video" @click.stop="eventTogglePlay">
        <video v-if="!props.error" ref="videoRef" class="video-js"></video>
        <div v-show="state !== 'playing' && state !== 'play'" class="player-mark">
            <div class="play-plus"></div>
        </div>
    </div>
    <div class="controls">
        <playback v-model="state" :current-time="currentTimeRef" :duration-time="durationTimeRef" :error="error" :muted="muted" :progress="progress" :volume="volume" @download="eventDownload" @muted="eventMute" @pause="eventPause" @play="eventPlay" @seek="eventSeek" @volume="eventVolume"></playback>
    </div>
</div>
</template>

<style lang="scss">
.video-player {
    position: relative;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    min-width: 960px;
    width: 100%;
    min-height: 400px;
    height: 100%;

    .video {
        position: relative;
        flex: 1 0 0;
        display: flex;
        justify-content: center;
        background: #000;
    }

    .video-js {
        width: 100%;
        height: 100%;
        background: #000;
    }

    .controls {
        position: relative;
        background: #eee;
    }
}

.player-mark {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .play-plus {
        --controller-size: var(--controller-size-plus, 60px);
        cursor: pointer;

        &:before,
        &:after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: var(--controller-size);
            height: var(--controller-size);
            background: var(--player-icon-play-plus) no-repeat;
            transform: translate(-50%, -50%);
            transition: opacity .3s ease;
        }

        &:before {
            background-position: 50% 0;
        }

        &:after {
            background-position: 50% 100%;
            opacity: 0;
        }

        &:hover {
            &:before {
                opacity: 0;
            }

            &:after {
                opacity: 1;
            }
        }
    }
}
</style>
