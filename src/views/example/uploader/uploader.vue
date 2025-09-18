<script setup>
import { ref } from 'vue';
import { Uploader } from '@/components/uploader';


const uploaderRef = ref();
</script>

<template>
<div class="wrap">
    <uploader ref="uploaderRef" :max-concurrent="5" :chunk-size="1024 * 1024 * 30" :file-size-max="1024 * 1024 * 1024 * 2.5" use-drag action="api/upload/large"></uploader>
</div>
</template>

<style lang="scss" scoped>
.wrap {
    height: 100vh;
    padding: 50px;
    box-sizing: border-box;

    .uploader-pause {
        margin-right: 3px;
    }
}
</style>
