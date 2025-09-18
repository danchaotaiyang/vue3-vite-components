const modules = import.meta.glob('./src/*.js', { eager: true });

const directivesModules = [];

for (const key in modules) {

    let module = modules[ key ];

    directivesModules.push(module.default);
}

const install = (app) => {

    directivesModules.forEach(directive => {

        let { name, __name } = directive;

        if (!name) {
            name = __name;
        }

        if (name) {
            app.directive(name, directive);
        }
    });
};

export default { install };

