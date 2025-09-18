export default {
    path: '/ai',
    name: 'ExampleAi',
    meta: {
        order: 1,
        title: 'Ai'
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/ai/prompt',
            name: 'ExampleAiPrompt',
            meta: {
                title: '提示词'
            },
            component: () => import('../../views/example/ai/prompt.vue')
        }
    ]
};
