import SoundVComposition from './src/SoundVCompositionWorker.vue';

const components = [
    {
        name: 'SoundV',
        value: SoundVComposition
    }
];

const install = (app) => {
    components.forEach((d) => {
        app.component(d[ 'name' ], d[ 'value' ]);
    })
}

export default { install };

export const SoundV = SoundVComposition;