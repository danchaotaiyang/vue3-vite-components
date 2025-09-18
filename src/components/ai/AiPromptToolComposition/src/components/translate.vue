<script setup>
import { Promotion } from '@element-plus/icons-vue';
import { usePromptTranslateStore } from '../store';
import PromptPanel from '../components/Panel.vue';
import { ref } from 'vue';


const store = usePromptTranslateStore();

const props = {
    activeText: '英 → 中',
    inactiveText: '中 → 英',
    inlinePrompt: true
};

const reverse = ref(false);
const keywords = ref('');
const result = ref('');

const eventTranslate = async () => {
    if (!keywords.value) {
        return;
    }
    let from = 'zh';
    let to = 'en';
    if (reverse.value) {
        from = 'en';
        to = 'zh';
    }
    try {
        result.value = await store.translate(keywords.value, from, to);
    } catch (e) {
        console.warn(e);
    }
};
</script>

<template>
<prompt-panel title="翻译提示词">
    <div class="body">
        <div class="input">
            <el-input v-model="keywords" :autosize="{ minRows: 2, maxRows: 12 }" :maxlength="800" clearable placeholder="多个词可用换行、中文逗号或英文逗号分隔" resize="none" show-word-limit type="textarea"></el-input>
        </div>
        <div class="input">
            <el-input v-model="result" :autosize="{ minRows: 2, maxRows: 12 }" clearable placeholder="" resize="none" type="textarea"></el-input>
        </div>
    </div>
    <template #head>
    <div class="head">
        <el-switch v-model="reverse" class="parameter-switch-control" style="--el-switch-on-color: #ff4949; --el-switch-off-color: #13ce66" v-bind="props" />
        <div>
            <el-button :icon="Promotion" type="primary" @click="eventTranslate">翻译</el-button>
        </div>
    </div>
    </template>
</prompt-panel>
</template>

<style lang="scss" scoped>
.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.body {
    display: grid;
    grid-gap: 8px;
    grid-template-columns: repeat(2, 1fr);

    .input {
        flex: 1 0 0;
    }
}

.foot {
    .tip {
        line-height: 1;
    }
}
</style>