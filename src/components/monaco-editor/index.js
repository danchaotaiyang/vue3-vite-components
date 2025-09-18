import MonacoEditorComposition from './src/MonacoEditor.vue';


const components = [
    {
        name: 'MonacoEditor',
        value: MonacoEditorComposition
    }
];

const install = (app) => {
    components.forEach((d) => {
        app.component(d[ 'name' ], d[ 'value' ]);
    });
};

export default { install };

export const MonacoEditor = MonacoEditorComposition;
