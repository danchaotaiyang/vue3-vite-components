<script setup>
import { ref } from 'vue';
import { RollNumber } from '@/components/gsap';


const rollNumber = ref(0);

</script>

<template>
<div class="wrap">
    <div class="padding-bottom-10">
        <RollNumber :value="rollNumber" :duration="1" font-size="100px" :font-weight="300" :spacing="5" roll number-class="number" digit-class="item" />
    </div>
    <div class="padding-bottom-10">
        <RollNumber :value="rollNumber" :duration="1" font-size="100px" :spacing="5" number-class="number" digit-class="item" />
    </div>
    <div class="padding-bottom-10">
        <RollNumber :value="rollNumber" :duration="3" font-size="100px" :font-weight="700" roll :spacing="5" number-class="number" digit-class="item" />
    </div>
    <div class="padding-bottom-10">
        <RollNumber :value="rollNumber" :duration="3" font-size="100px" :font-weight="900" :spacing="5" number-class="number" digit-class="item" />
    </div>
    <div class="padding-bottom-10">
        <el-input-number v-model="rollNumber" size="small" :min="0" />
    </div>
</div>
</template>

<style scoped lang="scss">
.wrap {
    padding: 50px;

    .roll-number {
        margin-right: 50px;
    }
}
</style>

<style>
.padding-bottom-10 {
    padding-bottom: 10px;
}
</style>
