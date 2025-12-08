<script lang="ts" setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { Clock } from '@element-plus/icons-vue';
import type { ScrollbarInstance } from 'element-plus';

// 定义值的类型
export type PickerValue = string | number | boolean

export interface PickerColumn<T = PickerValue> {
    data: PickerItem<T>[];
}

export interface PickerItem<T = PickerValue> {
    label: string;
    value: T;
    disabled?: boolean;
    children?: PickerItem<T>[];
}

interface Props<T = PickerValue> {
    modelValue?: T[];
    columns?: PickerColumn<T>[];
    placeholder?: string;
    separator?: string;
    // 是否级联模式
    cascade?: boolean;
    // 级联数据（树形结构）
    cascadeData?: PickerItem<T>[];
    // 是否可清空
    clearable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: '请选择',
    separator: '-',
    cascade: false,
    cascadeData: () => [],
    clearable: true
});

const emit = defineEmits<{
    <T = PickerValue>(e: 'update:modelValue', value: T[]): void
    <T = PickerValue>(e: 'change', value: T[], selectedItems: PickerItem<T>[]): void
}>();

const popoverRef = ref<{ hide: () => void; show: () => void } | null>(null);
const scrollbarRefs = ref<ScrollbarInstance[]>([]);
const showPicker = ref(false);
const selectedIndexes = ref<number[]>([]);
const selectedValues = ref<PickerValue[]>([]);
const selectedItems = ref<PickerItem[]>([]);
const isScrolling = ref(false);
const scrollTimers = ref<Map<number, number>>(new Map());

// 当前显示的列数据（用于级联模式）
const displayColumns = ref<PickerColumn[]>([]);

// 动态计算 popover 宽度
const popoverWidth = computed(() => {
    const columnCount = displayColumns.value.length;
    return Math.max(columnCount * 120, 300);
});

const ITEM_HEIGHT = 34;

// 初始化
const initPicker = () => {
    if (props.cascade && props.cascadeData && props.cascadeData.length > 0) {
        // 级联模式
        displayColumns.value = [ { data: props.cascadeData } ];
        selectedIndexes.value = [ 0 ];
        updateCascadeColumns(0, 0);
    } else if (props.columns && props.columns.length > 0) {
        // 普通多列模式
        displayColumns.value = props.columns;
        selectedIndexes.value = props.columns.map(() => 0);
    }

    // 如果有初始值，设置选中状态
    if (props.modelValue && props.modelValue.length > 0) {
        updateFromModelValue();
    } else {
        updateSelectedValues();
    }
};

// 根据 modelValue 更新选中状态
const updateFromModelValue = () => {
    if (!props.modelValue || props.modelValue.length === 0) return;

    props.modelValue.forEach((value, columnIndex) => {
        const column = displayColumns.value[ columnIndex ];
        if (column) {
            const index = column.data.findIndex(item => item.value === value);
            if (index !== -1) {
                selectedIndexes.value[ columnIndex ] = index;
            }
        }
    });

    updateSelectedValues();
};

// 更新级联列
const updateCascadeColumns = (columnIndex: number, itemIndex: number) => {
    const item = displayColumns.value[ columnIndex ].data[ itemIndex ];

    // 移除后续所有列
    displayColumns.value = displayColumns.value.slice(0, columnIndex + 1);
    selectedIndexes.value = selectedIndexes.value.slice(0, columnIndex + 1);

    // 如果有子项，添加新列
    if (item.children && item.children.length > 0) {
        displayColumns.value.push({ data: item.children });
        selectedIndexes.value.push(0);

        // 递归处理下一级
        if (item.children[ 0 ].children && item.children[ 0 ].children.length > 0) {
            updateCascadeColumns(columnIndex + 1, 0);
        }
    }
};

// 滚动到指定项
const scrollToIndex = (columnIndex: number, itemIndex: number, smooth = true) => {
    nextTick(() => {
        const scrollbar = scrollbarRefs.value[ columnIndex ];
        if (!scrollbar) return;

        const wrapEl = scrollbar.wrapRef;
        if (!wrapEl) return;

        isScrolling.value = true;
        const targetScrollTop = itemIndex * ITEM_HEIGHT;

        if (smooth) {
            wrapEl.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        } else {
            wrapEl.scrollTop = targetScrollTop;
        }

        setTimeout(() => {
            isScrolling.value = false;
        }, 300);
    });
};

// 处理滚动事件 - 滚动结束后对齐
const handleScroll = (columnIndex: number, event: { scrollTop: number; scrollLeft: number }) => {
    if (isScrolling.value) return;

    const scrollTop = event.scrollTop;

    // 清除之前的定时器
    if (scrollTimers.value.has(columnIndex)) {
        clearTimeout(scrollTimers.value.get(columnIndex)!);
    }

    // 设置新的定时器，滚动停止后对齐
    const timer = setTimeout(() => {
        const itemIndex = Math.round(scrollTop / ITEM_HEIGHT);
        const column = displayColumns.value[ columnIndex ];

        if (column && column.data[ itemIndex ]) {
            // 跳过禁用项，找到最近的可用项
            let finalIndex = itemIndex;
            const data = column.data;

            if (data[ itemIndex ]?.disabled) {
                // 向下查找可用项
                let found = false;
                for (let i = itemIndex + 1; i < data.length; i++) {
                    if (!data[ i ]?.disabled) {
                        finalIndex = i;
                        found = true;
                        break;
                    }
                }
                // 如果向下没找到，向上查找
                if (!found) {
                    for (let i = itemIndex - 1; i >= 0; i--) {
                        if (!data[ i ]?.disabled) {
                            finalIndex = i;
                            break;
                        }
                    }
                }
            }

            selectedIndexes.value[ columnIndex ] = finalIndex;
            scrollToIndex(columnIndex, finalIndex, true);
            updateSelectedValues();

            if (props.cascade) {
                updateCascadeColumns(columnIndex, finalIndex);
            }
        }

        scrollTimers.value.delete(columnIndex);
    }, 150);

    scrollTimers.value.set(columnIndex, timer);
};

