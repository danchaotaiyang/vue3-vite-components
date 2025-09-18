<script setup>
import { usePromptResultStore } from '../store';
import PromptPanel from './Panel.vue';


const store = usePromptResultStore();
</script>

<template>
<prompt-panel>
    <el-input v-model="store.result" :autosize="{ minRows: 3, maxRows: 12 }" resize="none" type="textarea" placeholder=""></el-input>
</prompt-panel>
</template>
