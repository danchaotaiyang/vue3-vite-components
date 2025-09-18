<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import BaiduMap from '@/components/map/baidu-map/src/BaiduMapComposition.vue';
import { gcj02ToBd09 } from '@/components/map/baidu-map/src/utils';
import points from './data.json';

/*window.mapConfig = {
    server: 'http://10.0.3.74:8080/',
    api: 'http://10.0.3.74:8080/map-v3-20250306100054.js',
    ext: '.png',
    tiles: 'http://10.0.3.74:8080/tiles',
    tiles_satellite: 'http://10.0.3.74:8080/tiles_satellite',
    tiles_custom: 'http://10.0.3.74:8080/tiles_custom'
};*/
window.mapConfig = {
    server: 'http://10.0.10.16:8080/',
    api: 'http://10.0.10.16:8080/map-v3-20250306100054.js',
    ext: '.png',
    tiles: 'http://10.0.10.16:8080/tiles',
    tiles_satellite: 'http://10.0.10.16:8080/tiles_satellite',
    tiles_custom: 'http://10.0.10.16:8080/tiles_custom'
};

// 常量定义
const STORAGE_KEY = 'baiduMapApiKey';
const API_KEY_STATUS = {
    NONE: null,
    ERROR: 'error',
    SUCCESS: 'success',
    INFO: 'info'
};
const API_APPLY_DELAY = 800; // 模拟API加载延迟
const STATUS_CLEAR_DELAY = 3000; // 状态信息清除延迟

// 地图状态和控制
const enableScrollWheel = ref(true);
const mapApiKey = ref('');
const appliedApiKey = ref('4SyXICjA6hlw03FPG9ISGWMaODIDPMg0');
const isApplying = ref(false);
const keyStatus = ref(null);
const rememberKey = ref(true);
const savedApiKey = ref('');
const selectedPoint = ref(null);
const selectedMarker = ref(null);
const tileTestResults = ref([]);

// 瓦片图层配置
const tileLayers = ref([
    { id: 'layer1', url: '/tiles/{z}/{x}_{y}.png', visible: true, name: '光伏厂' }
]);

// 计算属性：用于显示的API密钥（显示前几位后省略）
const displayApiKey = computed(() => {
    if (!appliedApiKey.value) return '';

    const key = appliedApiKey.value;
    if (key.length <= 8) return key;

    return `${ key.substring(0, 8) }****${ key.substring(key.length - 4) }`;
});

// 日志工具函数
const logger = {
    log: (message, ...args) => console.log(`【地图主页】${ message }`, ...args),
    warn: (message, ...args) => console.warn(`【地图主页】${ message }`, ...args),
    error: (message, ...args) => console.error(`【地图主页】${ message }`, ...args)
};

// 设置状态提示信息
const setKeyStatus = (type, message) => {
    keyStatus.value = { type, message };

    // 如果是成功或信息提示，一段时间后自动清除
    if (type === API_KEY_STATUS.SUCCESS || type === API_KEY_STATUS.INFO) {
        setTimeout(() => {
            keyStatus.value = null;
        }, STATUS_CLEAR_DELAY);
    }
};

// 从本地存储加载API密钥
const loadSavedApiKey = () => {
    try {
        const storedKey = localStorage.getItem(STORAGE_KEY);
        if (storedKey) {
            savedApiKey.value = storedKey;
            mapApiKey.value = storedKey;
            logger.log('已从本地存储加载API密钥');
            return true;
        }
    } catch (err) {
        logger.error('从本地存储加载API密钥失败', err);
    }
    return false;
};

// 保存API密钥到本地存储
const saveApiKeyToStorage = (key) => {
    try {
        if (key && rememberKey.value) {
            localStorage.setItem(STORAGE_KEY, key);
            savedApiKey.value = key;
            logger.log('API密钥已保存到本地存储');
            return true;
        }
    } catch (err) {
        logger.error('保存API密钥到本地存储失败', err);
    }
    return false;
};

// 应用已保存的API密钥
const useSavedApiKey = () => {
    if (savedApiKey.value) {
        mapApiKey.value = savedApiKey.value;
        applyApiKey();
    }
};

