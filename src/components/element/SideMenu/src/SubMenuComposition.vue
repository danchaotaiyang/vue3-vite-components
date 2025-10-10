<script setup>
import { computed, inject } from 'vue';


const { SubMenu } = inject('SubMenu');

const props = defineProps({
    data: {
        type: Object,
        default: () => ({})
    },
    prop: {
        type: Object,
        default: () => ({
            label: 'label',
            value: 'value',
            children: 'children',
            description: 'description',
            updated: 'updated'
        })
    }
});

const menu = computed(() => {
    return props.data;
});

const hasSubMenu = computed(() => {
    return Array.isArray(menu.value[ 'children' ]) && menu.value[ 'children' ].length;
});
</script>

<template>
<el-sub-menu v-if="hasSubMenu" :index="menu[ props.prop[ 'value' ] ]">
    <template #title>{{ menu[ props.prop[ 'label' ] ] }}</template>
    <template v-for="(item, index) in menu[ props.prop[ 'children' ] ]" :key="index">
    <SubMenu :data="item"></SubMenu>
    </template>
</el-sub-menu>
<el-tooltip v-else :content="menu[ props.prop[ 'description' ] ]" :disabled="!menu[ props.prop[ 'description' ] ]" placement="right" raw-content>
    <el-menu-item :index="menu[ props.prop[ 'value' ] ]">{{ menu[ props.prop[ 'label' ] ] }}</el-menu-item>
</el-tooltip>
</template>

<style lang="scss">
.el-menu-item {
    margin-bottom: 0;

    &.is-active {
        font-weight: bold;
        color: var(--el-menu-active-color);
    }
}
</style>
