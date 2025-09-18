export default {
    path: '/map',
    name: 'ExampleMap',
    meta: {
        order: 1,
        title: 'Map'
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/map/baidu',
            name: 'ExampleMapBaiDu',
            meta: {
                title: '百度地图'
            },
            component: () => import('../../views/example/map/baidu.vue')
        }
    ]
};
