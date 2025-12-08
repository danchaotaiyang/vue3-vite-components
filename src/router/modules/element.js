export default {
    path: '/element',
    name: 'ExampleElement',
    meta: {
        order: 1,
        title: 'Element'
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/element/date-picker',
            name: 'ElementDatePicker',
            meta: {
                title: '日期选择'
            },
            component: () => import('../../views/example/element/date-picker.vue')
        }
    ]
};