// 应用API密钥
const applyApiKey = () => {
    // 验证API密钥
    if (!mapApiKey.value || mapApiKey.value.trim() === '') {
        setKeyStatus(API_KEY_STATUS.ERROR, '请输入有效的API密钥');
        return;
    }

    // 设置应用中状态
    isApplying.value = true;
    setKeyStatus(API_KEY_STATUS.INFO, '正在应用密钥并重新初始化地图...');

    // 使用setTimeout模拟API加载过程
    setTimeout(() => {
        appliedApiKey.value = mapApiKey.value.trim();
        isApplying.value = false;
        setKeyStatus(API_KEY_STATUS.SUCCESS, '密钥已应用，地图已重新初始化');

        // 如果选择记住密钥，则保存到localStorage
        if (rememberKey.value) {
            saveApiKeyToStorage(appliedApiKey.value);
        }
    }, API_APPLY_DELAY);
};

// 地图点击事件处理
const handleMapClick = (point) => {
    logger.log('点击地图位置:', point);
    selectedPoint.value = point;
    selectedMarker.value = null;
};

// 标记点击事件处理
const handleMarkerClick = (marker) => {
    logger.log('点击标记点:', marker);
    selectedMarker.value = marker;
    selectedPoint.value = null;
};

// 处理图片加载成功
const handleImageLoad = (event) => {
    tileTestResults.value.push({
        success: true,
        message: `✅ 成功加载图片: ${ event.target.src }`
    });
};

// 处理图片加载失败
const handleImageError = (event) => {
    tileTestResults.value.push({
        success: false,
        message: `❌ 图片加载失败: ${ event.target.src }`
    });
    logger.error(`图片加载失败: ${ event.target.src }`);
};

// 监听记住密钥选项变化
watch(rememberKey, (newVal) => {
    if (!newVal && savedApiKey.value) {
        // 如果取消记住密钥，从本地存储中删除
        try {
            localStorage.removeItem(STORAGE_KEY);
            logger.log('已从本地存储中移除API密钥');
        } catch (err) {
            logger.error('从本地存储中移除API密钥失败', err);
        }
    }
});

// 组件挂载时自动加载保存的API密钥
onMounted(() => {
    // 尝试从localStorage读取保存的API密钥
    if (loadSavedApiKey()) {
        // 自动应用保存的密钥
        applyApiKey();
    }
});

// 瓦片测试功能相关方法
/**
 * 格式化URL路径，确保以/开头
 * @param {string} url 原始URL
 * @return {string} 格式化后的URL
 */
const formatUrl = (url) => {
    if (!url.startsWith('/') && !url.startsWith('http')) {
        return '/' + url;
    }
    return url;
};

/**
 * 根据URL模板生成瓦片URL
 * @param {string} url URL模板
 * @param {number} x X坐标
 * @param {number} y Y坐标
 * @param {number} zoom 缩放级别
 * @return {string} 生成的瓦片URL
 */
const generateTileUrl = (url, x, y, zoom) => {
    let tileUrl = url.replace('{z}', zoom);

    // 根据URL中包含的模式选择替换方式
    if (url.includes('{x}_{y}')) {
        // 使用 x_y 格式
        tileUrl = tileUrl.replace('{x}_{y}', `${ x }_${ y }`);
    } else {
        // 使用传统的分开替换格式
        tileUrl = tileUrl.replace('{x}', x).replace('{y}', y);
    }

    // 确保路径正确
    return formatUrl(tileUrl);
};

/**
 * 测试瓦片URL是否可访问
 * @param {string} url 瓦片URL模板
 * @param {number} x X坐标，默认为1
 * @param {number} y Y坐标，默认为1
 * @param {number} zoom 缩放级别，默认为12
 */
