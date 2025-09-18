<script setup>
import { ref } from 'vue';
import { MonacoEditor } from '@/components/monaco-editor';

const html = '<div id="cesium-container"></div>';
const viewer = `const viewer = new Cesium.Viewer('cesium-container');`;

const code02 = ref({
    js: `${ viewer }

// 原始代码：
// viewer.entities.add({
//     rectangle: {
//         coordinates: Cesium.Rectangle.fromDegrees(-100, 20, -90, 30),
//         material: new Cesium.StripeMaterialProperty({
//             evenColor: Cesium.Color.WHITE,
//             oddColor: Cesium.Color.BLUE,
//             repeat: 5
//         })
//     }
// });

const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(-100, 20, -90, 30),
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    })
});

viewer.scene.primitives.add(
    new Cesium.Primitive({
        geometryInstances: instance,
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: Cesium.Material.fromType('Stripe')
        })
    })
);`,
    html
});
</script>

<template>
<div class="wrap">
    <MonacoEditor v-model="code02" width="800px" height="540px"></MonacoEditor>
</div>
</template>

<style lang="scss" scoped>
.wrap {
    height: 100vh;
    padding: 50px;
    box-sizing: border-box;
}
</style>
