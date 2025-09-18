<script setup>
import AudioPlayer from '@/components/player/src/AudioPlayer.vue';
import VideoPlayer from '@/components/player/src/VideoPlayer.vue';
</script>

<template>
<div>
    <div class="player">
        <audio-player src="/static/video/oceans.mp4"></audio-player>
    </div>
    <div class="player">
        <video-player src="/static/video/oceans.mp4"></video-player>
    </div>
</div>
</template>

<style lang="scss" scoped>
.player {
    padding: 20px;
}
</style>
