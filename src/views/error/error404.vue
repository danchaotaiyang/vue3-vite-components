<template>
404
</template>

<script setup>
import { useRouter } from 'vue-router';
import { defaultRouterName } from '@/router';


const router = useRouter();

setTimeout(() => {
    router.replace({ name: defaultRouterName });
}, 3000);
</script>

<style lang="scss" scoped>

</style>
