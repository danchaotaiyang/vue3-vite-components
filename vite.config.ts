import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        dts({
            include: [ 'src/components/**/*.vue', 'src/components/**/*.ts' ],
            outDir: 'dist',
            rollupTypes: true,
            staticImport: true,
            cleanVueFileName: true,
            insertTypesEntry: true
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        lib: {
            entry: 'src/components/index.ts',
            name: 'CustomComponents',
            fileName: (format) => `index.${ format }.js`
        },
        rollupOptions: {
            external: [ 'vue' ],
            output: {
                globals: {
                    vue: 'Vue'
                },
                exports: 'default', // 单独输出 CSS 文件
                assetFileNames: (assetInfo) => {
                    // return assetInfo.name
                    return 'index.css';
                }
            }
        }
    },
    server: {
        port: 8888,
        proxy: {
            '^/api': {
                target: 'http://localhost:5000'
            }
        }
    }
});
