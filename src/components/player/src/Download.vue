<script setup>
const props = defineProps({
    disabled: {
        type: [ Boolean, String ],
        default: false
    }
});

const emits = defineEmits([ 'download', 'pause' ]);

const eventDownload = () => {
    if (props.disabled) {
        return;
    }
    emits('download');
};
</script>

<template>
<div :class="{ 'player-disabled': props.disabled }" class="player-download" title="下载" @click.stop="eventDownload">下载</div>
</template>

<style lang="scss">
.player-download {
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
        background: var(--player-icon-download) no-repeat;
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

    &.player-disabled {
        opacity: .3;
        cursor: not-allowed;
    }
}
</style>