const testTileAccess = (url, x = 1, y = 1, zoom = 12) => {
    // 构建测试URL
    const testUrl = generateTileUrl(url, x, y, zoom);
    const siteOrigin = window.location.origin;

    // 测试URL是否可访问
    logger.log(`测试瓦片访问: ${ siteOrigin }${ testUrl }`);

    return new Promise((resolve) => {
        const img = new Image();
        const startTime = Date.now();

        img.onload = () => {
            const loadTime = Date.now() - startTime;
            logger.log(`✅ 瓦片测试通过: ${ testUrl } (加载时间: ${ loadTime }ms)`);

            const result = {
                success: true,
                url: testUrl,
                fullUrl: `${ siteOrigin }${ testUrl }`,
                message: `✅ 瓦片可访问 (${ loadTime }ms)`,
                loadTime,
                timestamp: new Date().toISOString()
            };

            tileTestResults.value.push(result);
            resolve(result);
        };

        img.onerror = () => {
            logger.error(`❌ 瓦片访问失败: ${ testUrl }`);
            logger.warn('请检查以下可能的问题:');
            logger.warn('1. public/tiles 目录中是否有正确的瓦片文件');
            logger.warn('2. 瓦片文件命名格式是否正确');
            logger.warn('3. 开发服务器是否正确配置静态文件服务');

            const result = {
                success: false,
                url: testUrl,
                fullUrl: `${ siteOrigin }${ testUrl }`,
                message: `❌ 瓦片访问失败: ${ testUrl }`,
                timestamp: new Date().toISOString()
            };

            tileTestResults.value.push(result);
            resolve(result);
        };

        img.src = siteOrigin + testUrl;
    });
};

// 添加测试瓦片按钮的点击处理方法
const runTileTest = async () => {
    // 清空之前的测试结果
    tileTestResults.value = [];

    // 测试默认瓦片路径
    await testTileAccess('/tiles/{z}/{x}_{y}.png', 807, 271, 12);

    // 测试另一个瓦片
    await testTileAccess('/tiles/{z}/{x}_{y}.png', 808, 271, 12);
};

const mapRef = ref(null);

const mapBounds = ref({
    nw: [ 118.84297081378811, 37.30230082012413 ],
    se: [ 119.0753804153296, 37.129092165754564 ]
});

const mapMarkers = ref([
    {
        id: 'pv-plant-1',
        position: [ 118.963704, 37.214728 ],
        title: '光伏电厂1',
        icon: {
            url: `${ mapConfig.server }icons/icn-photovoltaic.png`,
            size: [ 32, 32 ],
            anchor: [ 16, 16 ]
        }
    },
    {
        id: 'pv-plant-2',
        position: [ 118.983704, 37.224728 ],
        title: '光伏电厂2',
        icon: {
            url: `${ mapConfig.server }icons/icn-photovoltaic.png`,
            size: [ 32, 32 ],
            anchor: [ 16, 16 ]
        }
    },
    {
        id: 'pv-plant-3',
        position: [ 118.993704, 37.234728 ],
        title: '光伏电厂3',
        icon: {
            url: `${ mapConfig.server }icons/icn-photovoltaic.png`,
            size: [ 32, 32 ],
            anchor: [ 16, 16 ]
        }
    },
    {
        id: 'city-center',
        position: [ 119.021261, 36.703293 ],
        title: '潍坊市中心',
        icon: {
            url: `${ mapConfig.server }icons/icn-photovoltaic.png`,
            size: [ 32, 32 ],
            anchor: [ 16, 16 ]
        }
    },
    {
        id: 'substation-1',
        position: [ 118.984532, 37.198645 ],
        title: '变电站1',
        icon: {
            url: `${ mapConfig.server }icons/icn-photovoltaic.png`,
            size: [ 32, 32 ],
            anchor: [ 16, 16 ]
        }
    },
    {
        id: 'substation-2',
        position: [ 118.994532, 37.208645 ],
        title: '变电站2',
        icon: {
            url: `${ mapConfig.server }icons/icn-photovoltaic.png`,
            size: [ 32, 32 ],
            anchor: [ 16, 16 ]
        }
    }
]);

mapMarkers.value = points
    .filter(d => !d.name.includes('箱变'))
    .map((d, i) => {
        return {
            id: `point-${ i }`,
            position: gcj02ToBd09(d.lon, d.lat),
            title: d.name,
            icon: {
                url: `${ mapConfig.server }icons/yuandian.png`,
                size: [ 12, 12 ],
                anchor: [ 6, 12 ]
            }
        };
    });

const mapLabels = computed(() => {
    return points
        .filter(d => !d.name.includes('箱变'))
        .map((d, i) => {
            return {
                id: 'label-1',
                position: gcj02ToBd09(d.lon, d.lat),
                content: d.name,
                style: {
                    fontSize: '10px',
                    transform: 'translateX(-50%)',
                }
            };
        });
});

