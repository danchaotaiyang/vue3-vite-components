import { createRouter, createWebHistory } from 'vue-router';
import errorRouters from './error.js';


const modules = import.meta.glob('./modules/**/*.js', { eager: true });
const routerModules = [];
for (const key in modules) {
    let module = modules[ key ];
    module = module.default || {};
    let routers = Array.isArray(module) ? [ ...module ] : [ module ];
    routerModules.push(...routers);
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...errorRouters
    ]
});

export const routes = routerModules
    .sort((a, b) => {
        return a.meta.order - b.meta.order;
    })
    .map(d => {
        router.addRoute(d);
        return d;
    });

export const defaultRouterName = routes[ 0 ].name;

export default router;
