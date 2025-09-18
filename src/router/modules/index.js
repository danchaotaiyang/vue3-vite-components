export default {
    path: '/',
    name: 'Home',
    meta: {
        order: 0,
        title: '开始'
    },
    component: () => import('../../views/Home.vue')
};