const mapPolylines = ref([
    {
        id: 'power-line-3',
        category: 'power-lines',
        points: [
            [ 118.993704, 37.234728 ],
            [ 118.994532, 37.208645 ]
        ],
        strokeColor: '#8B4513',
        strokeWeight: 3,
        strokeOpacity: 0.8,
        startIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -200, -139 ]
        },
        endIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -225, -139 ]
        }
    },
    {
        id: 'patrol-route-1',
        category: 'patrol-routes',
        points: [
            [ 118.963704, 37.214728 ],
            [ 118.973704, 37.219728 ],
            [ 118.983704, 37.224728 ]
        ],
        strokeColor: '#32CD32',
        strokeWeight: 2,
        strokeOpacity: 0.6,
        startIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -200, -139 ]
        },
        endIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -225, -139 ]
        }
    },
    {
        id: 'patrol-route-2',
        category: 'patrol-routes',
        points: [
            [ 118.983704, 37.224728 ],  // 光伏电厂2
            [ 118.988704, 37.229728 ],  // 巡检点2
            [ 118.993704, 37.234728 ]   // 光伏电厂3
        ],
        strokeColor: '#228B22',
        strokeWeight: 2,
        strokeOpacity: 0.6,
        startIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -200, -139 ]
        },
        endIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -225, -139 ]
        }
    },
    // 维护路线
    {
        id: 'maintenance-route-1',
        category: 'maintenance-routes',
        points: [
            [ 118.984532, 37.198645 ],  // 变电站1
            [ 118.989532, 37.203645 ],  // 维护点1
            [ 118.994532, 37.208645 ]   // 变电站2
        ],
        strokeColor: '#DAA520',
        strokeWeight: 2,
        strokeOpacity: 0.6,
        startIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -200, -139 ]
        },
        endIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -225, -139 ]
        }
    }
]);

