export default {
    path: '/gsap',
    name: 'ExampleGSAP',
    meta: {
        order: 2,
        title: 'GSAP'
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/gsap/roll-number',
            name: 'ExampleGSAPRollNumber',
            meta: {
                title: '滚动数字'
            },
            component: () => import('../../views/example/gsap/roll-number.vue')
        }
    ]
};
