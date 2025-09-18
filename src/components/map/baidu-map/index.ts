import { App } from 'vue';
import BaiduMapComposition from './src/BaiduMapCompositionTS.vue';


const BaiduMapComponent = {
    install: (app: App) => {
        const componentName = (BaiduMapComposition as any).name || 'BaiduMap';
        app.component(componentName, BaiduMapComposition);
    }
};

export default BaiduMapComponent;

export const BaiduMap = BaiduMapComposition;
