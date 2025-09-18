import SearchComposition from './src/SearchComposition.vue';


const components = [
    {
        name: 'Search',
        value: SearchComposition
    }
];

const install = (app) => {
    components.forEach((d) => {
        app.component(d[ 'name' ], d[ 'value' ]);
    });
};

export default { install };

export const Search = SearchComposition;
