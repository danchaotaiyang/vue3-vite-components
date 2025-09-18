<script setup>
import { computed } from 'vue';


const model = defineModel({
    type: String,
    default: 'stop'
});

const props = defineProps({
    disabled: {
        type: [ Boolean, String ],
        default: false
    }
});

const isPlaying = computed(() => {
    return model.value === 'playing';
});

const emits = defineEmits([ 'play', 'pause' ]);

const eventTogglePlay = () => {
    if (props.disabled) {
        return;
    }
    if (isPlaying.value) {
        emits('pause');
    } else {
        emits('play');
    }
};
</script>

<template>
<div :class="{ 'is-playing': isPlaying, 'player-disabled': props.disabled }" class="player-play" title="播放" @click.stop="eventTogglePlay">播放</div>
</template>

<style lang="scss">
.player-play {
    --controller-size: var(--media-controller-size, 24px);

    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: var(--controller-size);
    min-height: var(--controller-size);
    padding: 0 5px;
    cursor: pointer;

    &:before,
    &:after {
        content: "";
        position: absolute;
        width: var(--controller-size);
        height: var(--controller-size);
        margin: 0;
        background: var(--player-icon-play) no-repeat;
        transition: opacity .5s ease;
    }

    &:before {
        background-position: 0 0;
    }

    &:after {
        background-position: 0 100%;
        opacity: 0;
    }

    &:not(.player-disabled):hover {
        &:before {
            opacity: 0;
        }

        &:after {
            opacity: 1;
        }
    }

    &.is-playing {
        &:before {
            background-position: 100% 0;
        }

        &:after {
            background-position: 100% 100%;
        }
    }

    &.player-disabled {
        opacity: .3;
        cursor: not-allowed;
    }
}
</style>
