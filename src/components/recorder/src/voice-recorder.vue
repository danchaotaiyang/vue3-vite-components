<script setup>
import { computed, ref } from 'vue';
import { LameRecorder } from '../util/lame';
import { $audioDestroy, $audioPlay } from '../util/howler';


const emits = defineEmits([ 'start', 'stop', 'pause', 'resume', 'send', 'cancel', 'error' ]);

const voice = ref('');
const status = ref('stoped');

const recorder = ref(null);
const isRecording = ref(false);
const isPaused = ref(false);
const duration = ref(0);
const audioUrl = ref('');
const recordTesting = ref(false);
let audioBlob = null;
let audioFile = null;
let animationId = null;

const voiceTime = computed(() => {
    return formatTime(duration.value);
});

const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${ String(minutes).padStart(2, '0') }:${ String(remainingSeconds).padStart(2, '0') }`;
};

const eventRecordStart = async () => {
    if (voice.value) {
        $audioDestroy(voice.value);
        status.value = 'stoped';
        voice.value = '';
    }
    if (isRecording.value) {
        return;
    }
    try {
        recorder.value = new LameRecorder({
            sampleRate: 44100,
            bitRate: 128,
            channels: 1
        });
        await recorder.value.start();
        isRecording.value = true;
        emits('start');

        // 更新状态
        const updateStatus = () => {
            duration.value = recorder.value.getDuration() * 1000;
            animationId = requestAnimationFrame(updateStatus);
        };
        animationId = requestAnimationFrame(updateStatus);
    } catch (error) {
        emits('error', error);
        eventRecordCancel();
        console.warn('录音失败:', error);
        alert('无法访问麦克风，请确保已授予权限。');
    }
};
const eventRecordPause = () => {
    if (!recorder.value || !isRecording.value) return;

    if (isPaused.value) {
        recorder.value.resume();
        isPaused.value = false;
        emits('resume');
    } else {
        recorder.value.pause();
        isPaused.value = true;
        emits('pause');
    }
};
const eventRecordStop = async () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (!recorder.value || !isRecording.value) {
        return;
    }
    try {
        audioBlob = await recorder.value.stop();
        if (audioBlob) {
            audioUrl.value = URL.createObjectURL(audioBlob);
            audioFile = new File([ audioBlob ], 'audio.mp3', { type: audioBlob.type });
        }
        isRecording.value = false;
        isPaused.value = false;
        emits('stop', {
            file: audioFile,
            url: audioUrl.value
        });
    } catch (error) {
        emits('error', error);
        eventRecordCancel();
        console.warn('停止录音失败:', error);
        alert('停止录音失败，请重试。');
    }
};
const eventRecordCancel = async () => {
    try {
        await eventRecordStop();
        if (audioUrl.value) {
            URL.revokeObjectURL(audioUrl.value);
        }
        audioBlob = null;
        audioUrl.value = '';
        duration.value = 0;
        emits('cancel');
    } catch (error) {
        emits('error', error);
        console.warn(error);
    }
};
const eventRecordTesting = () => {
    if (recordTesting.value) {
        $audioDestroy(audioUrl.value);
        recordTesting.value = false;
        return;
    }
    if (!audioUrl.value) {
        console.warn('没有可播放的音频');
        return;
    }
    recordTesting.value = true;
    $audioPlay(audioUrl.value, {
        onPlay: () => {
        },
        onEnd: () => {
            $audioDestroy(audioUrl.value);
            recordTesting.value = false;
        },
        onError: (error) => {
            console.warn('试听失败:', error);
            $audioDestroy(audioUrl.value);
            recordTesting.value = false;
        }
    });
};
const eventRecordSend = async () => {
    try {
        emits('send', audioFile);
    } catch (error) {
        emits('error', error);
        console.warn(error);
    } finally {
        eventRecordCancel();
    }
};
</script>

<template>
<div class="voice-recorder">
    <div class="voice-time">{{ voiceTime }}</div>
    <div v-if="audioUrl" class="recorder-controller voice-audition" @click.stop="eventRecordTesting">{{ recordTesting ? '停止试听' : '试听' }}</div>
    <div v-if="!isRecording && !audioUrl" class="recorder-controller voice-record" @click.stop="eventRecordStart">开始录制</div>
    <div v-if="isRecording" class="recorder-controller voice-record-stop" @click.stop="eventRecordStop">结束录制</div>
    <div v-if="isRecording && !audioUrl" class="recorder-controller voice-pause" @click.stop="eventRecordPause">{{ isPaused ? '继续录制' : '暂停录制' }}</div>
    <div v-if="!isRecording && audioUrl" class="recorder-controller voice-send" @click.stop="eventRecordSend">发送语音</div>
    <div v-if="isRecording || audioUrl" class="recorder-controller voice-cancel" @click.stop="eventRecordCancel">取消</div>
</div>
</template>

<style lang="scss" scoped>
.voice-recorder {
    --controller-size: var(--recorder-controller-size, 24px);

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
    background: #eee;

    .recorder-controller {
        position: relative;
        min-width: var(--controller-size);
        min-height: var(--controller-size);
        padding: 0 10px;
        cursor: pointer;
    }

    .voice-time {
        position: relative;
        padding: 0 10px;
    }
}
</style>