// 选择项目
const selectItem = (columnIndex: number, itemIndex: number, item: PickerItem) => {
    if (item.disabled) return;

    selectedIndexes.value[ columnIndex ] = itemIndex;
    scrollToIndex(columnIndex, itemIndex);

    if (props.cascade) {
        // 级联模式：更新后续列
        updateCascadeColumns(columnIndex, itemIndex);
    }

    updateSelectedValues();
};

// 更新选中的值
const updateSelectedValues = () => {
    selectedValues.value = [];
    selectedItems.value = [];

    displayColumns.value.forEach((column, index) => {
        const itemIndex = selectedIndexes.value[ index ] ?? 0;
        const item = column.data[ itemIndex ];
        if (item) {
            selectedValues.value.push(item.value);
            selectedItems.value.push(item);
        }
    });
};

// 显示值
const displayValue = computed(() => {
    if (selectedItems.value.length === 0) return '';
    return selectedItems.value.map(item => item.label).join(props.separator);
});

// 确认
const handleConfirm = () => {
    emit('update:modelValue', selectedValues.value);
    emit('change', selectedValues.value, selectedItems.value);
    showPicker.value = false;
};

// 取消
const handleCancel = () => {
    showPicker.value = false;
    // 恢复到原始值
    if (props.modelValue) {
        updateFromModelValue();
    } else {
        initPicker();
    }
};

// 监听 columns 变化
watch(() => props.columns, () => {
    if (!props.cascade) {
        initPicker();
    }
}, { deep: true });

// 监听级联数据变化
watch(() => props.cascadeData, () => {
    if (props.cascade) {
        initPicker();
    }
}, { deep: true });

// 清空
const handleClear = () => {
    selectedIndexes.value = [];
    selectedValues.value = [];
    selectedItems.value = [];
    emit('update:modelValue', []);
    emit('change', [], []);
};

// 监听显示状态
watch(showPicker, (val) => {
    if (val) {
        initPicker();
        // 滚动到选中位置
        nextTick(() => {
            selectedIndexes.value.forEach((index, columnIndex) => {
                scrollToIndex(columnIndex, index);
            });
        });
    }
});

// 初始化
initPicker();

// 清理定时器
onUnmounted(() => {
    scrollTimers.value.forEach(timer => clearTimeout(timer));
    scrollTimers.value.clear();
});
</script>

<template>
<el-popover ref="popoverRef" v-model:visible="showPicker" :width="popoverWidth" placement="bottom-start" popper-class="cascade-picker-popover" trigger="click">
    <template #reference>
    <el-input v-model="displayValue" :clearable="clearable" :placeholder="placeholder" :suffix-icon="Clock" class="cascade-picker-input" readonly @clear="handleClear" />
    </template>

    <div class="cascade-picker-panel">
        <div class="picker-columns">
            <div v-for="(column, columnIndex) in displayColumns" :key="columnIndex" class="picker-column">
                <el-scrollbar ref="scrollbarRefs" class="picker-scrollbar" @scroll="handleScroll(columnIndex, $event)">
                    <div class="picker-content">
                        <div class="picker-padding-top"></div>
                        <div v-for="(item, itemIndex) in column.data" :key="itemIndex" :class="{
                  active: selectedIndexes[columnIndex] === itemIndex,
                  disabled: item.disabled
                }" class="picker-item" @click="selectItem(columnIndex, itemIndex, item)">
                            {{ item.label }}
                        </div>
                        <div class="picker-padding-bottom"></div>
                    </div>
                </el-scrollbar>
            </div>
        </div>
        <div class="picker-highlight"></div>

        <div class="picker-footer">
            <el-button size="small" @click="handleCancel">取消</el-button>
            <el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
        </div>
    </div>
</el-popover>
</template>

<style lang="scss" scoped>
.cascade-picker-input {
    cursor: pointer;

    :deep(.el-input__inner) {
        cursor: pointer;
    }
}

:deep(.cascade-picker-popover) {
    padding: 0 !important;
    min-width: 300px;
}

.cascade-picker-panel {
    position: relative;
    background-color: #fff;
}

.picker-columns {
    display: flex;
    height: 238px;
    position: relative;
    z-index: 2;
    border-bottom: 1px solid #e4e7ed;
}

.picker-column {
    flex: 1;
    min-width: 100px;
    position: relative;

    &:not(:last-child) {
        border-right: 1px solid #e4e7ed;
    }
}

.picker-scrollbar {
    height: 100%;

    :deep(.el-scrollbar__wrap) {
        overflow-x: hidden;
    }

    :deep(.el-scrollbar__view) {
        height: 100%;
    }
}

.picker-content {
    min-height: 100%;
}

.picker-padding-top,
.picker-padding-bottom {
    height: 102px;
    flex-shrink: 0;
}

.picker-item {
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    padding: 0 8px;

    &:hover {
        background-color: #f5f7fa;
    }

    &.active {
        color: #409eff;
        font-weight: 600;
    }

    &.disabled {
        color: #c0c4cc;
        cursor: not-allowed;

        &:hover {
            background-color: transparent;
        }
    }
}

.picker-highlight {
    position: absolute;
    top: 102px;
    left: 0;
    right: 0;
    height: 34px;
    border-top: 1px solid #e4e7ed;
    border-bottom: 1px solid #e4e7ed;
    background-color: rgba(64, 158, 255, 0.04);
    pointer-events: none;
    z-index: 3;
}

.picker-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px;
    background-color: #fff;
}
</style>
