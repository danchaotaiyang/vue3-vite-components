import RollNumberComposition from './RollNumber/src/RollNumberComposition.vue';


const components = [
    {
        name: 'RollNumber',
        value: RollNumberComposition
    }
];

const install = (app) => {
    components.forEach((d) => {
        app.component(d[ 'name' ], d[ 'value' ]);
    });
};

export default { install };

export const RollNumber = RollNumberComposition;
