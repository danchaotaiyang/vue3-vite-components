<script setup>
const props = defineProps({
    current: {
        type: String,
        default: '00:00:00'
    },
    duration: {
        type: String,
        default: '00:00:00'
    },
    disabled: {
        type: [ Boolean, String ],
        default: false
    }
});
</script>

<template>
<div :class="[ props.disabled ? 'player-disabled' : '' ]" class="player-progress-time">
    <div class="player-time">{{ props.current }}</div>
    <span class="player-separator"> / </span>
    <div class="player-time">{{ props.duration }}</div>
</div>
</template>

<style lang="scss">
.player-progress-time {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 5px;

    &.player-disabled {
        opacity: .3;
    }
}

.player-time {
    flex: 1 0 0;
    min-width: 3em;
    text-align: center;
}

.player-separator {
    margin: 0 5px;
    font-size: 10px;
    opacity: .5;
}
</style>
