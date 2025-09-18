import SideMenuComposition from './src/SideMenuComposition.vue';


const components = [
    {
        name: 'SideMenu',
        value: SideMenuComposition
    }
];

const install = (app) => {
    components.forEach(d => {
        app.component(d[ 'name' ], d[ 'value' ]);
    });
};

export default { install };

export const SideMenu = SideMenuComposition;