const mapPolygons = ref([
    {
        id: 'pv-area-1',
        category: 'pv-areas',
        points: [
            [ 118.953704, 37.224728 ],
            [ 118.973704, 37.224728 ],
            [ 118.973704, 37.204728 ],
            [ 118.953704, 37.204728 ]
        ],
        strokeColor: '#32CD32',
        fillColor: '#98FB98',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    {
        id: 'pv-area-2',
        category: 'pv-areas',
        points: [
            [ 118.973704, 37.234728 ],
            [ 118.993704, 37.234728 ],
            [ 118.993704, 37.214728 ],
            [ 118.973704, 37.214728 ]
        ],
        strokeColor: '#32CD32',
        fillColor: '#98FB98',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    {
        id: 'pv-area-3',
        category: 'pv-areas',
        points: [
            [ 118.983704, 37.244728 ],
            [ 119.003704, 37.244728 ],
            [ 119.003704, 37.224728 ],
            [ 118.983704, 37.224728 ]
        ],
        strokeColor: '#32CD32',
        fillColor: '#98FB98',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    // 保护区域
    {
        id: 'protected-area-1',
        category: 'protected-areas',
        points: [
            [ 118.963704, 37.244728 ],
            [ 118.983704, 37.244728 ],
            [ 118.983704, 37.234728 ],
            [ 118.963704, 37.234728 ]
        ],
        strokeColor: '#FF6B6B',
        fillColor: '#FFB6C1',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    {
        id: 'protected-area-2',
        category: 'protected-areas',
        points: [
            [ 118.973704, 37.254728 ],
            [ 118.993704, 37.254728 ],
            [ 118.993704, 37.244728 ],
            [ 118.973704, 37.244728 ]
        ],
        strokeColor: '#FF6B6B',
        fillColor: '#FFB6C1',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    // 设备区域
    {
        id: 'equipment-area-1',
        category: 'equipment-areas',
        points: [
            [ 118.979532, 37.193645 ],
            [ 118.989532, 37.193645 ],
            [ 118.989532, 37.203645 ],
            [ 118.979532, 37.203645 ]
        ],
        strokeColor: '#4682B4',
        fillColor: '#B0C4DE',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    }
]);

const mapCircles = ref([
    {
        id: 'coverage-1',
        category: 'coverage-areas',
        center: [ 118.963704, 37.214728 ],
        radius: 500,
        strokeColor: '#FF1493',
        fillColor: '#FFC0CB',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    {
        id: 'coverage-2',
        category: 'coverage-areas',
        center: [ 118.983704, 37.224728 ],
        radius: 500,
        strokeColor: '#FF1493',
        fillColor: '#FFC0CB',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    {
        id: 'coverage-3',
        category: 'coverage-areas',
        center: [ 118.993704, 37.234728 ],
        radius: 500,
        strokeColor: '#FF1493',
        fillColor: '#FFC0CB',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    // 警戒区域
    {
        id: 'alert-area-1',
        category: 'alert-areas',
        center: [ 118.984532, 37.198645 ],
        radius: 300,
        strokeColor: '#FF4500',
        fillColor: '#FFA07A',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    {
        id: 'alert-area-2',
        category: 'alert-areas',
        center: [ 118.994532, 37.208645 ],
        radius: 300,
        strokeColor: '#FF4500',
        fillColor: '#FFA07A',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    // 信号范围
    {
        id: 'signal-range-1',
        category: 'signal-ranges',
        center: [ 118.973704, 37.219728 ],
        radius: 200,
        strokeColor: '#4169E1',
        fillColor: '#87CEEB',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    },
    {
        id: 'signal-range-2',
        category: 'signal-ranges',
        center: [ 118.988704, 37.229728 ],
        radius: 200,
        strokeColor: '#4169E1',
        fillColor: '#87CEEB',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.3
    }
]);

const trajectoryInstances = ref({});

const createAndPlayTrajectories = () => {
    const powerFlowTrajectory = mapRef.value.addTrajectory('power-flow-1', [
        [ 118.993704, 37.234728 ],  // 光伏电厂3
        [ 118.994118, 37.221687 ],  // 中间点1
        [ 118.994532, 37.208645 ],  // 变电站2
        [ 119.007897, 36.955969 ],  // 中间点2
        [ 119.021261, 36.703293 ]   // 市中心
    ], {
        strokeColor: '#4CAF50',
        strokeWeight: 3,
        strokeOpacity: 0.8,
        speed: 50,  // 移动速度（米/秒）
        autoRotate: true,
        icon: {
            url: `${ mapConfig.server }icons/Mario.png`,
            size: [ 32, 32 ],
            anchor: [ 16, 16 ]
        },
        startIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -200, -139 ]
        },
        endIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -225, -139 ]
        }
    });

    // 添加巡检路线轨迹
    const inspectionTrajectory = mapRef.value.addTrajectory('inspection-route-1', [
        [ 118.984532, 37.198645 ],  // 变电站1
        [ 118.989532, 37.203645 ],  // 中间点1
        [ 118.994532, 37.208645 ],  // 变电站2
        [ 118.994118, 37.221687 ],  // 中间点2
        [ 118.993704, 37.234728 ],  // 光伏电厂3
        [ 118.988704, 37.229728 ],  // 巡检点2
        [ 118.983704, 37.224728 ],  // 光伏电厂2
        [ 118.973704, 37.219728 ],  // 巡检点1
        [ 118.984532, 37.198645 ]   // 回到变电站1
    ], {
        strokeColor: '#2196F3',
        strokeWeight: 4,
        strokeOpacity: 0.6,
        speed: 30,  // 移动速度（米/秒）
        autoRotate: true,
        icon: {
            url: `${ mapConfig.server }icons/Mario.png`,
            size: [ 32, 32 ],
            anchor: [ 16, 16 ]
        },
        startIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -200, -139 ]
        },
        endIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -225, -139 ]
        }
    });

    // 添加维护人员轨迹
    const maintenanceTrajectory = mapRef.value.addTrajectory('maintenance-route-1', [
        [ 119.021261, 36.703293 ],  // 市中心
        [ 119.002897, 36.950969 ],  // 中间点1
        [ 118.984532, 37.198645 ],  // 变电站1
        [ 118.989118, 37.216687 ],  // 中间点2
        [ 118.993704, 37.234728 ]   // 光伏电厂3
    ], {
        strokeColor: '#FF9800',
        strokeWeight: 3,
        strokeOpacity: 0.7,
        speed: 40,  // 移动速度（米/秒）
        autoRotate: true,
        icon: {
            url: `${ mapConfig.server }icons/Mario.png`,
            size: [ 32, 32 ],
            anchor: [ 16, 16 ]
        },
        startIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -200, -139 ]
        },
        endIcon: {
            url: `${ mapConfig.server }icons/markers_new.png`,
            size: [ 25, 37 ],
            anchor: [ 16, 16 ],
            imageOffset: [ -225, -139 ]
        }
    });

    // 存储轨迹实例
    trajectoryInstances.value = {
        'power-flow-1': powerFlowTrajectory,
        'inspection-route-1': inspectionTrajectory,
        'maintenance-route-1': maintenanceTrajectory
    };
    const trajectoryVisibility = ref({
        'power-flow-1': true,
        'inspection-route-1': true,
        'maintenance-route-1': true
    });
    // 根据可见性状态播放轨迹
    Object.entries(trajectoryVisibility.value).forEach(([ id, visible ]) => {
        if (visible && trajectoryInstances.value[ id ]) {
            trajectoryInstances.value[ id ].play();
        }
    });
};

