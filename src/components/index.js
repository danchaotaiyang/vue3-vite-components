import BaiduMap from './map/baidu-map/index.js';


const components = [
    BaiduMap
];

const install = (app) => {
    components.forEach(component => {
        app.use(component);
    });
};

export default {
    install
};
