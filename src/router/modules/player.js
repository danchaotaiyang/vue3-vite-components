export default {
    path: '/player',
    name: 'ExamplePlayer',
    meta: {
        order: 6,
        title: 'Player',
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/player/player',
            name: 'ExamplePlayerPlayer',
            meta: {
                title: '播放器'
            },
            component: () => import('../../views/example/player/player.vue')
        }
    ]
}
