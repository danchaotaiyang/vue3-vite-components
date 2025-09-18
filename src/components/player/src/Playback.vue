<script setup>
import { ref, watch } from 'vue';
import ProgressTime from './ProgressTime.vue';
import ProgressBar from './ProgressBar.vue';
import Play from './Play.vue';
import Volume from './Volume.vue';
import Download from './Download.vue';


const model = defineModel({ type: String, default: 'stop' });

const props = defineProps({
    currentTime: {
        type: String,
        default: '00:00:00'
    },
    durationTime: {
        type: String,
        default: '00:00:00'
    },
    progress: {
        type: Number,
        default: 0
    },
    volume: {
        type: Number,
        default: 1
    },
    mute: {
        type: Boolean,
        default: false
    },
    error: {
        type: [ String, Boolean ]
    },
    enableTime: {
        type: Boolean,
        default: true
    },
    enableSeek: {
        type: Boolean,
        default: true
    },
    enableVolume: {
        type: Boolean,
        default: true
    },
    enableDownload: {
        type: Boolean,
        default: true
    }
});

const emits = defineEmits([ 'play', 'pause', 'seek', 'volume', 'mute', 'download' ]);

const state = ref('stop');
const volume = ref(1);
const muted = ref(false);

const eventPlay = () => {
    state.value = 'playing';
    emits('play');
};

const eventPause = () => {
    state.value = 'pause';
    emits('pause');
};

const eventSeek = (value) => {
    emits('seek', value);
};

const eventVolume = (value) => {
    emits('volume', value);
};

const eventMute = () => {
    muted.value = !muted.value;
    emits('mute', muted.value);
    if (muted.value) {
        eventVolume(0);
    } else {
        eventVolume(1);
    }
};

const eventDownload = () => {
    emits('download');
};

watch(() => model.value, () => {
    state.value = model.value;
}, { immediate: true });

watch(() => props.volume, () => {
    volume.value = props.volume;
}, { immediate: true });

watch(() => props.mute, () => {
    muted.value = props.mute;
}, { immediate: true });
</script>

<template>
<div class="player-playback">
    <div class="player-controls">
        <div class="player-controller" title="播放/暂停">
            <play v-model="state" :disabled="props.error" @pause="eventPause" @play="eventPlay"></play>
        </div>
        <div v-if="props.enableTime" title="时间">
            <progress-time :current="props.currentTime" :disabled="props.error" :duration="props.durationTime"></progress-time>
        </div>
    </div>
    <div v-if="props.enableSeek && !props.error" class="player-progress" title="进度">
        <progress-bar v-model="props.progress" :disabled="props.error" @seek="eventSeek"></progress-bar>
    </div>
    <div class="player-controls">
        <div v-if="props.enableVolume" class="player-controller" title="音量">
            <volume v-model="volume" v-model:mute="muted" :disabled="props.error" @volume="eventVolume" @mute="eventMute"></volume>
        </div>
        <div v-if="props.enableDownload" class="player-controller" title="下载">
            <download :disabled="props.error" @download="eventDownload"></download>
        </div>
    </div>
    <div v-if="typeof props.error === 'string'" class="player-error">{{ props.error }}</div>
</div>
</template>

<style lang="scss">
.player-playback {
    position: relative;
    z-index: 10;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
}

.player-controls {
    display: flex;
    align-items: center;
}

.player-controller {
    display: flex;
    justify-content: center;
    align-items: center;
}

.player-progress {
    flex: 1 0 0;
    display: flex;
    align-items: stretch;
}

.player-error {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: red;
}
</style>
