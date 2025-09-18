export default {
    path: '/d3',
    name: 'ExampleD3',
    meta: {
        order: 1,
        title: 'D3'
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/d3/gantt',
            name: 'ExampleD3Gantt',
            meta: {
                title: '甘特图'
            },
            component: () => import('../../views/example/d3/gantt.vue')
        },
        {
            path: '/d3/sound-view',
            name: 'ExampleD3SoundView',
            meta: {
                title: '音频可视化'
            },
            component: () => import('../../views/example/d3/sound-view.vue')
        }
    ]
};
