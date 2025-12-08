# 通用级联选择器 (CascadePicker)

一个功能强大的 Vue 3 级联选择器组件，采用下拉面板 + 滚动选择的交互方式，类似 el-time-picker，但支持任意级联数据。

## 特性

- ✅ **下拉面板设计** - 使用 el-popover 实现，与 Element Plus 风格统一
- ✅ **滚动选择交互** - 平滑滚动，自动对齐选中项
- ✅ **多列独立选择** - 支持时间、日期等场景
- ✅ **级联选择模式** - 支持树形结构数据
- ✅ **自动宽度调整** - 根据列数动态计算面板宽度
- ✅ **完整的 TypeScript 支持** - 类型安全
- ✅ **灵活的数据配置** - 自定义分隔符、禁用选项
- ✅ **可清空** - 支持一键清空选择

## 安装

确保已安装 Element Plus：

```bash
npm install element-plus @element-plus/icons-vue
```

## 使用示例

### 1. 基础多列选择（时间选择器）

```vue
<template>
  <CascadePicker
    v-model="customTime"
    :columns="timeColumns"
    placeholder="选择时间"
    separator=":"
    @change="handleTimeChange"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CascadePicker from './CascadePicker.vue'
import type { PickerColumn } from './CascadePicker.vue'

const customTime = ref([16, 34, 55])

const timeColumns = computed<PickerColumn[]>(() => {
  return [
    {
      data: Array.from({ length: 24 }, (_, i) => ({
        label: String(i).padStart(2, '0'),
        value: i
      }))
    },
    {
      data: Array.from({ length: 60 }, (_, i) => ({
        label: String(i).padStart(2, '0'),
        value: i
      }))
    },
    {
      data: Array.from({ length: 60 }, (_, i) => ({
        label: String(i).padStart(2, '0'),
        value: i
      }))
    }
  ]
})

const handleTimeChange = (values: any[], items: PickerItem[]) => {
  console.log('时间改变:', values, items)
}
</script>
```

### 2. 级联选择（省市区）

```vue
<template>
  <CascadePicker
    v-model="selectedRegion"
    :cascade-data="regionData"
    :cascade="true"
    placeholder="选择地区"
    separator="/"
    @change="handleRegionChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CascadePicker from './CascadePicker.vue'
import type { PickerItem } from './CascadePicker.vue'

const selectedRegion = ref<any[]>([])

const regionData: PickerItem[] = [
  {
    label: '北京市',
    value: '110000',
    children: [
      { label: '东城区', value: '110101' },
      { label: '西城区', value: '110102' },
      { label: '朝阳区', value: '110105' }
    ]
  },
  {
    label: '广东省',
    value: '440000',
    children: [
      {
        label: '广州市',
        value: '440100',
        children: [
          { label: '天河区', value: '440106' },
          { label: '海珠区', value: '440105' }
        ]
      },
      {
        label: '深圳市',
        value: '440300',
        children: [
          { label: '南山区', value: '440305' },
          { label: '福田区', value: '440304' }
        ]
      }
    ]
  }
]

const handleRegionChange = (values: any[], items: PickerItem[]) => {
  console.log('地区改变:', values, items)
}
</script>
```

### 3. 日期选择器

```vue
<template>
  <CascadePicker
    v-model="customDate"
    :columns="dateColumns"
    placeholder="选择日期"
    separator="-"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CascadePicker from './CascadePicker.vue'
import type { PickerColumn } from './CascadePicker.vue'

const customDate = ref([2025, 10, 23])

const dateColumns = computed<PickerColumn[]>(() => {
  const currentYear = new Date().getFullYear()
  return [
    {
      data: Array.from({ length: 50 }, (_, i) => ({
        label: `${currentYear - 25 + i}年`,
        value: currentYear - 25 + i
      }))
    },
    {
      data: Array.from({ length: 12 }, (_, i) => ({
        label: `${i + 1}月`,
        value: i + 1
      }))
    },
    {
      data: Array.from({ length: 31 }, (_, i) => ({
        label: `${i + 1}日`,
        value: i + 1
      }))
    }
  ]
})
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `modelValue` | `any[]` | `[]` | 选中的值数组（v-model） |
| `columns` | `PickerColumn[]` | `[]` | 多列选择器的列数据（非级联模式） |
| `cascadeData` | `PickerItem[]` | `[]` | 级联数据（级联模式） |
| `cascade` | `boolean` | `false` | 是否启用级联模式 |
| `placeholder` | `string` | `'请选择'` | 输入框占位符 |
| `separator` | `string` | `'-'` | 显示值的分隔符 |
| `clearable` | `boolean` | `true` | 是否可清空 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `<T>(value: T[])` | 值改变时触发 |
| `change` | `<T>(value: T[], selectedItems: PickerItem<T>[])` | 确认选择时触发 |

## 数据结构

### PickerValue

```typescript
// 支持的值类型
type PickerValue = string | number | boolean
```

### PickerColumn

```typescript
interface PickerColumn<T = PickerValue> {
  data: PickerItem<T>[]
}
```

### PickerItem

```typescript
interface PickerItem<T = PickerValue> {
  label: string           // 显示的文本
  value: T                // 实际的值（支持泛型）
  disabled?: boolean      // 是否禁用
  children?: PickerItem<T>[]  // 子项（级联模式）
}
```

### 类型安全

组件使用 TypeScript 泛型，确保值类型的一致性：

```typescript
// 字符串类型示例
const stringData: PickerItem<string>[] = [
  { label: '选项1', value: 'option1' },
  { label: '选项2', value: 'option2' }
]

// 数字类型示例
const numberData: PickerItem<number>[] = [
  { label: '1小时', value: 1 },
  { label: '2小时', value: 2 }
]
```

## 使用场景

- ✅ 时间选择器（时:分:秒）
- ✅ 日期选择器（年-月-日）
- ✅ 省市区选择
- ✅ 商品分类选择
- ✅ 学历专业选择
- ✅ 车牌号选择
- ✅ 任意多级级联数据选择

## 优势

1. **风格统一**：使用 el-popover 下拉面板，与 el-time-picker 等 Element Plus 组件风格一致
2. **交互流畅**：平滑滚动 + 自动对齐，提供优秀的用户体验
3. **灵活性强**：支持任意列数和任意级联深度
4. **易用性好**：API 简单清晰，类似于 element-plus 组件
5. **类型安全**：完整的 TypeScript 类型定义
6. **自适应宽度**：根据列数动态调整面板宽度，避免布局问题

## 注意事项

1. 级联模式下，使用 `cascadeData` 和 `cascade` 属性
2. 多列独立选择模式下，使用 `columns` 属性
3. 两种模式不能同时使用
4. `modelValue` 绑定的是值数组，而不是对象
5. 确认后才会触发 `update:modelValue`，取消不会触发

## 浏览器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## License

MIT
