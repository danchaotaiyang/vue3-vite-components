export default {
    path: '/uploader',
    name: 'ExampleUploader',
    meta: {
        order: 4,
        title: 'Uploader'
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/uploader/uploader',
            name: 'ExampleUploaderUploader',
            meta: {
                title: '大文件上传'
            },
            component: () => import('../../views/example/uploader/uploader.vue')
        }
    ]
}
