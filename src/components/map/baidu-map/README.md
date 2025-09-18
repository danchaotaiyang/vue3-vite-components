# 百度地图组件使用文档

## 安装方式

### 1. 全局安装

```javascript
// main.js
import { createApp } from 'vue';
import BaiduMap from '@components/map/baidu';

const app = createApp(App);
app.use(BaiduMap);
app.mount('#app');
```

### 2. 局部安装

```vue
<template>
<BaiduMap :api-key="apiKey" />
</template>

<script setup>
import { BaiduMap } from '@components/map/baidu';

const apiKey = 'your-baidu-map-api-key';
</script>
```

## 组件介绍

这是一个基于百度地图 API 的 Vue 3 组件，提供了丰富的地图功能和图形绘制能力。组件支持标记点、折线、多边形、圆形、标签等图形元素，并提供了轨迹动画、瓦片图层等高级功能。

## 基本用法

```vue
<template>
<BaiduMapComposition
    :api-key="yourApiKey"
    :center="[116.403981, 39.912223]"
    :zoom="14"
    v-model:labels="labels"
    v-model:markers="markers"
    v-model:polylines="polylines"
    v-model:polygons="polygons"
    v-model:circles="circles"
    @map-click="handleMapClick"
    @graphic-click="handleGraphicClick"
/>
</template>

<script setup>
import { ref } from 'vue';

const yourApiKey = 'your-baidu-map-api-key';
const labels = ref([]);
const markers = ref([]);
const polylines = ref([]);
const polygons = ref([]);
const circles = ref([]);

const handleMapClick = (event) => {
    console.log('地图点击事件:', event);
};

const handleGraphicClick = (event) => {
    console.log('图形点击事件:', event);
};
</script>
```

## 属性说明

### 基本属性

| 属性名                | 类型 | 默认值 | 说明                                  |
|--------------------|------|--------|-------------------------------------|
| api-key            | String | '' | 百度地图 API 密钥 |
| center             | Array | [116.403981, 39.912223] | 地图中心点坐标 [经度, 纬度]                    |
| zoom               | Number | 14 | 地图缩放级别                              |
| min-zoom           | Number | 10 | 最小缩放级别                              |
| max-zoom           | Number | 19 | 最大缩放级别                              |
| wheel-zoom         | Boolean | true | 是否允许鼠标滚轮缩放                          |
| scale-control      | Boolean | false | 是否显示比例尺控件                           |
| navigation-control | Boolean | false | 是否显示导航控件                            |
| dragging           | Boolean | true | 是否允许拖拽地图                            |
| type               | String | 'BMAP_NORMAL_MAP' | 地图类型                                |
| offline            | Boolean | false | 是否使用离线地图                            |
| debug              | Boolean | false | 是否启用调试模式                            |

### 图形数据属性

| 属性名 | 类型 | 说明 |
|--------|------|------|
| v-model:labels | Array | 标签数组 |
| v-model:markers | Array | 标记点数组 |
| v-model:polylines | Array | 折线数组 |
| v-model:polygons | Array | 多边形数组 |
| v-model:circles | Array | 圆形数组 |
| v-model:customStyle | Object | 自定义地图样式 |

## 事件说明

| 事件名 | 参数 | 说明 |
|--------|------|------|
| map-click | { lng, lat } | 地图点击事件 |
| graphic-click | { type, ...data } | 图形点击事件 |
| api-error | Error | API 加载错误事件 |
| api-loaded | { BMap } | API 加载完成事件 |
| map-loaded | { map } | 地图加载完成事件 |

## 图形数据结构

### 标签 (Labels)

```javascript
[
    {
        id: 'label-1',
        position: [lng, lat],
        content: '标签内容',
        style: {
            color: '#000000',
            fontSize: '14px',
            fontWeight: 'normal',
            backgroundColor: '#FFFFFF',
            borderColor: '#CCCCCC',
            borderWidth: '1px',
            borderRadius: '4px',
            padding: '4px 8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        offset: [0, 0], // 偏移量 [x, y]
        zIndex: 1
    }
]
```

### 标记点 (Markers)

```javascript
[
    {
        id: 'marker-1',
        position: [lng, lat],
        title: '标题',
        icon: {
            url: 'marker.png',
            size: [32, 32],
            anchor: [16, 16],
            imageOffset: [0, 0]
        },
        zIndex: 1
    }
]
```

### 折线 (Polylines)

```javascript
[
    {
        id: 'polyline-1',
        points: [[lng, lat], [lng, lat], ...],
        strokeColor: '#FF0000',
        strokeWeight: 2,
        strokeOpacity: 1,
        strokeStyle: 'solid', // 线型，可选值：'solid'（实线）、'dashed'（虚线）
        startIcon: {
            url: 'start.png',
            size: [32, 32],
            anchor: [16, 16],
            imageOffset: [0, 0]
        },
        endIcon: {
            url: 'end.png',
            size: [32, 32],
            anchor: [16, 16],
            imageOffset: [0, 0]
        }
    }
]
```

### 多边形 (Polygons)

```javascript
[
    {
        id: 'polygon-1',
        points: [[lng, lat], [lng, lat], ...],
        strokeColor: '#FF0000',
        fillColor: '#FF0000',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3,
        strokeStyle: 'solid' // 线型，可选值：'solid'、'dashed'
    }
]
```

### 圆形 (Circles)

