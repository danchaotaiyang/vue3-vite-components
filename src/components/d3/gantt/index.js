import GanttComposition from './src/GanttComposition.vue';
import GanttOptions from './src/GanttOptions.vue';


const components = [
    {
        name: 'Gantt3',
        value: GanttComposition
    },
    {
        name: 'Gantt2',
        value: GanttOptions
    }
];

const install = (app) => {
    components.forEach((d) => {
        app.component(d[ 'name' ], d[ 'value' ]);
    });
};

export default { install };

export const Gantt3 = GanttComposition;

export const Gantt2 = GanttOptions;
