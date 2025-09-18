<script setup>
const model = defineModel({ type: Number, default: 0 });

const emits = defineEmits([ 'seek' ]);

const props = defineProps({
    disabled: {
        type: [ Boolean, String ],
        default: false
    }
});

const eventSeek = (event) => {
    if (props.disabled) {
        return;
    }
    const rect = event.target.getBoundingClientRect();
    emits('seek', event.offsetX / rect.width);
};
</script>

<template>
<div :class="{ 'player-disabled': props.disabled }" class="player-progress-bar">
    <div @click.stop="eventSeek" class="progress-wrap">
        <div class="progress-container">
            <div :style="{ width: `${ model * 100 }%` }" class="progress-value"></div>
        </div>
    </div>
</div>
</template>

<style lang="scss">
.player-progress-bar {
    flex: 1 0 0;
    display: flex;
    align-items: stretch;
    padding: 0 10px;

    .progress-wrap {
        position: relative;
        z-index: 10;
        flex: 1 0 0;
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0;
        cursor: pointer;
    }

    .progress-container {
        position: relative;
        width: 100%;
        height: 4px;
        background: #ddd;
        overflow: hidden;

        .progress-value {
            position: relative;
            top: 0;
            left: 0;
            height: 100%;
            background: #bbb;
            overflow: hidden;
            pointer-events: none;
            transition: width 0.2s linear;

            &:before {
                content: "";
                position: absolute;
                top: 0;
                right: 0;
                display: block;
                width: 20px;
                height: 100%;
                background: linear-gradient(to right, #bbb, #666);
            }
        }
    }

    &.player-disabled {
        .progress-wrap {
            opacity: .3;
            cursor: not-allowed;
        }
    }
}
</style>
