<script setup>
import { nextTick } from 'vue';
const model = defineModel({ type: Number, default: 1 });
const mute = defineModel('mute', { type: Boolean, default: false });

const props = defineProps({
    disabled: {
        type: [ Boolean, String ],
        default: false
    }
});

const emits = defineEmits([ 'volume', 'mute' ]);

const eventVolume = () => {
    if (props.disabled) {
        return;
    }
    emits('volume', model.value);
};

const eventMute = async () => {
    if (props.disabled) {
        return;
    }
    mute.value = !mute.value;
    await nextTick();
    if (mute.value) {
        model.value = 0;
    } else {
        model.value = 1;
    }
    emits('mute', mute.value);
    eventVolume();
};
</script>

<template>
<div :class="{ 'player-disabled': props.disabled }" class="player-volume">
    <div :class="{ 'is-muted': mute, 'player-disabled': props.disabled }" class="volume-control" title="音量" @click.stop="eventMute">音量</div>
    <div class="volume-slider">
        <span class="volume-value">{{ model * 100 }}</span>
        <input v-model.number="model" :max="1" :min="0" :step="0.1" type="range" @input="eventVolume">
    </div>
</div>
</template>

<style lang="scss">
.player-volume {
    --controller-size: var(--media-controller-size, 24px);

    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: var(--controller-size);
    min-height: var(--controller-size);
    padding: 0 5px;
    cursor: pointer;

    .volume-control {
        position: relative;
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
            background: var(--player-icon-volume) no-repeat;
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

        &.is-muted {
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

    .volume-slider {
        position: absolute;
        bottom: 100%;
        left: 50%;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 32px;
        padding: 5px 0;
        background: #fff;
        display: none;
        transform: translateX(-50%);

        .volume-value {
            margin-bottom: 3px;
            font-size: 12px;
        }

        input[type="range"] {
            height: 80px;
            width: 2px;
            background: rgba(50, 123, 198, .5);
            border-radius: 2px;
            outline: none;
            writing-mode: vertical-lr;
            direction: rtl;

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 12px;
                height: 12px;
                background: #fff;
                border-radius: 50%;
                cursor: pointer;
            }
        }
    }

    &:not(.player-disabled):hover {
        .volume-slider {
            display: flex;
        }
    }
}
</style>
