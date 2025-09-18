<script setup>
import { ref } from 'vue';
import { Search } from '@/components/search';
import Axios from 'axios';


const searchRef = ref();
const loading = ref(false);
const params = ref({});
const result = ref([]);

const api = (data) => Axios.post('', data);

const dispatchSearch = () => {
    searchRef.value.search();
};
const success = (data) => {
    console.log('请求成功', data);
};
const error = (err) => {
    console.warn('请求异常', err.message);
};
const complete = () => {
    console.log('请求结束');
};
</script>

<template>
<div class="wrap">
    <el-button @click.stop="dispatchSearch">查询</el-button>
    <Search ref="searchRef" v-model="result" v-model:loading="loading" v-model:params="params" :api="api" :on-complete="complete" :on-error="error" :on-success="success" debug>
        <el-table :data="result">
            <el-table-column label="Date" prop="date" width="180" />
            <el-table-column label="Name" prop="name" width="180" />
            <el-table-column label="Address" prop="address" />
        </el-table>
    </Search>
</div>
</template>

<style lang="scss" scoped>
.wrap {
    height: 100vh;
    padding: 50px;
    box-sizing: border-box;
}
</style>
