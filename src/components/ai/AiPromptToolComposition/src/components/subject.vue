<script setup>
import { usePromptSubjectStore } from '../store';


const store = usePromptSubjectStore();

const eventClick = (e) => {
    store.getSelection(e.target);
};

const eventBlur = () => {
    store.translate();
};

const eventKeydown = (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        store.translate();
    }
};

const eventKeyup = (e) => {
    store.getSelection(e.target);
};

const eventCheckPrompt = (value) => {
    store.checkPrompt(value);
};
</script>

<template>
<el-form class="prompt-subject" label-position="top">
    <el-form-item>
        <el-input v-model="store.subject" :autosize="{ minRows: 2, maxRows: 10 }" placeholder="主体" resize="none" type="textarea" @click="eventClick" @blur="eventBlur" @keydown="eventKeydown" @keyup="eventKeyup"></el-input>
        <div class="translate">
            <el-check-tag v-for="(item, index) in store.translateResult" :key="index" :checked="store.checkedResult?.includes(item.value)" size="small" @click="eventCheckPrompt(item.value)">
                {{ item.value }}
            </el-check-tag>
        </div>
    </el-form-item>
</el-form>
</template>

<style lang="scss">
.prompt-subject {
    margin-bottom: 8px;

    .translate {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 5px;
    }
}
</style>