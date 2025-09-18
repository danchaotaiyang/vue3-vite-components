<script setup>
import { QuestionFilled } from '@element-plus/icons-vue';
import { usePromptParameterStore } from '../store';
import PromptPanel from '../components/Panel.vue';


const store = usePromptParameterStore();

const querySearch = (queryString, callback, restaurants) => {
    let results = restaurants;
    if (queryString) {
        results = restaurants.filter(d => d.indexOf(queryString) === 0);
    }
    callback(results.map(d => {
        return { label: d, value: d };
    }));
};
</script>

<template>
<prompt-panel>
    <el-form label-position="top" class="prompt-parameter">
        <div v-for="(item, index) in store.parameters" :key="index" class="parameter-group">
            <template v-for="(d, i) in item" :key="i">
            <el-form-item v-if="d.visible" :label="d.label" class="parameter-item">
                <div class="el-input el-input--small el-input-group el-input--suffix el-input-group--prepend el-input-group--append">
                    <div class="el-input-group__prepend">
                        <el-checkbox v-model="d.active" size="large"></el-checkbox>
                    </div>
                    <div class="el-input__wrapper" :style="{ '--width': d.width }" tabindex="-1">

                        <template v-if="d.type === 'input'">
                        <el-input v-model="d.value" class="parameter-input" clearable v-bind="d.props">
                            <template #prefix>
                            <span>{{ d.parameter }}</span>
                            </template>
                            <template v-if="d.suffix" #suffix>
                            <span>{{ d.suffix }}</span>
                            </template>
                        </el-input>
                        </template>

                        <template v-if="d.type === 'autocomplete'">
                        <el-autocomplete v-model="d.value" :fetch-suggestions="(q, c) => querySearch(q, c, d.options)" clearable v-bind="d.props" popper-class="prompt-autocomplete">
                            <template #prefix>
                            <span>{{ d.parameter }}</span>
                            </template>
                            <template v-if="d.suffix" #suffix>
                            <span>{{ d.suffix }}</span>
                            </template>
                        </el-autocomplete>
                        </template>

                        <template v-if="d.type === 'input-number'">
                        <el-input-number v-model="d.value" class="parameter-input-number" controls-position="right" v-bind="d.props">
                            <template #prefix>
                            <span>{{ d.parameter }}</span>
                            </template>
                            <template v-if="d.suffix" #suffix>
                            <span>{{ d.suffix }}</span>
                            </template>
                        </el-input-number>
                        </template>

                        <template v-if="d.type === 'slider'">
                        <div class="parameter-value">
                            <span v-if="d.parameter" class="el-input__prefix"><span class="el-input__prefix-inner"><span>{{ d.parameter }}</span></span></span>
                            <div class="value"><el-slider v-model="d.value" v-bind="d.props" /></div>
                        </div>
                        </template>

                        <template v-if="d.type === 'switch'">
                        <div class="parameter-value">
                            <span v-if="d.parameter" class="el-input__prefix"><span class="el-input__prefix-inner"><span>{{ d.parameter }}</span></span></span>
                            <el-switch v-model="d.value" v-bind="d.props" style="--el-switch-off-color: #bbbbbb" />
                        </div>
                        </template>

                    </div>
                    <div class="el-input-group__append">
                        <el-icon>
                            <QuestionFilled />
                        </el-icon>
                    </div>
                </div>
            </el-form-item>
            </template>
        </div>
    </el-form>
</prompt-panel>
</template>

<style lang="scss">
@use "sass:math";

.prompt-parameter {
    position: relative;
    background: #f6f6f6;

    .el-input__wrapper {
        display: flex;
        align-items: center;
        border-radius: 0;
        width: var(--width, 160px);
        padding: 0;

        .el-input__wrapper {
            padding: 0 5px;
            --el-input-heigh: 28px;
        }
    }

    .el-input-number--small {
        width: 100%;
    }

    .el-input__prefix-inner > :last-child {
        margin: 0 4px;
        line-height: 1;
        transform: translateY(-1px);
    }

    .parameter-group {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .parameter-value {
            display: flex;
            align-items: center;
            width: 100%;
            box-sizing: border-box;

            .value {
                flex: 1 0 0;
                padding: 0 12px 0 8px;
            }
        }
    }
}
</style>