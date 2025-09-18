<script setup>
import { usePromptDetailsStore } from '../store';


const store = usePromptDetailsStore();

const eventTranslate = (item) => {
    store.translate(item);
};

const eventCheckPrompt = (data, value) => {
    store.checkPrompt(data, value);
};
</script>

<template>
<el-form class="prompt-details" label-position="top">
    <template v-for="(item, index) in store.details" :key="index">
    <div class="details-item">
        <el-form-item v-if="item.visible">
            <el-input v-model="item.value" class="input-with-select" @blur="eventTranslate(item)">
                <template #prepend>
                <el-popover placement="bottom-start">
                    <div>

                    </div>
                    <template #reference>
                    <div class="label">{{ item.label }}</div>
                    </template>
                </el-popover>
                </template>
                <template #append></template>
            </el-input>
            <div class="translate">
                <el-check-tag v-for="(d, i) in item.translate" :key="i" :checked="item.checked?.includes(d.value)" size="small" @click="eventCheckPrompt(item, d.value)">
                    {{ d.value }}
                </el-check-tag>
            </div>
        </el-form-item>
    </div>
    </template>
</el-form>
</template>

<style lang="scss">
.prompt-details {
    .details-item {
        margin-bottom: 8px;

        .label {
            width: 70px;
        }
    }

    .translate {
        display: flex;
        gap: 5px;
        margin-top: 5px;
    }
}
</style>
