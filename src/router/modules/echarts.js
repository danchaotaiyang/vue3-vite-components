export default {
    path: '/echarts',
    name: 'ExampleEcharts',
    meta: {
        order: 3,
        title: 'Echarts'
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/echarts/doughnutSingle',
            name: 'ExampleEchartsDoughnutSingle',
            meta: {
                title: '单值环图'
            },
            component: () => import('../../views/example/echarts/doughnut-single.vue')
        }
    ]
};
