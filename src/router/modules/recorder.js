export default {
    path: '/recorder',
    name: 'ExampleRecorder',
    meta: {
        order: 6,
        title: 'Recorder',
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/recorder/voice-recorder',
            name: 'ExampleRecorderVoiceRecorder',
            meta: {
                title: '录音器'
            },
            component: () => import('../../views/example/recorder/voice-recorder.vue')
        }
    ]
}
