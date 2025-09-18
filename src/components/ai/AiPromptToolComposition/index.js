import AiPromptComposition from './src/views/main.vue';


const components = [
    {
        name: 'AiPromptTool',
        value: AiPromptComposition
    }
];

const install = (app) => {
    components.forEach(d => {
        app.component(d[ 'name' ], d[ 'value' ]);
    });
};

export default { install };

export const AiPromptTool = AiPromptComposition;
