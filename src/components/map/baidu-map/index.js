import BaiduMapComposition from './src/BaiduMapComposition.vue';


const BaiduMapComponent = {
    install: (app) => {
        const componentName = BaiduMapComposition.name || 'BaiduMap';
        app.component(componentName, BaiduMapComposition);
    }
};

export default BaiduMapComponent;

export const BaiduMap = BaiduMapComposition;
