const modules = import.meta.glob('./src/*.vue', { eager: true });

const componentsModules = [];

for (const key in modules) {

    let module = modules[ key ];

    componentsModules.push(module.default);
}

const install = (app) => {

    componentsModules.forEach(component => {

        let { name, __name } = component;

        if (!name) {
            name = __name;
        }

        if (name) {
            app.component(name, component);
        }
    });
};

export default { install };