const eventMapLoad = () => {
    // createAndPlayTrajectories();
};
</script>

<template>
<section class="map-section">
    <div class="map-layout">
        <!-- 左侧地图容器 -->
        <div class="map-container">
            <BaiduMap ref="mapRef" :api-key="appliedApiKey" :center="[ 118.963704, 37.214728 ]" :markers="mapMarkers" :labels="mapLabels" :enable-scroll-wheelZoom="enableScrollWheel" :zoom="14" debug @map-loaded="eventMapLoad" @map-click="handleMapClick" @marker-click="handleMarkerClick" />
        </div>

        <!-- 右侧内容区域 -->
        <!--        <div class="map-sidebar">
                    &lt;!&ndash; API密钥区域 &ndash;&gt;
                    <div class="map-api-key">
                        <div class="input-group">
                            <label for="api-key">百度地图API密钥: <span class="required">*必填</span></label>
                            <div class="key-input-wrapper">
                                <input id="api-key" v-model="mapApiKey" class="api-key-input" placeholder="输入您的百度地图API密钥" type="text" />
                                <button :disabled="!mapApiKey || mapApiKey.trim() === ''" class="apply-key-btn" @click="applyApiKey">
                                    {{ isApplying ? '应用中...' : '应用密钥' }}
                                </button>
                            </div>
                        </div>
                        <div class="key-status">
                            <p v-if="keyStatus" :class="['status-message', `status-${keyStatus.type}`]">
                                {{ keyStatus.message }} </p>
                            <p v-if="appliedApiKey" class="api-key-note">
                                当前使用的密钥: {{ displayApiKey }} </p>
                            <p v-else class="api-key-note">
                                请提供有效的百度地图API密钥以初始化地图 </p>
                        </div>
                        <div class="remember-key">
                            <label class="remember-key-label"> <input v-model="rememberKey" type="checkbox"> 记住我的API密钥 </label>
                            <button v-if="savedApiKey && savedApiKey !== appliedApiKey" class="use-saved-key-btn" @click="useSavedApiKey">
                                使用已保存的密钥
                            </button>
                        </div>
                    </div>

                    <div class="map-controls">
                        <label class="control-item"> <input v-model="enableScrollWheel" type="checkbox"> 启用鼠标滚轮缩放 </label>
                    </div>

                    &lt;!&ndash; 瓦片测试区域 &ndash;&gt;
                    &lt;!&ndash; <div class="tile-test-section">
                        <h3>瓦片资源测试</h3>
                        <p>以下是直接访问瓦片图片的测试，帮助排查问题：</p>

                        <button class="test-tile-btn" @click="runTileTest">
                            运行瓦片测试
                        </button>

                        <div class="tile-samples">
                            <div class="tile-sample">
                                <h4>测试瓦片1</h4>
                                <img alt="测试瓦片 zoom=12,x=807,y=271" src="/tiles/12/807_271.png" @error="handleImageError" @load="handleImageLoad" />
                                <p>路径: /tiles/12/807_271.png</p>
                            </div>
                            <div class="tile-sample">
                                <h4>测试瓦片2</h4>
                                <img alt="测试瓦片 zoom=12,x=808,y=271" src="/tiles/12/808_271.png" @error="handleImageError" @load="handleImageLoad" />
                                <p>路径: /tiles/12/808_271.png</p>
                            </div>
                        </div>
                        <div class="tests-result">
                            <p v-if="tileTestResults.length > 0">测试结果:</p>
                            <ul>
                                <li v-for="(result, index) in tileTestResults" :key="index" :class="{'success': result.success, 'error': !result.success}">
                                    {{ result.message }}
                                </li>
                            </ul>
                        </div>
                        <div class="tile-test-help">
                            <h4>如何解决瓦片加载问题?</h4>
                            <ol>
                                <li>确认tiles目录结构正确: public/tiles/{z}/{x}_{y}.png</li>
                                <li>检查Vite配置的静态资源设置是否正确</li>
                                <li>尝试清除浏览器缓存并重启开发服务器</li>
                                <li>在浏览器开发者工具中查看网络请求错误</li>
                            </ol>
                        </div>
                    </div> &ndash;&gt;

                    <div class="map-info">
                        <div v-if="selectedPoint">
                            <h3>选中的位置</h3>
                            <p>经度: {{ selectedPoint.lng }}</p>
                            <p>纬度: {{ selectedPoint.lat }}</p>
                        </div>
                        <div v-if="selectedMarker">
                            <h3>选中的标记点</h3>
                            <p>ID: {{ selectedMarker.id }}</p>
                            <p>名称: {{ selectedMarker.title }}</p>
                        </div>
                    </div>
                </div>-->
    </div>
