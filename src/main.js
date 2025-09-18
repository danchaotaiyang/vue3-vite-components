import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import router from './router';
import App from './App.vue';

import 'element-plus/dist/index.css';
import './assets/css/base.css';
import './assets/css/main.scss';


const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(ElementPlus, { locale: zhCn, size: 'small' });
app.mount('#app');

app.config.errorHandler = (err, instance, info) => {
    console.error("全局捕获的 Vue 错误:", err, "\n发生位置:", info);
};