```javascript
[
    {
        id: 'circle-1',
        center: [lng, lat],
        radius: 1000, // 单位：米
        strokeColor: '#FF0000',
        fillColor: '#FF0000',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3,
        strokeStyle: 'solid' // 线型，可选值：'solid'、'dashed'
    }
]
```

## 组件方法

组件通过 `ref` 暴露了以下方法：

### 地图控制

- `isReady`: 检查地图是否准备就绪
- `getState()`: 获取地图状态
- `destroy()`: 销毁地图实例
- `getMap()`: 获取地图实例
- `getCenter()`: 获取地图中心点
- `panTo(lng, lat)`: 平移地图到指定位置
- `getZoom()`: 获取当前缩放级别
- `setZoom(zoomLevel)`: 设置缩放级别
- `getBounds()`: 获取地图边界
- `setBounds(bounds, options)`: 设置地图边界

### 图形操作

- `addLabel(label)`: 添加单个标签
- `addLabels(labels)`: 批量添加标签
- `updateLabel(id, newContent, newStyle)`: 更新标签内容和样式
- `removeLabel(id)`: 移除标签
- `clearLabels()`: 清除所有标签

- `addMarker(marker)`: 添加单个标记点
- `addMarkers(markers)`: 批量添加标记点
- `updateMarker(id, newPosition, newOptions)`: 更新标记点
- `removeMarker(id)`: 移除标记点
- `clearMarkers()`: 清除所有标记点

- `addPolyline(polyline)`: 添加单条折线
- `addPolylines(polylines)`: 批量添加折线
- `updatePolyline(id, newPoints, newOptions)`: 更新折线
- `removePolyline(id)`: 移除折线
- `clearPolylines()`: 清除所有折线

- `addPolygon(polygon)`: 添加单个多边形
- `addPolygons(polygons)`: 批量添加多边形
- `updatePolygon(id, newPoints, newOptions)`: 更新多边形
- `removePolygon(id)`: 移除多边形
- `clearPolygons()`: 清除所有多边形

- `addCircle(circle)`: 添加单个圆形
- `addCircles(circles)`: 批量添加圆形
- `updateCircle(id, newCenter, newRadius, newOptions)`: 更新圆形
- `removeCircle(id)`: 移除圆形
- `clearCircles()`: 清除所有圆形

- `clearAllOverlays()`: 清除地图上所有覆盖物（不区分类型，直接调用百度地图原生API，所有图形都会被移除）

### 轨迹动画

- `addTrajectory(id, points, options)`: 添加轨迹动画
- `getTrajectory(id)`: 获取轨迹动画实例
- `removeTrajectory(id)`: 移除轨迹动画
- `clearTrajectories()`: 清除所有轨迹动画

### 瓦片图层

- `addTileLayer(id, url, visible)`: 添加瓦片图层
- `showTileLayer(layerId)`: 显示瓦片图层
- `hideTileLayer(layerId)`: 隐藏瓦片图层
- `getTileLayers()`: 获取所有瓦片图层ID
- `reloadTileLayers()`: 重新加载瓦片图层

### 其他功能

- `toggleGraphics(type, id, visible)`: 控制图形显示/隐藏
- `calculateDistance(point1, point2)`: 计算两点之间的距离
- `autoRecoverMap(forceReinit)`: 自动恢复地图
- `clearErrorState()`: 清除错误状态
- `checkEnvironment()`: 检查环境是否支持百度地图
- `emergencyDisconnect()`: 紧急断开所有地图资源连接

## 示例代码

### 基本使用

```vue
<template>
<BaiduMapComposition
    :api-key="apiKey"
    :center="center"
    :zoom="zoom"
    v-model:markers="markers"
    @map-click="handleMapClick"
/>
</template>

<script setup>
import { ref } from 'vue';

const apiKey = 'your-baidu-map-api-key';
const center = [116.403981, 39.912223];
const zoom = 14;

const markers = ref([
    {
        id: 'marker-1',
        position: [116.403981, 39.912223],
        title: '天安门',
        icon: {
            url: '/marker.png',
            size: [32, 32],
            anchor: [16, 16]
        }
    }
]);

const handleMapClick = (event) => {
    console.log('点击位置:', event);
};
</script>
```

### 清除所有覆盖物示例

```js
// 清除所有覆盖物
mapRef.value.clearAllOverlays();
```

### 添加轨迹动画

```vue
<template>
<BaiduMapComposition
    ref="mapRef"
    :api-key="apiKey"
    :center="center"
    :zoom="zoom"
/>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const apiKey = 'your-baidu-map-api-key';
const center = [116.403981, 39.912223];
const zoom = 14;
const mapRef = ref(null);

onMounted(() => {
    const points = [
        [116.403981, 39.912223],
        [116.404981, 39.913223],
        [116.405981, 39.914223]
    ];

    const trajectory = mapRef.value.addTrajectory('trajectory-1', points, {
        strokeColor: '#FF0000',
        strokeWeight: 3,
        speed: 500,
        icon: {
            url: '/car.png',
            size: [32, 32],
            anchor: [16, 16]
        }
    });

    trajectory.play();
});
</script>
```

## 注意事项

1. 使用组件前必须提供有效的百度地图 API 密钥
2. 离线模式需要自行提供地图瓦片资源
3. 建议在生产环境中关闭调试模式 (`debug: false`)
4. 大量图形操作时注意性能优化
