import { App } from 'vue';
import BaiduMap from './map/baidu-map/index.ts';


const components = [
    BaiduMap
];

const install = (app: App) => {
    components.forEach(component => {
        app.use(component);
    });
};

export default {
    install
};
