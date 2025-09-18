<script setup>
import { version, computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { routes } from '@/router';
import { SideMenu } from '@/components/element/SideMenu';


const route = useRoute();
const scrollBar = ref();
const asideRef = ref();

const menu = computed(() => {
    return routes.filter((d) => d[ 'meta' ]).map((d) => setItem(d));
});

const setItem = ({ meta, path, children }) => {

    const item = {
        label: meta[ 'title' ],
        value: path
    };

    if (Array.isArray(children) && children.length) {
        item[ 'children' ] = children.filter((d) => d[ 'meta' ]).map((d) => setItem(d));
    }

    return item;
};

const getMenuWidth = () => {
    nextTick(() => {
        sessionStorage.setItem('menu-width', asideRef.value.clientWidth);
    });
};

const setScrollTop = (top = 0) => {
    scrollBar.value.setScrollTop(top);
};

onMounted(() => {
    getMenuWidth();
});

watch(() => route.path, () => {
    setScrollTop();
});

document.title = `Vue Components (${ version })`;

</script>

<template>
<div class="app-wrap">
    <div ref="asideRef" class="aside">
        <div class="logo">
            <div class="brand">
                <svg viewBox="0 0 128 128" width="24" height="24" data-v-35dc6318=""><path fill="#42b883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z" data-v-35dc6318=""></path><path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z" data-v-35dc6318=""></path></svg>
                <span>Vue Components</span>
            </div>
        </div>
        <div class="official">
            <ul>
                <li><a href="https://cn.vitejs.dev/" target="_blank">Vite</a></li>
                <li><a href="https://cn.vuejs.org/" target="_blank">Vue</a></li>
                <li><a href="https://router.vuejs.org/zh/" target="_blank">Router</a></li>
                <li><a href="https://github.com/vuejs/rfcs/tree/master/active-rfcs" target="_blank">rfcs</a></li>
            </ul>
        </div>
        <div class="navigation">
            <div class="full-container">
                <el-scrollbar>
                    <side-menu :data="menu"></side-menu>
                </el-scrollbar>
            </div>
        </div>
    </div>
    <div class="views">
        <div class="full-container">
            <router-view v-slot="{ Component }">
                <transition mode="out-in" appear>
                    <suspense>
                        <el-scrollbar ref="scrollBar" :min-size="100" always>
                            <component :is="Component"></component>
                        </el-scrollbar>
                        <template #fallback>
                        加载中……
                        </template>
                    </suspense>
                </transition>
            </router-view>
        </div>
    </div>
</div>
</template>

<style lang="scss">
.full-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.app-wrap {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-between;

    .aside {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        min-width: 200px;
        background: rgba(0, 0, 0, .01);
        overflow: hidden;
        //border-right: 1px solid rgba(0, 0, 0, .1);
        //box-shadow: 0 0 8px rgba(0, 0, 0, .2);

        .logo {
            position: relative;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--cesium-green-main);
            padding: 5px;
            line-height: 1;
            border-bottom: 1px solid var(--vt-c-divider-light);
            //box-shadow: 0 0 8px rgba(0, 0, 0, .2);

            .brand {
                display: flex;
                align-items: center;
                font-weight: 500;
                font-size: 16px;
                line-height: 1;

                span {
                    margin-left: 5px;
                }
            }

            .version {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                margin: 1px 3px 0 0;
                padding: 2px 4px;
                background-color: var(--vt-c-bg-soft);
                border-radius: 2px;
                font-size: 12px;
                line-height: 1;
            }
        }

        .official {
            ul {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 0;
                padding: 5px;
                background: var(--vt-c-bg-soft);
                line-height: 1;
                list-style: none;
            }

            a {
                display: inline-block;
                padding: 0 5px;
                font-size: 12px;
                text-align: center;
                color: var(--vt-c-brand);
            }
        }

        .navigation {
            position: relative;
            flex: 1;
        }

        .menu {
            padding: 5px 0 28px;
            border: none;

            .el-menu-item {
                &.is-active {
                    background: var(--vt-c-brand-dark);
                }
            }
        }
    }

    .views {
        flex: 1;
        position: relative;
    }
}
</style>
