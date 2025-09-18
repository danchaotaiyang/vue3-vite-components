import UploaderComposition from './src/UploaderComposition.vue';


const components = [
    {
        name: 'Uploader',
        value: UploaderComposition
    }
];

const install = (app) => {
    components.forEach((d) => {
        app.component(d[ 'name' ], d[ 'value' ]);
    });
};

export default { install };

export const Uploader = UploaderComposition;
