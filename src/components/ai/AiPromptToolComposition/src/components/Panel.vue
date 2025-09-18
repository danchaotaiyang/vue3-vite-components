<script setup>
import { useSlots } from 'vue';


const slots = useSlots();

defineOptions({
    name: 'PromptPanel'
});

const props = defineProps({
    title: {
        type: String,
        default: ''
    }
});
</script>

<template>
<div class="prompt-panel">
    <div v-if="props.title || slots.head" class="prompt-panel-head">
        <div v-if="props.title" class="title">{{ props.title }}</div>
        <div v-if="slots.head" class="slot-head">
            <slot name="head"></slot>
        </div>
    </div>
    <div v-if="slots.default" class="prompt-panel-body">
        <slot></slot>
    </div>
    <div v-if="slots.foot" class="prompt-panel-foot">
        <slot name="foot"></slot>
    </div>
</div>
</template>

<style lang="scss" scoped>
.prompt-panel {
    position: relative;
    padding: 4px;
    background: #f3f3f3;

    .prompt-panel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px;
        line-height: 1;

        .title {
            padding-right: 5px;
            font-size: 13px;
            line-height: 1;
        }

        .slot-head {
            flex: 1 0 0;
        }
    }

    .prompt-panel-body {
        padding: 4px;
    }

    .prompt-panel-foot {
        padding: 4px;
    }
}
</style>