</section>
</template>

<style scoped>
.map-section {
    background: rgba(250, 250, 252, 0.9);
}

/* 新增布局样式 */
.map-layout {
    display: flex;
}

.map-container {
    flex: 1;
    height: 100vh;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.map-sidebar {
    width: 600px;
    flex-shrink: 0;
    overflow-y: auto;
    max-height: 100vh;
}

.map-controls {
    margin: 1rem 0;
    padding-left: 1rem;
    display: flex;
    justify-content: flex-start;
    gap: 1rem;
}

.control-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #333;
    cursor: pointer;
}

.control-item input {
    cursor: pointer;
}

.map-api-key {
    margin: 0 0 1.5rem 0;
    background: rgba(245, 245, 250, 0.9);
    padding: 1rem;
    border-radius: 8px;
    text-align: left;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group label {
    color: #0066cc;
    font-size: 0.9rem;
}

.required {
    color: #ff4757;
    font-size: 0.8rem;
    margin-left: 0.5rem;
}

.key-input-wrapper {
    display: flex;
    gap: 0.5rem;
}

.key-status {
    margin-top: 0.8rem;
}

.status-message {
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
}

.api-key-input {
    background: #ffffff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
    color: #333;
    flex: 1;
    font-family: monospace;
}

.apply-key-btn {
    background: linear-gradient(45deg, #3742fa, #1e90ff);
    border: none;
    border-radius: 4px;
    color: #fff;
    padding: 0 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100px;
}

.apply-key-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(30, 144, 255, 0.4);
}

.apply-key-btn:disabled {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
}

.api-key-note {
    margin-top: 0.8rem;
    font-size: 0.8rem;
    color: #777;
}

.map-info {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(245, 245, 250, 0.9);
    border-radius: 5px;
    text-align: left;
    color: #333;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}

.map-info h3 {
    color: #0066cc;
    margin-bottom: 0.5rem;
}

.tile-test-section h3 {
    color: #0066cc;
    margin-bottom: 0.5rem;
}

.tile-test-section p {
    color: #333;
    margin-bottom: 0.8rem;
    font-size: 0.95rem;
}

.tile-sample img {
    display: block;
    width: 128px;
    height: 128px;
    margin: 0 auto 0.5rem;
    background: #f0f0f0;
    border: 1px solid #e5e5e5;
}

.tile-sample h4 {
    margin-top: 0;
    color: #333;
}

.tile-sample p {
    font-size: 0.8rem;
    color: #666;
    margin: 0;
}

.tests-result ul {
    margin: 0;
    padding-left: 1.5rem;
}

.tests-result li {
    margin-bottom: 0.3rem;
}

.tile-test-help h4 {
    color: #f39c12;
    margin-bottom: 0.5rem;
}

.tile-test-help ol {
    margin: 0;
    padding-left: 1.5rem;
}

.tile-test-help li {
    color: #555;
    margin-bottom: 0.3rem;
}

.remember-key {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.8rem;
}

.remember-key-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #666;
    cursor: pointer;
}

.use-saved-key-btn {
    background: linear-gradient(45deg, #1e90ff, #4a7eff);
    border: none;
    border-radius: 4px;
    padding: 0.3rem 0.8rem;
    font-size: 0.8rem;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
}

.use-saved-key-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 100, 255, 0.3);
}

/* 响应式布局 */
@media (max-width: 1200px) {
    .map-layout {
        flex-direction: column;
    }

    .map-sidebar {
        width: 100%;
    }
}
</style>
