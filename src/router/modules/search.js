export default {
    path: '/search',
    name: 'ExampleSearch',
    meta: {
        order: 5,
        title: 'Search'
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/search/search',
            name: 'ExampleSearchSearch',
            meta: {
                title: '查询组件'
            },
            component: () => import('../../views/example/search/search.vue?chunk-name=ExampleSearchSearch')
        }
    ]
}
