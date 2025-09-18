export default [
    {
        path: '/:pathMatch(.*)*',
        name: 'Error404',
        meta: { title: '404' },
        component: () => import('../views/error/error404.vue')
    }
];
