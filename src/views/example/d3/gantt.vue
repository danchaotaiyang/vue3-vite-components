<script setup>
import { onMounted, ref } from 'vue';
import { Gantt3, Gantt2 } from '@/components/d3/gantt';


let innerWidth = document.body.clientWidth;
let tasks = ref([]);

const fetchData = async () => {
    try {
        const d1 = [
            {
                name: '人事',
                start: new Date(2023, 4, 3),
                end: new Date(2023, 4, 16),
                value: .4
            },
            {
                name: 'CPS产品研发',
                start: new Date(2023, 4, 5),
                end: new Date(2023, 4, 15),
                value: .7
            },
            {
                name: '薪资报表制作',
                start: new Date(2023, 4, 27),
                end: new Date(2023, 5, 2),
                value: .5
            },
            {
                name: '组织架构建立',
                start: new Date(2023, 4, 10),
                end: new Date(2023, 4, 14),
                value: .5
            },
            {
                name: '组织架构建立',
                start: new Date(2023, 5, 5),
                end: new Date(2023, 5, 9),
                value: .8
            },
            {
                name: '薪资规定设定',
                start: new Date(2023, 5, 6),
                end: new Date(2023, 5, 11),
                value: .3
            },
            {
                name: '考勤上线',
                start: new Date(2023, 4, 15),
                end: new Date(2023, 5, 1),
                value: .3
            }
        ];
        const d2 = [
            {
                name: '人事',
                start: new Date(2023, 3, 30),
                end: new Date(2023, 4, 25),
                value: .8
            },
            {
                name: 'CPS产品研发',
                start: new Date(2023, 4, 22),
                end: new Date(2023, 5, 2),
                value: .3
            },
            {
                name: '薪资报表制作',
                start: new Date(2023, 5, 3),
                end: new Date(2023, 5, 17),
                value: .7
            },
            {
                name: '组织架构建立',
                start: new Date(2023, 4, 22),
                end: new Date(2023, 5, 14),
                value: .9
            },
            {
                name: '组织架构建立',
                start: new Date(2023, 4, 5),
                end: new Date(2023, 5, 20),
                value: .3
            },
            {
                name: '薪资规定设定',
                start: new Date(2023, 5, 12),
                end: new Date(2023, 5, 19),
                value: .7
            },
            {
                name: '考勤上线',
                start: new Date(2023, 5, 2),
                end: new Date(2023, 5, 8),
                value: .6
            }
        ];
        const data = Math.random() > .5 ? d1 : d2;
        tasks.value = data.map((d) => {
            d[ 'start' ] = new Date(d[ 'start' ]);
            d[ 'end' ] = new Date(d[ 'end' ]);
            return d;
        });
        setTimeout(() => {
            fetchData();
        }, 5000);
    } catch (e) {
        console.warn(e);
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
<div class="wrap">
    <div class="item">
        <Gantt3 :data="tasks" :main-range="[ 0, innerWidth ]" :cross-range="[ 0, 300 ]" color="#ffffff" :offset-end="3" :width="700" :height="200" :at-last="false" />
    </div>
    <div class="item">
        <Gantt3 :data="tasks" :main-range="[ 0, innerWidth ]" :cross-range="[ 0, 300 ]" color="#ffffff" :offset-end="3" :width="700" :height="200" />
    </div>
    <div class="item">
        <Gantt2 :data="tasks" :main-range="[ 0, innerWidth ]" :cross-range="[ 0, 600 ]" color="#ffffff" :offset-end="3" :width="1426" :at-last="false" />
    </div>
</div>
</template>

<style lang="scss" scoped>
.wrap {
    height: 100vh;
    padding: 50px;
    background: #555;
    box-sizing: border-box;

    .item {
        display: inline-block;
        padding-top: 8px;
        background: rgba(255, 255, 255, .2);
        border: 1px solid rgba(0, 0, 0, .2);
        margin: 0 24px 18px 0;
    }
}
</style>
