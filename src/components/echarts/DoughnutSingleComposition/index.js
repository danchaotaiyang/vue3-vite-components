import DoughnutSingleComposition from './src/DoughnutSingleComposition.vue';


const components = [
    {
        name: 'DoughnutSingleComposition',
        value: DoughnutSingleComposition
    }
];

const install = (app) => {
    components.forEach(d => {
        app.component(d[ 'name' ], d[ 'value' ]);
    });
};

export default { install };

export const DoughnutSingle = DoughnutSingleComposition;
