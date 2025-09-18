<script setup>
import { usePromptMainStore } from '../store';
import { $mitt } from '../utils/mitt.js';
import Subject from '../components/subject.vue';
import Details from '../components/details.vue';
import Result from '../components/result.vue';
import Parameter from '../components/parameter.vue';
// import Translate from '../components/translate.vue';


const store = usePromptMainStore();

window.addEventListener('keydown', async (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        $mitt.emit('combination');
    }
});
</script>

<template>
<div class="prompt">
    <div class="platforms">
        <el-tabs v-model="store.current">
            <el-tab-pane v-for="(item, index) in store.platforms" :key="index" :label="item" :name="item"></el-tab-pane>
        </el-tabs>
    </div>
    <div class="structure">
        <Subject></Subject>
    </div>
    <div class="main">
        <div class="structure">
            <el-scrollbar>
                <Details></Details>
            </el-scrollbar>
        </div>
    </div>
    <div class="parameter" v-if="store.current === 'Midjourney'">
        <Parameter></Parameter>
    </div>
<!--    <div class="translate">
        <Translate></Translate>
    </div>-->
    <div class="result">
        <Result></Result>
    </div>
</div>
</template>

<style lang="scss">
@use "../assets/css/main.scss";
</style>

<style lang="scss">
.prompt {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch;
    box-sizing: border-box;
    width: 100%;
    height: 100vh;
    padding: 10px;
    font-family: "Microsoft YaHei", "Droid Sans", "Helvetica Neue", sans-serif;

    .main {
        flex: 1 0 0;
        position: relative;

        .structure {
            position: absolute;
            inset: 0;
        }
    }

    .translate {
        margin: 4px 0;
    }
}
</style>
