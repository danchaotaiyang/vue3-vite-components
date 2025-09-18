export default {
    path: '/monaco',
    name: 'ExampleMonaco',
    meta: {
        order: 6,
        title: 'Monaco',
    },
    redirect: { name: 'Home' },
    children: [
        {
            path: '/monaco/editor',
            name: 'ExampleMonacoEditor',
            meta: {
                title: '编辑器'
            },
            component: () => import('../../views/example/monaco-editor/monaco-editor.vue')
        }
    ]
}
