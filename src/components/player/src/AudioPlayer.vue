<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Howl } from 'howler';
import Playback from './Playback.vue';


defineOptions({
    name: 'AudioPlayer'
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
    }
});

const state = ref('stop');
const duration = ref(0);
const currentTime = ref(0);
const progress = ref(0);
const volume = ref(1);
const muted = ref(false);
const error = ref();

let player = null;

const style = computed(() => {
    let { width } = props;
    return {
        width: typeof width === 'number' ? `${ props.width }px` : width
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

const timeUpdateHandler = () => {
    if (!player) {
        return;
    }
    if (player.playing() || player.seek()) {
        requestAnimationFrame(timeUpdateHandler);
    }
    currentTime.value = player.seek() || 0;
    progress.value = duration.value > 0 ? currentTime.value / duration.value : 0;
};

const zhCN = {
    // 1: '用户代理因用户请求中止了媒体资源的获取过程。',
    // 2: '在确认资源可用后，某种网络错误导致用户代理停止获取媒体资源。',
    // 3: '在确认资源可用后，解码媒体资源时发生某种错误。',
    // 4: '由src属性或分配的媒体提供者对象指定的媒体资源不合适。',
    'No audio support.': '不支持音频功能。',
    'Non-string found in selected audio sources - ignoring.': '在所选音频源中发现非字符串内容，将予以忽略。',
    'No codec support for selected audio sources.': '音频源缺少编解码器支持。',
    'No file extension was found. Consider using the "format" property or specify an extension.': '未找到文件扩展名。建议使用 “format” 属性，或者指定一个扩展名。',
    'Decoding audio data failed.': '音频数据解码失败。',
    'Failed loading audio file with status': '音频文件加载失败，状态异常'
};

const create = async () => {

    if (!props.src) {
        return;
    }

    if (player) {
        player.unload();
        player = null;
    }

    player = new Howl({
        src: [ props.src ],
        html5: true,
        volume: Number(props.volume) || 1,
        loop: Boolean(props.loop),
        onloaderror: (id, err) => {
            state.value = 'error';
            error.value = `${ zhCN[ err ] || err } ${ id } '${ props.src }'`;
        }
    });

    player.on('load', () => {
        state.value = 'loaded';
        duration.value = player.duration() || 0;
    });

    player.on('play', () => {
        state.value = 'playing';
        timeUpdateHandler();
    });

    player.on('pause', () => {
        state.value = 'paused';
    });

    player.on('stop', () => {
        state.value = 'stoped';
    });

    player.on('seek', () => {
        timeUpdateHandler();
    });

    if (props.autoplay) {
        player.play();
    }
};

const destroy = () => {
    if (!player) {
        return;
    }
    player.stop();
    player.unload();
    player = null;
};

const eventPlay = () => {
    if (!player) {
        return;
    }
    player.play();
};

const eventPause = () => {
    if (!player) {
        return;
    }
    player.pause();
};

const eventSeek = (value) => {
    if (!player) {
        return;
    }
    player.seek(duration.value * value);
};

const eventVolume = (volume) => {
    if (!player) {
        return;
    }
    player.volume(volume);
    muted.value = Number(volume) === 0;
};

const eventMute = () => {
    if (!player) {
        return;
    }
    muted.value = !muted.value;
    player.muted(muted.value);
};

const eventDownload = () => {
    if (!props.src) {
        return;
    }
    let filePath = props.src;
    let fileName = filePath.split('/').pop();
    if (!filePath) {
        return;
    }
    if (fileName) {
        let downloadLink = document.createElement('a');
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

onBeforeUnmount(() => {
    destroy();
});

watch(() => props.src, () => {
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
}, { immediate: true });
</script>

<template>
<div :style="style" class="audio-player">
    <div class="controls">
        <playback v-model="state" :current-time="currentTimeRef" :duration-time="durationTimeRef" :error="error" :muted="muted" :progress="progress" :volume="volume" @download="eventDownload" @muted="eventMute" @pause="eventPause" @play="eventPlay" @seek="eventSeek" @volume="eventVolume"></playback>
    </div>
</div>
</template>

<style lang="scss">
.audio-player {
    .controls {
        position: relative;
        background: #eee;
    }
}
</style>

