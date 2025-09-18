<script setup>
import { onMounted, ref } from 'vue';
import { SoundV } from '@/components/d3/sound-view';


const source = ref('');

onMounted(() => {
    setTimeout(() => {
        source.value = 'http://10.0.10.142/hls1/197.m3u8';
    }, 1000);
});
</script>

<template>
<div class="wrap">
<!--    <div class="padding-10">
        <sound-v src="/temp/sound/1分04秒现场手机录音海绵时段20240503_121104.m4a..mp3"></sound-v>
    </div>-->
    <div class="padding-10">
        <sound-v src="/temp/sound/b8b0cec7b23121d1754684021d445489.mp4"></sound-v>
    </div>
    <div class="padding-10">
        <sound-v src="/temp/sound/a.ogg"></sound-v>
    </div>
    <div class="padding-10">
        <sound-v src="/temp/sound/a.ogg" mode="byteFrequency" :fftSize="32768"></sound-v>
    </div>
    <div class="padding-10">
        <sound-v src="/temp/sound/a.ogg" mode="byteFrequency" :fftSize="32768 / 4"></sound-v>
    </div>
    <div class="padding-10">
        <sound-v src="/temp/sound/b.ogg" mode="byteFrequency"></sound-v>
    </div>
    <div class="padding-10">
        <sound-v src="/temp/sound/a.MP3"></sound-v>
    </div>
<!--    <div class="padding-10">
        <sound-v src="/temp/sound/b.MP3"></sound-v>
    </div>-->
<!--    <div class="padding-10">
        <sound-v :src="source" type="m3u8"></sound-v>
    </div>
    <div class="padding-10">
        <sound-v src="rtsp://10.0.3.21/1" type="m3u8"></sound-v>
    </div>-->
</div>
</template>

<style lang="scss" scoped>
.wrap {
    .padding-10 {
        padding: 10px;
    }
}
</style>