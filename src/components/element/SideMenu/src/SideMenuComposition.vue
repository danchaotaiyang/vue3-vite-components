<script setup>
import { computed, provide } from 'vue';
import { useRoute } from 'vue-router';
import SubMenu from './SubMenu.vue';


provide('SubMenu', { SubMenu });

const props = defineProps({
    data: {
        type: Array,
        default: () => ([])
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

const route = useRoute();

const menu = computed(() => {
    return props.data;
});
</script>

<template>
<el-menu :default-active="route.path" class="side-menu" router>
    <template v-for="(item, index) in menu" :key="index">
    <SubMenu :data="item" :prop="prop" :parent="item"></SubMenu>
    </template>
</el-menu>
</template>

<style lang="scss" scoped>
.side-menu {
    padding: 5px 0 28px;
    border: none;
}
</style>
