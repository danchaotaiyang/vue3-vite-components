import DatePickerComposition from './src/DatePickerComposition.vue';


const components = [
    {
        name: 'DatePicker',
        value: DatePickerComposition
    }
];

const install = (app) => {
    components.forEach(d => {
        app.component(d[ 'name' ], d[ 'value' ]);
    });
};

export default { install };

export const DatePicker = DatePickerComposition;
