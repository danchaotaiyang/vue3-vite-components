<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, type PropType, reactive, type Ref, ref, watch } from 'vue';
import { formatUrl, generateTileUrl, getTileUrl } from './utils';
import './BaiduMap.scss';

// 定义百度地图API的核心类型（简化的全局声明）
// 移除旧的 BMap namespace 声明
// declare namespace BMap { ... }

// 定义一些常用的百度地图类型接口
interface BMapPoint {
    lng: number;
    lat: number;
}

interface BMapSize {
    width: number;
    height: number;
}

interface BMapIcon {
    url: string;
    size: BMapSize;
    anchor?: BMapSize;
    imageOffset?: BMapSize;
}

// 将接口定义移到 (window as any) 块外部，并使用 BMap 前缀 (如果需要)
// 更新接口定义以匹配代码中的使用方式和解决linter错误
interface BMapOverlay {
    show(): void;

    hide(): void;
} // 添加显示和隐藏方法
interface BMapLabel extends BMapOverlay {
    setContent(content: string | HTMLElement): void;

    getContent(): HTMLElement;

    setPosition(position: BMapPoint): void;
} // 简化
interface BMapMarker extends BMapOverlay {
    setPosition(position: BMapPoint): void;

    setIcon(icon: BMapIcon): void;

    setTitle(title: string): void;

    setZIndex(zIndex: number): void;

    getUserData(): any;

    setRotation(angle: number): void;
} // 添加设置旋转方法
interface BMapPolyline extends BMapOverlay {
    setPath(path: BMapPoint[]): void;

    setStrokeColor(color: string): void;

    setStrokeWeight(weight: number): void;

    setStrokeOpacity(opacity: number): void;

    getUserData(): any;
} // 修正描边宽度和透明度方法名
interface BMapPolygon extends BMapOverlay {
    setPath(path: BMapPoint[]): void;

    setStrokeColor(color: string): void;

    setFillColor(color: string): void;

    setStrokeWeight(weight: number): number;

    setStrokeOpacity(opacity: number): number;

    setFillOpacity(opacity: number): number;

    getUserData(): any;
} // 修正填充颜色, 描边宽度, 描边透明度, 填充透明度 方法名
interface BMapCircle extends BMapOverlay {
    setCenter(center: BMapPoint): void;

    setRadius(radius: number): number;

    setStrokeColor(color: string): void;

    setFillColor(color: string): void;

    setStrokeWeight(weight: number): number;

    setStrokeOpacity(opacity: number): number;

    setFillOpacity(opacity: number): number;

    getUserData(): any;
}

interface BMapTileLayer extends BMapOverlay {
    getTilesUrl(tileCoord: { x: number; y: number }, zoom: number): string;
}

interface TileCoord {
    x: number;
    y: number;
} // 瓦片坐标接口

// 定义props和models的类型
interface LabelData {
    id: string;
    position: [ number, number ];
    content: string;
    style?: CSSStyleDeclaration;
    offset?: [ number, number ];
    zIndex?: number;
} // 添加 zIndex
interface MarkerData {
    id: string;
    position: [ number, number ];
    title?: string;
    icon?: { url: string; size?: [ number, number ]; anchor?: [ number, number ]; imageOffset?: [ number, number ]; };
    zIndex?: number;
    shadow?: { url: string; size?: [ number, number ]; anchor?: [ number, number ]; imageOffset?: [ number, number ]; };
} // 添加 zIndex 并修正图标属性类型
interface PolylineData {
    id: string;
    points: [ number, number ][];
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    strokeStyle?: string;
    startIcon?: MarkerData['icon'];
    endIcon?: MarkerData['icon'];
} // 添加起点图标和终点图标
interface PolygonData {
    id: string;
    points: [ number, number ][];
    strokeColor?: string;
    fillColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    fillOpacity?: number;
    strokeStyle?: string;
} // 添加填充透明度
interface CircleData {
    id: string;
    center: [ number, number ];
    radius: number;
    strokeColor?: string;
    fillColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    fillOpacity?: number;
    strokeStyle?: string;
} // 添加填充透明度
interface TileLayerData {
    id: string;
    url: string;
    visible?: boolean;
} // 添加可见性
interface CustomStyleData {
    type: string;
    value: any;
} // 简化
interface BoundsData {
    north: number;
    south: number;
    east: number;
    west: number;
} // 修正为使用 north, south, east, west

// 存储实例的类型接口
interface Instances {
    markers: BMapMarker[];
    tileLayers: { [ key: string ]: BMapTileLayer };
    polylines: BMapPolyline[];
    polygons: BMapPolygon[];
    circles: BMapCircle[];
    labels: BMapLabel[];
    trajectories: Map<string, TrajectoryAnimation>; // 假设 TrajectoryAnimation 稍后定义
}

const { BMAP_ANCHOR_BOTTOM_LEFT } = (window as any);

defineOptions({ name: 'BaiduMap' });

const labels = defineModel<LabelData[]>('labels', {
    default: () => [] as LabelData[]
    // 结构示例:
    /*
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
    */
});

const markers = defineModel<MarkerData[]>('markers', {
    default: () => [] as MarkerData[]
    // 结构示例:
    /*
    [
        {
            id: 'marker-1',
            position: [lng, lat],
            title: '标题',
            icon: {
                url: 'marker.png',
                size: [32, 32],
                anchor: [16, 16],
                imageOffset: [0, 0]  // 图片偏移量
            }
        }
    ]
    */
});

const polylines = defineModel<PolylineData[]>('polylines', {
    default: () => [] as PolylineData[]
    // 结构示例:
    /*
    [
        {
            points: [[lng, lat], [lng, lat], ...],
            strokeColor: '#FF0000',
            strokeWeight: 2,
            strokeOpacity: 1,
            startIcon: {
                url: 'start.png',
                size: [32, 32],
                anchor: [16, 16],
                imageOffset: [0, 0]  // 图片偏移量
            },
            endIcon: {
                url: 'end.png',
                size: [32, 32],
                anchor: [16, 16],
                imageOffset: [0, 0]  // 图片偏移量
            }
        }
    ]
    */
});

const polygons = defineModel<PolygonData[]>('polygons', {
    default: () => [] as PolygonData[]
    // 结构示例:
    /*
    [
        {
            points: [[lng, lat], [lng, lat], ...],
            strokeColor: '#FF0000',
            fillColor: '#FF0000',
            strokeWeight: 2,
            strokeOpacity: 1,
            fillOpacity: 0.3
        }
    ]
    */
});

const circles = defineModel<CircleData[]>('circles', {
    default: () => [] as CircleData[]
    // 结构示例:
    /*
    [
        {
            center: [lng, lat],
            radius: 1000, // 单位：米
            strokeColor: '#FF0000',
            fillColor: '#FF0000',
            strokeWeight: 2,
            strokeOpacity: 1,
            fillOpacity: 0.3
        }
    ]
    */
});

const customStyle = defineModel<CustomStyleData | null>('customStyle', {
    default: null
});

const props = defineProps({
    // 初始中心点坐标 [经度, 纬度]
    center: {
        type: Array as unknown as PropType<[ number, number ]>, // 使用 Array 作为运行时类型，并添加中间转换用于 TypeScript
        default: () => [ 116.403981, 39.912223 ]
    },
    // 地图边界坐标（可选）
    bounds: {
        type: Object as PropType<BoundsData | null>,
        required: false,
        default: null
    },
    // 初始缩放级别
    zoom: {
        type: Number,
        default: 14
    },
    // 最小缩放级别
    minZoom: {
        type: Number,
        default: 10
    },
    // 最大缩放级别
    maxZoom: {
        type: Number,
        default: 19
    },
    // 是否允许鼠标滚轮缩放
    wheelZoom: {
        type: Boolean,
        default: true
    },
    scaleControl: {
        type: Boolean,
        default: false
    },
    navigationControl: {
        type: Boolean,
        default: false
    },
    // 是否允许拖拽地图
    dragging: {
        type: Boolean,
        default: true
    },
    // 额外的瓦片图层配置
    tileLayers: {
        type: Array as PropType<TileLayerData[]>,
        default: () => [] as TileLayerData[]
        // 结构示例: [{ id: 'layer1', url: '/custom-tiles/{z}/{z}/{x}/{y}.png', visible: true }]
    },
    offline: {
        type: Boolean,
        default: false
    },
    // 百度地图API密钥 (必填项)
    apiKey: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'BMAP_NORMAL_MAP'
    },
    debug: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits([
    'click',
    'map-click',
    'graphic-click',  // 统一的图形点击事件
    'api-error',      // API错误事件
    'api-loaded',     // API加载完成事件
    'map-loaded',      // 地图加载完成事件
    'error'
]);

// 定义地图容器引用
const mapContainer: Ref<HTMLElement | null> = ref(null);

// 定义地图实例
let map: any = null;

// 添加一个标志，用于防止递归调用 enforceBounds
let isEnforcingBounds = false;

// 状态管理
const state = reactive({
    isMapLoaded: false,
    isApiLoaded: false,
    hasApiError: false,
    apiErrorMessage: '',
    isInitializing: false
});

// 存储地图上的图形实例和轨迹动画实例
const instances = reactive<Instances>({
    markers: [],
    tileLayers: {},
    polylines: [],
    polygons: [],
    circles: [],
    labels: [],
    trajectories: new Map()
});

// 存储事件注册
const eventRegistry: { eventName: string; handler: Function }[] = [];

// 添加日志工具函数
const logger = {
    log: (message: string, ...args: any[]) => props.debug ? console.log(`【百度地图组件】${ message }`, ...args) : null,
    warn: (message: string, ...args: any[]) => {
        emit('error', { message, ...args });
        props.debug ? console.warn(`【百度地图组件】${ message }`, ...args) : null;
    },
    error: (message: string, ...args: any[]) => {
        emit('error', { message, ...args });
        props.debug ? console.error(`【百度地图组件】${ message }`, ...args) : null;
    }
};

// 获取当前站点根路径
const siteOrigin = computed(() => (window as any).location.origin);

// 是否已准备就绪
const isReady = computed(() => map !== null && state.isMapLoaded);

/**
 * 应用地图自定义样式
 * @returns {boolean} 应用是否成功
 */
const applyCustomMapStyle = () => {
    if (!map || !customStyle.value) return false;

    try {
        // 检查个性化样式配置
        const { type, value } = customStyle.value;

        if (!type || !value) {
            logger.warn('个性化地图样式配置不完整，type和value都必须提供');
            return false;
        }

        logger.log(`应用个性化地图样式，类型: ${ type }`);

        if (type === 'json') {
            // 通过样式JSON应用个性化地图
            let styleJson;

            // 如果value是字符串，尝试解析它
            if (typeof value === 'string') {
                try {
                    styleJson = JSON.parse(value);
                } catch (parseErr) {
                    logger.warn('解析样式JSON失败:', parseErr);
                    return false;
                }
            } else {
                // 否则假设它已经是一个对象
                styleJson = value;
            }

            map.setMapStyleV2({ styleJson });
            logger.log('已应用自定义样式JSON');
        } else {
            logger.warn(`不支持的个性化地图样式类型: ${ type }`);
        }
    } catch (err) {
        logger.warn('应用个性化地图样式时出错:', err);
    }
};

// ==================== 地图初始化 ====================

/**
 * 加载百度地图API
 * @returns {Promise<void>} 加载完成的Promise
 * @throws {Error} 加载失败时抛出错误
 */
const loadBaiduMapAPI = () => {
    // 检查是否正在加载或已加载
    if ((window as any).__baiduMapLoadingPromise) {
        logger.log('百度地图API正在加载或已加载，返回现有Promise');
        return (window as any).__baiduMapLoadingPromise;
    }

    // 创建新的Promise并存储到全局，表示开始加载
    const loadingPromise = new Promise((resolve, reject) => {
        // 记录开始加载时间，用于调试
        const startTime = Date.now();
        logger.log('开始加载百度地图API...');

        // 创建一个检查函数，在添加脚本前确认DOM环境
        const checkDOM = () => {
            // 检查document和body是否可用
            if (!document || !document.body) {
                const domError = new Error('DOM环境不可用，无法加载地图API');
                logger.warn(domError.message);
                reject(domError);
                return false;
            }

            // 检查容器是否存在
            if (!mapContainer.value) {
                const containerError = new Error('地图容器不存在，无法加载地图API');
                logger.warn(containerError.message);
                reject(containerError);
                return false;
            }

            return true;
        };

        // 设置一个全局标记，用于取消API加载后的回调
        (window as any)._baiduMapCancelled = false;

        // 移除之前的script标签(如果存在) - 在全局Promise模式下不再需要移除，只加载一次
        // const existingScript = document.querySelector('script[src*="api.map.baidu.com"]');
        // if (existingScript) {
        //     logger.log('检测到现有API脚本标签，正在移除...');
        //     existingScript.remove();
        // }

        // 如果API密钥为空，则不初始化地图
        if (!props.offline && (!props.apiKey || props.apiKey.trim() === '')) {
            const error = new Error('未提供百度地图API密钥');
            logger.warn(error.message);
            state.hasApiError = true;
            state.apiErrorMessage = error.message;
            emit('api-error', error);
            reject(error);
            return;
        }

        // 检查是否已加载百度地图API
        if ((window as any).BMap) {
            logger.log('百度地图API已加载，跳过加载过程');
            state.isApiLoaded = true;
            emit('api-loaded', { BMap: (window as any).BMap });
            resolve((window as any).BMap);
            return;
        }

        // 检查DOM环境
        if (!checkDOM()) {
            return;
        }

        // 创建一个唯一的回调函数名称，避免冲突
        const callbackName = `initBaiduMap_${ Date.now() }`;

        // API加载成功回调
        (window as any)[ callbackName ] = () => {
            // 检查是否已被取消
            if ((window as any)._baiduMapCancelled) {
                logger.warn('地图API加载完成，但组件已被卸载，忽略初始化');
                return;
            }

            clearTimeout(timeout);
            const loadTime = Date.now() - startTime;
            logger.log(`百度地图API加载成功，耗时: ${ loadTime }ms`);

            // 检查关键API对象和常量是否存在
            const apiStatus = {
                BMap: !!(window as any).BMap,
                BMAP_NORMAL_MAP: (window as any).BMAP_NORMAL_MAP !== undefined,
                BMAP_SATELLITE_MAP: (window as any).BMAP_SATELLITE_MAP !== undefined
            };
            logger.log('API状态检查:', apiStatus);

            // 再次检查DOM环境，防止在API加载期间组件已卸载
            if (!checkDOM()) {
                logger.warn('API已加载，但DOM环境已不可用，放弃初始化');
                return;
            }

            state.isApiLoaded = true;
            state.hasApiError = false;
            emit('api-loaded', { BMap: (window as any).BMap });
            resolve((window as any).BMap);
        };

        // 创建一个script标签加载API
        const script = document.createElement('script');

        if (!props.offline) {
            // 添加时间戳防止缓存问题并使用自定义回调
            script.src = `https://api.map.baidu.com/api?v=3.0&ak=${ props.apiKey }&callback=${ callbackName }&t=${ Date.now() }`;
            script.async = true;
        } else {
            (window as any).BMap_loadScriptTime = (new Date).getTime();
            //加载地图API主文件
            script.src = (window as any).mapConfig?.api;
            script.async = true;
            script.onload = (window as any)[ callbackName ];
        }

        // 设置超时处理
        const timeout = setTimeout(() => {
            // 检查是否已被取消
            if ((window as any)._baiduMapCancelled) {
                return;
            }

            const timeoutError = new Error('百度地图API加载超时');
            logger.warn(timeoutError.message);
            state.hasApiError = true;
            state.apiErrorMessage = timeoutError.message;
            emit('api-error', timeoutError);
            reject(timeoutError);
        }, 20000); // 20秒超时

        // API加载失败处理
        script.onerror = (event) => {
            // 检查是否已被取消
            if ((window as any)._baiduMapCancelled) {
                return;
            }

            clearTimeout(timeout);
            const errorDetails = {
                type: (event as any).type,
                bubbles: (event as any).bubbles,
                cancelable: (event as any).cancelable,
                timeStamp: (event as any).timeStamp
            };

            const error = new Error('百度地图API加载失败');
            logger.warn(`${ error.message }, 详情:`, errorDetails);
            state.hasApiError = true;
            state.apiErrorMessage = error.message;
            emit('api-error', error);
            reject(error);
        };

        logger.log(`正在添加API脚本标签, URL: ${ script.src }`);
        document.body.appendChild(script);
    });

    // 在全局存储加载 Promise
    (window as any).__baiduMapLoadingPromise = loadingPromise;

    // 在 Promise 状态确定后从全局清除
    loadingPromise.finally(() => {
        // 添加一个短暂延迟，允许任何依赖的代码运行
        setTimeout(() => {
            delete (window as any).__baiduMapLoadingPromise;
            logger.log('清理全局地图加载Promise');
        }, 0);
    });

    return loadingPromise;
};

/**
 * 初始化地图
 * @returns {Promise<void>}
 */
const initMap = async () => {
    if (!(window as any).BMap) {
        logger.warn('百度地图API未加载');
        try {
            logger.log('尝试重新加载百度地图API...');
            await loadBaiduMapAPI();
        } catch (err) {
            logger.warn('重试加载百度地图API失败:', err);
            emit('api-error', new Error('无法加载百度地图API，请检查网络连接和API密钥'));
            return;
        }

        // 再次检查API是否加载成功
        if (!(window as any).BMap) {
            logger.warn('百度地图API仍未加载，初始化失败');
            emit('api-error', new Error('API加载完成但无法访问BMap对象'));
            return;
        }
    }

    try {
        logger.log('开始初始化地图...');
        logger.log('当前网站根路径:', siteOrigin.value);

        // 检查容器元素
        if (!mapContainer.value) {
            logger.warn('地图容器元素不存在');
            return;
        }

        // 创建地图实例 - 添加配置以禁用版权控件
        map = new (window as any).BMap.Map(mapContainer.value, {
            enableDragging: props.dragging,
            minZoom: props.minZoom,
            maxZoom: props.maxZoom,
            enableMapClick: true,
            enableHighResolution: true,
            enableAutoResize: true,
            displayOptions: {
                building: false,
                poi: false,
                mapTypeControl: false,
                copyright: false  // 禁用版权控件
            }
        });

        // 处理地图类型设置
        try {
            if (!props.offline && (window as any)[ props.type ]) {
                // 如果存在指定的常量，使用它
                logger.log(`使用地图类型: ${ props.type }`);
                map.setMapType((window as any)[ props.type ]);
            } else if (props.type === 'BMAP_NORMAL_MAP' && (window as any).BMAP_NORMAL_MAP !== undefined) {
                // 普通地图类型
                logger.log('使用普通地图类型');
                map.setMapType((window as any).BMAP_NORMAL_MAP);
            } else if (props.type === 'BMAP_SATELLITE_MAP' && (window as any).BMAP_SATELLITE_MAP !== undefined) {
                // 卫星地图类型
                logger.log('使用卫星地图类型');
                map.setMapType((window as any).BMAP_SATELLITE_MAP);
            } else {
                // 默认使用普通地图类型（编号0）
                logger.warn(`未找到地图类型: ${ props.type }，使用默认类型`);
                map.setMapType(0);
            }
        } catch (typeErr) {
            logger.warn('设置地图类型时出错:', typeErr);
            // 继续执行，不要因为类型设置失败而中断整个初始化
        }

        // 设置中心点和缩放级别
        const center = createPoint(props.center);
        map.centerAndZoom(center, props.zoom);
        logger.log(`地图已居中到 (转换后): [${ props.center[ 0 ] }, ${ props.center[ 1 ] }], 原始: [${ props.center[ 0 ] }, ${ props.center[ 1 ] }], 缩放级别: ${ props.zoom }`);

        // 应用个性化地图样式
        if (customStyle.value) {
            try {
                applyCustomMapStyle();
            } catch (styleErr) {
                logger.warn('应用个性化地图样式失败:', styleErr);
            }
        }

        // 添加地图控件（保留比例尺控件，移除版权控件）
        if (props.navigationControl) {
            map.addControl(new (window as any).BMap.NavigationControl()); // 添加缩放控件
        }

        // 添加比例尺控件（明确保留）
        if (props.scaleControl) {
            const scaleControl = new (window as any).BMap.ScaleControl({
                anchor: BMAP_ANCHOR_BOTTOM_LEFT, // 将比例尺放在左下角
                offset: new (window as any).BMap.Size(10, 10)    // 偏移量
            });
            map.addControl(scaleControl);
        }

        // 查找并移除版权控件（作为备份措施）
        setTimeout(() => {
            try {
                // 仅移除版权控件，保留其他控件
                const copyrightControl = document.querySelector('.BMap_cpyCtrl');
                const baiduLink = document.querySelector('.anchorBL');
                if (copyrightControl) copyrightControl.remove();
                if (baiduLink) baiduLink.remove();

                // 确保比例尺控件可见
                const scaleControls = document.querySelectorAll('.BMap_scaleCtrl');
                scaleControls.forEach(ctrl => {
                    if (ctrl) (ctrl as HTMLElement).style.display = 'block'; // 添加类型断言
                });
            } catch (err) {
                logger.warn('移除版权控件失败:', err);
            }
        }, 100);

        // 配置鼠标滚轮缩放
        if (props.wheelZoom) {
            map.enableScrollWheelZoom();
        } else {
            map.disableScrollWheelZoom();
        }

        // 添加地图事件监听
        map.addEventListener('click', (e: any) => {
            // 注意：点击事件返回的坐标已经是百度坐标，不需要转换
            emit('map-click', e.point);
        });

        // 添加移动结束事件监听，用于限制地图可视范围
        map.addEventListener('moveend', enforceBounds);

        // 等待异步添加瓦片图层
        await addTileLayers();

        // 添加图形
        addMarkers(markers.value);
        addPolylines(polylines.value);
        addPolygons(polygons.value);
        addCircles(circles.value);
        addLabels(labels.value);

        // 更新地图加载状态
        state.isMapLoaded = true;
        emit('map-loaded', { map });

        logger.log('地图初始化完成');
    } catch (err) {
        logger.warn('地图初始化失败:', err);
        state.isMapLoaded = false;
    }
};

/**
 * 销毁地图实例
 * @returns {boolean} 操作是否成功
 */
const destroy = () => {
    logger.log('组件即将卸载，清理资源...');
    (window as any)._baiduMapCancelled = true;
    if ((window as any).onerror && typeof (window as any).onerror === 'function') {
        (window as any).onerror = null;
    }
    for (const key in (window as any)) {
        if (key.startsWith('initBaiduMap')) {
            (window as any)[ key ] = () => {
                logger.warn(`忽略已卸载组件的回调: ${ key }`);
            };
        }
    }
    if (map) {
        instances.markers = [];
        instances.tileLayers = {};
        clearPolylines();
        clearPolygons();
        clearCircles();
        clearLabels();
        try {
            // 自动解绑所有注册事件
            removeAllRegisteredEvents();
            logger.log('已自动解绑所有注册事件');
            if (typeof map.removeEventListener === 'function') {
                // 兼容性保留：移除特殊事件
                try {
                    map.removeEventListener('moveend', enforceBounds);
                    logger.log('已移除地图moveend事件监听器');
                    map.removeEventListener('click');
                    logger.log('已移除地图click事件监听器');
                } catch (eventErr) {
                    logger.warn('移除事件监听器失败:', eventErr);
                }
            }
            if (typeof map.clearOverlays === 'function') {
                map.clearOverlays();
                logger.log('已清除地图覆盖物');
            }
            if (typeof map.destroy === 'function') {
                map.destroy();
                logger.log('已调用地图destroy方法');
            }
            map = null;
            logger.log('已销毁地图实例');
        } catch (err) {
            logger.warn('清理地图资源时出错:', err);
        }
    } else {
        logger.log('地图实例已为空，无需清理');
    }
    try {
        const scriptTags = document.querySelectorAll('script[src*="api.map.baidu.com"]');
        scriptTags.forEach(script => {
            script.remove();
            logger.log('已移除百度地图API脚本标签');
        });
    } catch (scriptErr) {
        logger.warn('移除脚本标签失败:', scriptErr);
    }
};

/**
 * 添加事件监听器（自动注册到事件表）
 * @param {string} eventName 事件名称
 * @param {Function} handler 事件处理函数
 * @returns {boolean}
 */
const addEventListener = (eventName: string, handler: (...args: any[]) => any) => {
    if (!map) return false;
    try {
        map.addEventListener(eventName, handler);
        eventRegistry.push({ eventName, handler });
        return true;
    } catch (err) {
        logger.warn(`添加事件监听器[${ eventName }]失败:`, err);
        return false;
    }
};

/**
 * 移除事件监听器（自动从事件表移除）
 * @param {string} eventName 事件名称
 * @param {Function} handler 事件处理函数
 * @returns {boolean}
 */
const removeEventListener = (eventName: string, handler: (...args: any[]) => any) => {
    if (!map) return false;
    try {
        map.removeEventListener(eventName, handler);
        // 从注册表移除
        const idx = eventRegistry.findIndex(e => e.eventName === eventName && e.handler === handler);
        if (idx !== -1) eventRegistry.splice(idx, 1);
        return true;
    } catch (err) {
        logger.warn(`移除事件监听器[${ eventName }]失败:`, err);
        return false;
    }
};

/**
 * 批量解绑所有注册事件
 */
function removeAllRegisteredEvents() {
    if (!map) return;
    eventRegistry.forEach(({ eventName, handler }) => {
        try {
            map.removeEventListener(eventName, handler);
        } catch (err) {
        }
    });
    eventRegistry.length = 0;
}

/**
 * 获取地图中心点
 * @returns {Array<number>|null} 中心点坐标 [经度, 纬度]
 */
const getMapCenter = () => {
    if (!map) return null;
    const center = map.getCenter();
    return [ center.lng, center.lat ];
};

const panTo = (lng: number, lat: number) => {
    if (map) {
        try {
            const point = createPoint([ lng, lat ]);
            if (point) {
                map.panTo(point);
                return true;
            } else {
                logger.warn(`无法创建百度地图点进行平移, 原始坐标: [${ lng }, ${ lat }]`);
                return false;
            }
        } catch (err) {
            logger.warn('平移地图失败:', err);
            return false;
        }
    }
    return false;
};

/**
 * 获取地图缩放级别
 * @returns {number|null} 缩放级别
 */
const getZoom = () => {
    if (!map) return null;
    return map.getZoom();
};

const setZoom = (zoomLevel: number) => {
    if (map) {
        try {
            map.setZoom(zoomLevel);
            return true;
        } catch (err) {
            logger.warn('设置缩放级别失败:', err);
            return false;
        }
    }
    return false;
};

/**
 * 获取地图边界
 * @returns {Object|null} 边界对象 {north, south, east, west}
 */
const getBounds = () => {
    if (!map) return null;
    const bounds = map.getBounds();
    return {
        north: bounds.getNorthEast().lat,
        south: bounds.getSouthWest().lat,
        east: bounds.getNorthEast().lng,
        west: bounds.getSouthWest().lng
    };
};

/**
 * 设置地图边界
 * @param {Object} bounds 边界对象 {north, south, east, west}
 * @param {Object} [options={}] 选项
 * @returns {boolean} 操作是否成功
 */
const setBounds = (bounds: BoundsData, options: any = {}) => {
    if (!map) return false;
    try {
        const sw = createPoint([ bounds.west, bounds.south ]);
        const ne = createPoint([ bounds.east, bounds.north ]);
        const bBounds = new (window as any).BMap.Bounds(sw, ne);
        map.setBounds(bBounds, options);
        return true;
    } catch (err) {
        logger.warn('设置地图边界失败:', err);
        return false;
    }
};

/**
 * 确保地图在指定的可视范围内
 */
const enforceBounds = () => {
    if (isEnforcingBounds) return; // 防止递归调用
    isEnforcingBounds = true; // 设置标志

    // 如果没有设置bounds，则不进行边界限制
    if (!props.bounds) {
        isEnforcingBounds = false; // 重置标志
        return;
    }
    // 如果地图实例不存在或不可用，直接返回
    if (!map || !map.getBounds) {
        logger.warn('enforceBounds: 地图实例不可用，跳过边界检查');
        return;
    }

    try {
        // 首先检查地图对象的关键方法是否可用
        if (typeof map.getBounds !== 'function' || typeof map.getCenter !== 'function' || typeof map.panTo !== 'function') {
            logger.warn('enforceBounds: 地图实例方法不可用，跳过边界检查');
            return;
        }

        const currentBounds = map.getBounds();
        // 检查返回值是否正确
        if (!currentBounds || typeof currentBounds.getSouthWest !== 'function' || typeof currentBounds.getNorthEast !== 'function') {
            logger.warn('enforceBounds: 地图边界对象无效，跳过边界检查');
            return;
        }

        const currentCenter = map.getCenter();
        // 检查中心点是否有效
        if (!currentCenter || typeof currentCenter.lng === 'undefined' ||
            typeof currentCenter.lat === 'undefined') {
            logger.warn('enforceBounds: 地图中心点无效，跳过边界检查');
            return;
        }

        let needReset = false;
        let newCenter = { lng: currentCenter.lng, lat: currentCenter.lat };

        // 检查并调整经度
        if (currentBounds.getSouthWest().lng < props.bounds.west) {
            newCenter.lng += 0.01;
            needReset = true;
        }
        if (currentBounds.getNorthEast().lng > props.bounds.east) {
            newCenter.lng -= 0.01;
            needReset = true;
        }

        // 检查并调整纬度
        if (currentBounds.getSouthWest().lat < props.bounds.south) {
            newCenter.lat += 0.01;
            needReset = true;
        }
        if (currentBounds.getNorthEast().lat > props.bounds.north) {
            newCenter.lat -= 0.01;
            needReset = true;
        }

        // 如果需要重置位置，则平滑移动地图
        if (needReset) {
            const newPoint = createPoint([ newCenter.lng, newCenter.lat ]);
            if (newPoint) {
                map.panTo(newPoint);
            } else {
                logger.warn('enforceBounds: 无法创建新中心点');
            }
        }
    } catch (err) {
        logger.warn('执行边界限制失败', err);
        // 错误发生时，移除这个事件监听器以防止持续报错
        try {
            if (map && typeof map.removeEventListener === 'function') {
                map.removeEventListener('moveend', enforceBounds);
                logger.log('已移除地图moveend事件监听器');
            }
        } catch (removeErr) {
            logger.warn('移除事件监听器失败', removeErr);
        }
    } finally {
        isEnforcingBounds = false; // 执行后重置标志
    }
};

/**
 * 设置地图自定义样式
 * @param {Object} newStyle 新的样式配置
 * @returns {boolean} 设置是否成功
 */
const setCustomStyle = (newStyle: CustomStyleData) => {
    if (!map) return false;

    try {
        // 直接更新defineModel的值，defineModel会自动处理双向绑定
        customStyle.value = newStyle;
        applyCustomMapStyle();
        return true;
    } catch (err) {
        logger.warn('设置个性化地图样式失败:', err);
        return false;
    }
};

/**
 * 重新初始化地图
 * @returns {Promise<boolean>} 初始化是否成功
 */
const reinitMap = async () => {
    if (state.isInitializing) {
        logger.warn('地图正在初始化中，请勿重复操作');
        return false;
    }

    state.isInitializing = true;

    try {
        // 销毁现有地图实例
        if (map) {
            try {
                // 移除事件监听器
                if (typeof map.removeEventListener === 'function') {
                    map.removeEventListener('moveend', enforceBounds);
                    map.removeEventListener('click');
                    logger.log('重新初始化前已移除地图事件监听器');
                }

                // 清除覆盖物
                if (typeof map.clearOverlays === 'function') {
                    map.clearOverlays();
                }

                // 设置为null前记录状态
                logger.log('销毁旧地图实例');
            } catch (err) {
                logger.warn('清理旧地图实例时出错:', err);
                // 继续执行，不要因为清理错误而中断
            }

            // 强制设为null
            map = null;
            state.isMapLoaded = false;
        }

        // 检查DOM容器是否存在
        if (!mapContainer.value) {
            logger.warn('地图容器元素不存在');
            state.isInitializing = false;
            return Promise.reject('地图容器元素不存在');
        }

        // 加载百度地图API
        try {
            await loadBaiduMapAPI();
        } catch (apiError) {
            logger.warn('API加载失败，无法继续初始化:', apiError);
            state.isInitializing = false;
            return Promise.reject(apiError);
        }

        // 检查API是否成功加载
        if (!(window as any).BMap) {
            logger.warn('BMap对象不可用，初始化失败');
            state.isInitializing = false;
            return Promise.reject('BMap对象不可用，初始化失败');
        }

        // 等待DOM更新
        await nextTick();

        // 初始化地图
        await initMap();

        // 再次检查地图是否成功初始化
        if (!map) {
            logger.warn('地图实例创建失败，reinitMap过程未能产生有效的地图实例');
        } else {
            logger.log('地图重新初始化成功');
        }
    } catch (error: any) {
        logger.warn('重新初始化地图失败:', error.message);
        // 设置错误状态
        state.hasApiError = true;
        state.apiErrorMessage = error.message;
        emit('api-error', error);
        throw error;
    } finally {
        state.isInitializing = false;
    }
};

// ==================== 生命周期钩子和监听 ====================
// 组件挂载后执行
onMounted(() => {
    logger.log('组件已挂载，开始初始化地图...');

    // 添加全局错误处理器，用于捕获地图API的错误
    (window as any).onerror = (message: any, source: any, lineno: any, colno: any) => {
        if (!props.offline && source && source.includes('api.map.baidu.com')) {
            logger.warn(`百度地图API错误: ${ message }`, { lineno, colno });
            // 不阻止错误继续传播
            return false;
        }
    };

    // 检查DOM容器
    if (!mapContainer.value) {
        logger.warn('地图容器元素不存在，请检查DOM结构');
        return;
    }

    // 使用setTimeout确保DOM已完全准备好
    setTimeout(() => {
        reinitMap().catch(error => {
            logger.warn('地图初始化失败:', error);
            emit('api-error', error);
        });
    }, 0);
});

// 组件卸载前执行，清理资源
onBeforeUnmount(() => {
    clearTrajectories();
    destroy();
});

// 监听labels变化
watch(() => labels.value, (nv, ov) => {
    if (map && nv) {
        try {
            logger.log(`更新标签 (diff): 新增/移除 ${ nv.length }个, 原有 ${ ov ? ov.length : 0 }个`);
            // clearLabels();
            // addLabels(nv);
            // 实现diff更新
            diffAndAddUpdateRemove('labels', ov || [], nv || [], createLabel, updateLabel, removeLabel);
        } catch (err) {
            logger.warn('更新标签失败:', err);
        }
    }
}, { deep: true });

// 修改对markers, polylines, polygons, circles的监听
watch(() => markers.value, (nv, ov) => {
    if (map && nv) {
        try {
            logger.log(`更新标记点 (diff): 新增/移除 ${ nv.length }个, 原有 ${ ov ? ov.length : 0 }个`);
            // clearMarkers();
            // addMarkers(nv);
            // 实现diff更新
            diffAndAddUpdateRemove('markers', ov || [], nv || [], createMarker, updateMarker, removeMarker);
        } catch (err) {
            logger.warn('更新标记点失败:', err);
        }
    }
}, { deep: true });

watch(() => polylines.value, (nv, ov) => {
    if (map && nv) {
        try {
            logger.log(`更新折线 (diff): 新增/移除 ${ nv.length }条, 原有 ${ ov ? ov.length : 0 }条`);
            // clearPolylines();
            // addPolylines(nv);
            // 实现diff更新
            diffAndAddUpdateRemove('polylines', ov || [], nv || [], createPolyline, updatePolyline, removePolyline);
        } catch (err) {
            logger.warn('更新折线失败:', err);
        }
    }
}, { deep: true });

watch(() => polygons.value, (nv, ov) => {
    if (map && nv) {
        try {
            logger.log(`更新多边形 (diff): 新增/移除 ${ nv.length }个, 原有 ${ ov ? ov.length : 0 }个`);
            // clearPolygons();
            // addPolygons(nv);
            // 实现diff更新
            diffAndAddUpdateRemove('polygons', ov || [], nv || [], createPolygon, updatePolygon, removePolygon);
        } catch (err) {
            logger.warn('更新多边形失败:', err);
        }
    }
}, { deep: true });

watch(() => circles.value, (nv, ov) => {
    if (map && nv) {
        try {
            logger.log(`更新圆形 (diff): 新增/移除 ${ nv.length }个, 原有 ${ ov ? ov.length : 0 }个`);
            // clearCircles();
            // addCircles(nv);
            // 实现diff更新
            diffAndAddUpdateRemove('circles', ov || [], nv || [], createCircle, updateCircle, removeCircle);
        } catch (err) {
            logger.warn('更新圆形失败:', err);
        }
    }
}, { deep: true });

// 使用watch监听customStyle变化
watch(() => customStyle.value, (nv) => {
    // 如果地图已加载，应用样式
    if (map && nv) {
        try {
            logger.log('个性化地图样式配置已更新');
            applyCustomMapStyle();
        } catch (err) {
            logger.warn('更新个性化地图样式失败:', err);
        }
    }
}, { deep: true });

// 监听API密钥变化
watch(() => props.apiKey, (nv, oldVal) => {
    // 当API密钥发生变化且不为空时，重新初始化地图
    if (!props.offline && nv !== oldVal) {
        logger.log('API密钥已更新，正在重新初始化地图...');
        // 添加小延迟，确保其他状态已更新
        setTimeout(() => {
            reinitMap().catch(error => {
                logger.warn('API密钥更新后重新初始化地图失败:', error);
            });
        }, 100);
    }
});

// 监听props变化
watch(() => props.center, (nv, ov) => {
    if (map && nv && nv.length === 2 && nv[ 0 ] !== ov[ 0 ] && nv[ 1 ] !== ov[ 1 ]) {
        try {
            logger.log(`平移地图到新中心点 (转换后): [${ nv[ 0 ] }, ${ nv[ 1 ] }], 原始: [${ ov[ 0 ] }, ${ ov[ 1 ] }]`);
            const point = createPoint(nv);
            if (point) {
                map.panTo(point);
            } else {
                logger.warn(`无法创建百度地图点进行平移, 原始坐标: ${ nv }`);
            }
        } catch (err) {
            logger.warn('设置地图中心点失败:', err);
        }
    }
}, { deep: true });

watch(() => props.zoom, (nv) => {
    if (map && nv) {
        try {
            logger.log(`设置新缩放级别: ${ nv }`);
            map.setZoom(nv);
        } catch (err) {
            logger.warn('设置缩放级别失败:', err);
        }
    }
});

watch(() => props.dragging, (nv) => {
    if (map) {
        try {
            if (nv) {
                logger.log('启用地图拖拽');
                map.enableDragging();
            } else {
                logger.log('禁用地图拖拽');
                map.disableDragging();
            }
        } catch (err) {
            logger.warn('切换拖拽状态失败:', err);
        }
    }
});

// 监听滚轮缩放设置变化
watch(() => props.wheelZoom, (nv) => {
    if (map) {
        try {
            if (nv) {
                logger.log('启用滚轮缩放');
                map.enableScrollWheelZoom();
            } else {
                logger.log('禁用滚轮缩放');
                map.disableScrollWheelZoom();
            }
        } catch (err) {
            logger.warn('切换滚轮缩放状态失败:', err);
        }
    }
});

// 监听瓦片图层配置变化
watch(() => props.tileLayers, (nv) => {
    if (map && nv) {
        try {
            logger.log(`瓦片图层配置已更新: ${ nv.length }个图层`);
            addTileLayers();
        } catch (err) {
            logger.warn('更新瓦片图层失败:', err);
        }
    }
}, { deep: true });

// ==================== 图形绘制管理 ====================

/**
 * 创建图形对象
 * @param {string} type 图形类型
 * @param {Object} data 图形数据
 * @param {Function} creator 图形创建函数
 * @returns {Object} 创建的图形对象
 */
const createGraphic = (type: string, data: any, creator: (data: any) => any) => {
    try {
        // 创建图形实例
        const graphic = creator(data);
        // 存储原始数据，方便后续更新或事件处理
        graphic.userData = data;

        // 添加点击事件监听器
        graphic.addEventListener('click', (e: any) => {
            if (!graphic) return;

            // 阻止事件冒泡，避免触发地图点击事件
            e.domEvent.stopPropagation();

            // 获取图形数据
            const graphicData = {
                type,
                ...graphic.userData
            };

            // 触发统一的图形点击事件
            emit('graphic-click', graphicData);

        });

        return graphic;
    } catch (err) {
        logger.warn(`创建${ type }图形失败:`, err);
        return null;
    }
};

/**
 * 根据原始坐标创建百度地图点对象
 * @param {Array<number>} coords 原始坐标 [经度, 纬度]
 * @returns {BMap.Point|null} 百度地图点对象，创建失败返回null
 */
const createPoint = (coords: [ number, number ]) => {
    if (coords && coords.length === 2) {
        try {
            return new (window as any).BMap.Point(coords[ 0 ], coords[ 1 ]);
        } catch (err) {
            logger.warn(`创建 BMap.Point 失败: ${ coords }`, err);
            return null;
        }
    }
    logger.warn(`无法创建百度地图点，坐标无效: ${ coords }`);
    return null;
};
/**
 * 创建标签对象
 * @param {Object} labelData 标签数据
 * @param {Array<number>} labelData.position 标签位置坐标 [经度, 纬度]
 * @param {string} labelData.content 标签内容
 * @param {Object} [labelData.style] 标签样式
 * @returns {Object} 创建的标签对象
 */
const createLabel = (labelData: LabelData) => {
    return createGraphic('label', labelData, (data) => {
        const point = createPoint(data.position);
        if (!point) {
            logger.warn('创建标签失败，位置无效:', data);
            return null;
        }

        // 创建标签覆盖物
        let label = new (window as any).BMap.Label(data.content, {
            offset: data.offset ? new (window as any).BMap.Size(data.offset[ 0 ], data.offset[ 1 ]) : new (window as any).BMap.Size(0, 0),
            position: point
        });

        // 应用样式
        if (data.style) {
            label.setStyle(data.style);
        }

        return label;
    });
};

// ======== 通用图形管理器函数 ========

/**
 * 通用添加图形到地图和实例列表
 * @param {string} type 图形类型（markers、polylines、polygons、circles、labels、trajectories）
 * @param {Object} data 图形数据
 * @param {Function} creator 图形创建函数
 * @returns {boolean} 是否成功添加
 */
function addGraphic<T extends keyof Instances>(type: T, data: any, creator: (data: any) => any): boolean {
    if (!map) return false;
    try {
        const graphic = creator(data);
        if (graphic) {
            if (type === 'trajectories') {
                // TrajectoryAnimation is a Map, not an array
                // This case should be handled separately in addTrajectory
                logger.warn(`addGraphic 不支持类型: ${ type }`);
                return false;
            } else if (Array.isArray(instances[ type ])) {
                map.addOverlay(graphic);
                (instances[ type ] as any[]).push(graphic);
                return true;
            } else {
                logger.warn(`instances.${ type } 不是一个数组，无法添加图形`);
                return false;
            }
        }
        logger.warn(`${ type }创建失败，未添加:`, data);
        return false;
    } catch (err: any) {
        logger.warn(`动态添加${ type }失败:`, err);
        return false;
    }
}

/**
 * 通用批量添加图形
 */
function addGraphics<T extends keyof Instances>(type: T, list: any[], creator: (data: any) => any): void {
    if (!map) return;
    if (type === 'trajectories') {
        logger.warn(`addGraphics 不支持类型: ${ type }`);
        return;
    }
    list.forEach(item => addGraphic(type, item, creator));
}

/**
 * 通用移除图形
 */
function removeGraphic<T extends keyof Instances>(type: T, id: string): boolean {
    if (!map) return false;
    try {
        if (type === 'trajectories') {
            // TrajectoryAnimation is a Map, not an array
            // This case should be handled separately in removeTrajectory
            logger.warn(`removeGraphic 不支持类型: ${ type }`);
            return false;
        } else if (Array.isArray(instances[ type ])) {
            const arr = instances[ type ] as any[];
            const idx = arr.findIndex((g: any) => g.userData && g.userData.id === id);
            if (idx === -1) {
                logger.warn(`移除${ type }失败，未找到ID为${ id }的图形`);
                return false;
            }
            const graphic = arr[ idx ];
            map.removeOverlay(graphic);
            arr.splice(idx, 1);
            return true;
        } else {
            logger.warn(`instances.${ type } 不是一个数组，无法移除图形`);
            return false;
        }
    } catch (err: any) {
        logger.warn(`移除${ type }[${ id }]失败:`, err);
        return false;
    }
}

/**
 * 通用通过ID更新地图上的图形实例（需要提供特定类型的更新函数）
 * @param {string} type 图形类型
 * @param {string} id 图形数据的唯一ID
 * @param {Function} updater 针对该类型图形的更新函数，接收图形实例作为参数
 * @returns {boolean} 是否成功更新
 */
function updateGraphic<T extends keyof Instances>(type: T, id: string, updater: (graphic: any) => void): boolean {
    if (!map) return false;
    try {
        if (type === 'trajectories') {
            logger.warn(`updateGraphic 不支持类型: ${ type }`);
            return false;
        } else if (Array.isArray(instances[ type ])) {
            const arr = instances[ type ] as any[];
            const graphic = arr.find((g: any) => g.userData && g.userData.id === id);
            if (!graphic) {
                logger.warn(`更新${ type }失败，未找到ID为${ id }的图形`);
                return false;
            }
            updater(graphic);
            return true;
        } else {
            logger.warn(`instances.${ type } 不是一个数组，无法更新图形`);
            return false;
        }
    } catch (err: any) {
        logger.warn(`更新${ type }[${ id }]失败:`, err);
        return false;
    }
}

/**
 * 通用清空地图上某类型的所有图形和实例列表
 * @param {string} type 图形类型
 */
function clearGraphics<T extends keyof Instances>(type: T): void {
    if (!map) return;
    if (type === 'trajectories') {
        logger.warn(`clearGraphics 不支持类型: ${ type }`);
        return;
    }
    const arr = instances[ type ] as any[];
    // 从地图上移除所有实例对应的覆盖物
    arr.forEach((g: any) => {
        try {
            map.removeOverlay(g);
        } catch (err: any) {
            logger.warn(`移除${ type }失败:`, err);
        }
    });
    // 清空实例数组
    (instances[ type ] as any[]) = [];
}

// ======== 保持原有API兼容性，内部调用通用方法 ========

const addLabel = (labelData: LabelData) => addGraphic('labels', labelData, createLabel);
const addLabels = (labelsList: LabelData[]) => addGraphics('labels', labelsList, createLabel);
const removeLabel = (id: string) => removeGraphic('labels', id);
const clearLabels = () => clearGraphics('labels');
const updateLabel = (id: string, newContent: string, newStyle = null) => updateGraphic('labels', id, (label: any) => { // 参数 label 声明类型
    if (newContent) (label.getContent() as HTMLElement).innerHTML = newContent; // 断言类型
    if (newStyle) Object.assign((label.getContent() as HTMLElement).style, newStyle); // 断言类型
});

const addMarker = (options: MarkerData) => addGraphic('markers', options, createMarker);
const addMarkers = (markersList: MarkerData[]) => addGraphics('markers', markersList, createMarker);
const removeMarker = (id: string) => removeGraphic('markers', id);
const clearMarkers = () => clearGraphics('markers');
const updateMarker = (id: string, newPosition: [ number, number ] | undefined, newOptions: Partial<MarkerData> = {}) => updateGraphic('markers', id, (marker: BMapMarker) => {
    if (newPosition) {
        const bPoint = createPoint(newPosition);
        if (bPoint) marker.setPosition(bPoint);
    }
    if (newOptions.icon) {
        const { url, size = [ 32, 32 ], anchor = [ 16, 16 ], imageOffset = [ 0, 0 ] } = newOptions.icon;
        const icon = new (window as any).BMap.Icon(url, new (window as any).BMap.Size(...size), {
            anchor: new (window as any).BMap.Size(...anchor),
            imageOffset: newOptions.icon.imageOffset ? new (window as any).BMap.Size(...imageOffset) : null
        });
        marker.setIcon(icon);
    }
    if (newOptions.title !== undefined) marker.setTitle(newOptions.title);
    if (typeof newOptions.zIndex === 'number') marker.setZIndex(newOptions.zIndex);
});

const addPolyline = (options: PolylineData) => addGraphic('polylines', options, createPolyline);
const addPolylines = (polylinesList: PolylineData[]) => addGraphics('polylines', polylinesList, createPolyline);
const removePolyline = (id: string) => removeGraphic('polylines', id);
const clearPolylines = () => clearGraphics('polylines');
const updatePolyline = (id: string, newPoints: [ number, number ][] | undefined, newOptions: Partial<PolylineData> = {}) => updateGraphic('polylines', id, (polyline: BMapPolyline) => {
    if (newPoints && newPoints.length >= 2) {
        const bPoints = newPoints.map(createPoint).filter(bp => bp !== null);
        if (bPoints.length >= 2) polyline.setPath(bPoints);
    }
    if (newOptions.strokeColor) polyline.setStrokeColor(newOptions.strokeColor);
    if (newOptions.strokeWeight) polyline.setStrokeWeight(newOptions.strokeWeight);
    if (newOptions.strokeOpacity) polyline.setStrokeOpacity(newOptions.strokeOpacity);
});

const addPolygon = (options: PolygonData) => addGraphic('polygons', options, createPolygon);
const addPolygons = (polygonsList: PolygonData[]) => addGraphics('polygons', polygonsList, createPolygon);
const removePolygon = (id: string) => removeGraphic('polygons', id);
const clearPolygons = () => clearGraphics('polygons');
const updatePolygon = (id: string, newPoints: [ number, number ][] | undefined, newOptions: Partial<PolygonData> = {}) => updateGraphic('polygons', id, (polygon: BMapPolygon) => {
    if (newPoints && newPoints.length >= 3) {
        const bPoints = newPoints.map(createPoint).filter(bp => bp !== null);
        if (bPoints.length >= 3) polygon.setPath(bPoints);
    }
    if (newOptions.strokeColor) polygon.setStrokeColor(newOptions.strokeColor);
    if (newOptions.fillColor) polygon.setFillColor(newOptions.fillColor);
    if (newOptions.strokeWeight) polygon.setStrokeWeight(newOptions.strokeWeight);
    if (newOptions.strokeOpacity) polygon.setStrokeOpacity(newOptions.strokeOpacity);
    if (newOptions.fillOpacity) polygon.setFillOpacity(newOptions.fillOpacity);
});

const addCircle = (options: CircleData) => addGraphic('circles', options, createCircle);
const addCircles = (circlesList: CircleData[]) => addGraphics('circles', circlesList, createCircle);
const removeCircle = (id: string) => removeGraphic('circles', id);
const clearCircles = () => clearGraphics('circles');
const updateCircle = (id: string, newCircle: CircleData, newOptions: Partial<CircleData> = {}) => updateGraphic('circles', id, (circle: BMapCircle) => {
    if (newCircle) {
        const bCenter = createPoint(newCircle.center);
        if (bCenter) circle.setCenter(bCenter);
    }
    if (newCircle.radius) circle.setRadius(newCircle.radius);
    if (newOptions.strokeColor) circle.setStrokeColor(newOptions.strokeColor);
    if (newOptions.fillColor) circle.setFillColor(newOptions.fillColor);
    if (newOptions.strokeWeight) circle.setStrokeWeight(newOptions.strokeWeight);
    if (newOptions.strokeOpacity) circle.setStrokeOpacity(newOptions.strokeOpacity);
    if (newOptions.fillOpacity) circle.setFillOpacity(newOptions.fillOpacity);
});

/**
 * 创建标记点对象
 * @param {MarkerData} markerData 标记点数据对象
 * @param {string} markerData.id 标记点唯一ID
 * @param {[number, number]} markerData.position 标记点位置坐标 [经度, 纬度]
 * @param {string} [markerData.title] 标记点标题（鼠标悬停提示）
 * @param {Object} [markerData.icon] 标记点图标配置
 * @param {string} markerData.icon.url 图标图片URL
 * @param {[number, number]} [markerData.icon.size] 图标尺寸 [宽, 高]
 * @param {[number, number]} [markerData.icon.anchor] 图标锚点 [x, y]
 * @param {[number, number]} [markerData.icon.imageOffset] 图标图片偏移量 [x, y]
 * @param {number} [markerData.zIndex] 标记点的zIndex层级
 * @returns {BMapMarker | null} 创建的标记点对象，失败返回null
 */
const createMarker = (markerData: MarkerData): BMapMarker | null => {
    if (!(window as any).BMap) return null; // 检查 BMap
    return createGraphic('marker', markerData, (data: MarkerData) => {
        const point = createPoint(data.position);
        if (!point) return null; // 如果创建点失败，则不继续创建标记

        const marker = new (window as any).BMap.Marker(point, {
            shadow: null,
            enableMassClear: true
        });

        // 设置自定义图标
        if (data.icon) {
            let { url, size = [ 0, 0 ], anchor, imageOffset } = data.icon;

            let option: any = {};
            if (Array.isArray(anchor) && anchor.length === 2) {
                option.anchor = new (window as any).BMap.Size(anchor[ 0 ], anchor[ 1 ]);
            }
            if (Array.isArray(imageOffset) && imageOffset.length === 2) {
                option.imageOffset = new (window as any).BMap.Size(imageOffset[ 0 ], imageOffset[ 1 ]);
            }

            const icon = new (window as any).BMap.Icon(url, new (window as any).BMap.Size(size[ 0 ], size[ 1 ]), option);

            marker.setIcon(icon);
        }

        // 如果有标题，设置提示文字
        if (data.title) {
            marker.setTitle(data.title);
        }

        if (data.shadow) {
            const { url, size = [ 0, 0 ], anchor, imageOffset } = data.shadow;
            let option: any = {};
            if (Array.isArray(anchor) && anchor.length === 2) {
                option.anchor = new (window as any).BMap.Size(anchor[ 0 ], anchor[ 1 ]);
            }
            if (Array.isArray(imageOffset) && imageOffset.length === 2) {
                option.imageOffset = new (window as any).BMap.Size(imageOffset[ 0 ], imageOffset[ 1 ]);
            }
            const icon = new (window as any).BMap.Icon(url, new (window as any).BMap.Size(size[ 0 ], size[ 1 ]), option);
            marker.setShadow(icon);
        }

        if (typeof data.zIndex === 'number') {
            marker.setZIndex(data.zIndex);
        }

        return marker;
    });
};

/**
 * 创建折线对象
 * @param {PolylineData} polylineData 折线数据对象
 * @param {string} polylineData.id 折线唯一ID
 * @param {[number, number][]} polylineData.points 折线点坐标数组，每个点为 [经度, 纬度]
 * @param {string} [polylineData.strokeColor] 折线颜色
 * @param {number} [polylineData.strokeWeight] 折线宽度
 * @param {number} [polylineData.strokeOpacity] 折线透明度
 * @param {string} [polylineData.strokeStyle] 折线样式（如 'solid'、'dashed'）
 * @param {Object} [polylineData.startIcon] 起点图标配置，结构同 MarkerData.icon
 * @param {Object} [polylineData.endIcon] 终点图标配置，结构同 MarkerData.icon
 * @returns {BMapPolyline | null} 创建的折线对象，失败返回null
 */
const createPolyline = (polylineData: PolylineData): BMapPolyline | null => {
    if (!(window as any).BMap) return null; // 检查 BMap
    return createGraphic('polyline', polylineData, (data: PolylineData) => {
        const bPoints = data.points.map(createPoint).filter((bp): bp is BMapPoint => bp !== null);
        if (bPoints.length < 2) { // 折线至少需要两个点
            logger.warn(`创建折线失败，有效点不足: ${ bPoints.length }`, data);
            return null;
        }
        return new (window as any).BMap.Polyline(bPoints, {
            strokeColor: data.strokeColor,
            strokeWeight: data.strokeWeight,
            strokeOpacity: data.strokeOpacity,
            strokeStyle: data.strokeStyle
        });
    });
};

/**
 * 创建多边形对象
 * @param {PolygonData} polygonData 多边形数据对象
 * @param {string} polygonData.id 多边形唯一ID
 * @param {[number, number][]} polygonData.points 多边形点坐标数组，每个点为 [经度, 纬度]
 * @param {string} [polygonData.strokeColor] 边框颜色
 * @param {string} [polygonData.fillColor] 填充颜色
 * @param {number} [polygonData.strokeWeight] 边框宽度
 * @param {number} [polygonData.strokeOpacity] 边框透明度
 * @param {number} [polygonData.fillOpacity] 填充透明度
 * @param {string} [polygonData.strokeStyle] 边框样式（如 'solid'、'dashed'）
 * @returns {BMapPolygon | null} 创建的多边形对象，失败返回null
 */
const createPolygon = (polygonData: PolygonData): BMapPolygon | null => {
    if (!(window as any).BMap) return null; // 检查 BMap
    return createGraphic('polygon', polygonData, (data: PolygonData) => {
        const bPoints = data.points.map(createPoint).filter((bp): bp is BMapPoint => bp !== null); // 声明 bp 类型并使用类型谓词
        if (bPoints.length < 3) { // 多边形至少需要三个点
            logger.warn(`创建多边形失败，有效点不足: ${ bPoints.length }`, data);
            return null;
        }
        return new (window as any).BMap.Polygon(bPoints, {
            strokeColor: data.strokeColor,
            fillColor: data.fillColor,
            strokeWeight: data.strokeWeight,
            strokeOpacity: data.strokeOpacity,
            fillOpacity: data.fillOpacity,
            strokeStyle: data.strokeStyle
        });
    });
};

/**
 * 创建圆形对象
 * @param {CircleData} circleData 圆形数据对象
 * @param {string} circleData.id 圆形唯一ID
 * @param {[number, number]} circleData.center 圆心坐标 [经度, 纬度]
 * @param {number} circleData.radius 圆半径（单位：米）
 * @param {string} [circleData.strokeColor] 边框颜色
 * @param {string} [circleData.fillColor] 填充颜色
 * @param {number} [circleData.strokeWeight] 边框宽度
 * @param {number} [circleData.strokeOpacity] 边框透明度
 * @param {number} [circleData.fillOpacity] 填充透明度
 * @param {string} [circleData.strokeStyle] 边框样式（如 'solid'、'dashed'）
 * @returns {BMapCircle | null} 创建的圆形对象，失败返回null
 */
const createCircle = (circleData: CircleData): BMapCircle | null => {
    if (!(window as any).BMap) return null; // 检查 BMap
    return createGraphic('circle', circleData, (data: CircleData) => {
        const center = createPoint(data.center);
        if (!center) {
            logger.warn('创建圆形失败，中心点无效', data);
            return null;
        }
        return new (window as any).BMap.Circle(center, data.radius, {
            strokeColor: data.strokeColor,
            fillColor: data.fillColor,
            strokeWeight: data.strokeWeight,
            strokeOpacity: data.strokeOpacity,
            fillOpacity: data.fillOpacity,
            strokeStyle: data.strokeStyle
        });
    });
};

// ==================== 瓦片图层管理 ====================
/**
 * 创建自定义瓦片图层
 * @param {string} url 瓦片URL模板
 * @returns {Object|null} 瓦片图层实例，创建失败返回null
 */
const createCustomTileLayer = (url: string): BMapTileLayer | null => {
    if (!(window as any).BMap) {
        logger.warn('BMap未初始化，无法创建瓦片图层');
        return null;
    }

    try {
        let tileLayer = new (window as any).BMap.TileLayer({});
        tileLayer.getTilesUrl = (tileCoord: TileCoord, zoom: number): string => {
            try {
                const x = tileCoord.x;
                const y = tileCoord.y;

                // 生成瓦片URL
                // 确保 x, y, zoom 转换为字符串以匹配 generateTileUrl 可能期望的类型
                const tileUrl = generateTileUrl(url, String(x), String(y), String(zoom));

                // 日志输出完整URL用于调试（仅在开发环境）
                logger.log(`瓦片请求URL: ${ siteOrigin.value }${ tileUrl }`);

                return tileUrl;
            } catch (err: any) {
                logger.warn(`生成瓦片URL时出错: ${ err.message }`);
                // 返回一个空白或错误提示图片
                return '/error-tile.png';
            }
        };

        return tileLayer;
    } catch (err: any) {
        logger.warn(`创建瓦片图层失败: ${ err.message }`);
        return null;
    }
};

/**
 * 添加瓦片图层
 * @param {string} id 图层ID
 * @param {string} url 瓦片URL模板
 * @param {boolean} [visible=true] 是否可见
 * @returns {boolean} 操作是否成功
 */
const addTileLayer = (id: string, url: string, visible = true) => {
    if (!map) return false;

    try {
        const tileLayer = createCustomTileLayer(url);
        if (tileLayer) {
            map.addTileLayer(tileLayer);
            // 存储图层实例
            instances.tileLayers[ id ] = tileLayer;

            if (!visible) {
                tileLayer.hide();
            }

            return true;
        }
        return false;
    } catch (err) {
        logger.warn(`动态添加图层[${ id }]失败:`, err);
        return false;
    }
};

/**
 * 添加所有瓦片图层
 * @returns {Promise<void>}
 */
const addTileLayers = async () => {
    if (!map) {
        logger.warn('地图未初始化，无法添加瓦片图层');
        return;
    }

    try {
        logger.log('开始添加瓦片图层...');

        // 清除现有瓦片图层
        clearTileLayers();

        // 添加额外的瓦片图层
        if (props.tileLayers && props.tileLayers.length > 0) {
            logger.log(`开始添加${ props.tileLayers.length }个自定义瓦片图层`);

            for (const layer of props.tileLayers) {
                if (!layer.url) {
                    logger.warn(`图层缺少url属性`);
                    continue;
                }
                // if (!layer.visible) { // 保留这行来跳过不可见图层
                //     continue;
                // }

                try {
                    // 修正瓦片路径 - 确保以/开头
                    const layerUrl = formatUrl(layer.url);

                    const layerId = layer.id || `layer-${ Date.now() }-${ props.tileLayers.indexOf(layer) }`;
                    logger.log(`添加图层: id=${ layerId }, url=${ layerUrl }`);

                    const tileLayer = createCustomTileLayer(layerUrl);
                    if (tileLayer) {
                        // 使用addTileLayer将图层添加到地图
                        map.addTileLayer(tileLayer);

                        // 存储图层实例以便后续控制
                        instances.tileLayers[ layerId ] = tileLayer;

                        // 如果图层设置为不可见，则隐藏它
                        // if (layer.visible === false) { // 删除多余的检查
                        //     logger.log(`隐藏图层: ${ layerId }`);
                        //     tileLayer.hide();
                        // }

                        logger.log(`图层[${ layerId }]添加成功`);
                    }
                } catch (err: any) {
                    logger.warn(`添加图层[${ layer.id || props.tileLayers.indexOf(layer) }]失败:`, err);
                }
            }
        }
    } catch (err: any) {
        logger.warn('添加瓦片图层过程中发生错误:', err);
    }
};

/**
 * 清除所有瓦片图层
 * @returns {void}
 */
const clearTileLayers = () => {
    if (!map) return;

    logger.log('清除现有瓦片图层...');
    try {
        // 移除所有现有的瓦片图层
        Object.entries(instances.tileLayers).forEach(([ id, layer ]) => {
            try {
                logger.log(`移除图层: ${ id }`);
                map.removeTileLayer(layer);
            } catch (err) {
                logger.warn(`移除图层[${ id }]失败:`, err);
            }
        });
        instances.tileLayers = {};
    } catch (err) {
        logger.warn('清除瓦片图层过程中发生错误:', err);
    }
};

/**
 * 获取所有瓦片图层ID
 * @returns {Array<string>} 图层ID数组
 */
const getTileLayers = () => Object.keys(instances.tileLayers);

/**
 * 显示瓦片图层
 * @param {string} layerId 图层ID
 * @returns {boolean} 操作是否成功
 */
const showTileLayer = (layerId: string) => {
    if (!map) return false;

    try {
        if (instances.tileLayers[ layerId ]) {
            logger.log(`显示图层: ${ layerId }`);
            instances.tileLayers[ layerId ].show();
            return true;
        } else {
            logger.warn(`图层未找到: ${ layerId }`);
            return false;
        }
    } catch (err) {
        logger.warn(`显示图层[${ layerId }]失败:`, err);
        return false;
    }
};

/**
 * 隐藏瓦片图层
 * @param {string} layerId 图层ID
 * @returns {boolean} 操作是否成功
 */
const hideTileLayer = (layerId: string) => {
    if (!map) return false;

    try {
        if (instances.tileLayers[ layerId ]) {
            logger.log(`隐藏图层: ${ layerId }`);
            instances.tileLayers[ layerId ].hide();
            return true;
        } else {
            logger.warn(`图层未找到: ${ layerId }`);
            return false;
        }
    } catch (err) {
        logger.warn(`隐藏图层[${ layerId }]失败:`, err);
        return false;
    }
};

/**
 * 重新加载瓦片图层
 * @returns {boolean} 操作是否成功
 */
const reloadTileLayers = () => {
    if (map) {
        try {
            addTileLayers();
            return true;
        } catch (err) {
            logger.warn('重新加载瓦片图层失败:', err);
            return false;
        }
    }
    return false;
};

// 添加轨迹动画相关的类和方法
class TrajectoryAnimation {
    private map: any;
    private points: [ number, number ][];
    private options: { // Add explicit type
        strokeColor?: string;
        strokeWeight?: number;
        strokeOpacity?: number;
        strokeStyle?: string;
        speed: number; // meters per second
        icon?: MarkerData['icon'];
        startIcon?: MarkerData['icon'];
        endIcon?: MarkerData['icon'];
        autoRotate?: boolean;
        onComplete?: () => void;
        [ key: string ]: any; // Allow other options
    };
    private polyline: any | null; // 改为 any | null
    private marker: any | null; // 改为 any | null
    private startMarker: any | null; // 改为 any | null
    private endMarker: any | null; // 改为 any | null
    private currentIndex: number;
    private isPlaying: boolean;
    private isPaused: boolean;

    /**
     * 创建轨迹动画实例
     * @param map 地图实例
     * @param points 轨迹点坐标数组 [[经度, 纬度], ...]
     * @param [options] 动画选项
     * @param [options.duration=5000] 动画持续时间(毫秒)
     * @param [options.loop=false] 是否循环播放
     * @param [options.icon] 移动图标URL
     * @param [options.iconSize] 图标大小 [宽度, 高度]
     */
    constructor(map: any, points: [ number, number ][], options: any = {}) {
        this.map = map;
        this.points = points;
        this.options = {
            strokeColor: options.strokeColor || '#FF0000',
            strokeWeight: options.strokeWeight || 3,
            strokeOpacity: options.strokeOpacity || 0.8,
            speed: options.speed || 500, // 移动速度，单位：米/秒
            icon: options.icon || null,
            startIcon: options.startIcon || null, // 起点图标
            endIcon: options.endIcon || null,     // 终点图标
            autoRotate: options.autoRotate || false, // 是否自动旋转标记
            onComplete: options.onComplete || null, // 动画完成回调
            onProgress: options.onProgress || null, // 动画进度回调
            ...options
        };
        this.polyline = null;
        this.marker = null;
        this.startMarker = null;  // 起点标记
        this.endMarker = null;    // 终点标记
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.init();
    }

    /**
     * 初始化轨迹动画所需的所有元素
     * @private
     * @returns {void}
     */
    init() {
        try {
            // 创建折线
            const bPoints = this.points.map(createPoint);
            this.polyline = new (window as any).BMap.Polyline(bPoints as any[], {
                strokeColor: this.options.strokeColor,
                strokeWeight: this.options.strokeWeight,
                strokeOpacity: this.options.strokeOpacity,
                strokeStyle: this.options.strokeStyle
            });
            this.map.addOverlay(this.polyline);

            // 创建移动标记点
            const startPoint = bPoints[ 0 ];
            if (this.options.icon) {
                const icon = new (window as any).BMap.Icon(
                    this.options.icon.url,
                    new (window as any).BMap.Size(...(this.options.icon.size || [ 32, 32 ])),
                    {
                        anchor: new (window as any).BMap.Size(...(this.options.icon.anchor || [ 16, 16 ])),
                        imageOffset: this.options.icon.imageOffset ? new (window as any).BMap.Size(...this.options.icon.imageOffset) : new (window as any).BMap.Size(0, 0)
                    }
                ) as any;
                this.marker = new (window as any).BMap.Marker(startPoint, { icon }) as any;
            } else {
                this.marker = new (window as any).BMap.Marker(startPoint) as any;
            }
            // 设置移动标记点的zIndex为最高层级
            this.marker.setZIndex(100);
            this.map.addOverlay(this.marker);

            // 创建起点标记
            if (this.options.startIcon) {
                const startIcon = new (window as any).BMap.Icon(
                    this.options.startIcon.url,
                    new (window as any).BMap.Size(...(this.options.startIcon.size || [ 32, 32 ])),
                    {
                        anchor: new (window as any).BMap.Size(...(this.options.startIcon.anchor || [ 16, 16 ])),
                        imageOffset: this.options.startIcon.imageOffset ? new (window as any).BMap.Size(...this.options.startIcon.imageOffset) : new (window as any).BMap.Size(0, 0)
                    }
                ) as any;
                this.startMarker = new (window as any).BMap.Marker(startPoint, { icon: startIcon }) as any;
                // 设置起点标记的zIndex为较低层级
                this.startMarker.setZIndex(10);
                this.map.addOverlay(this.startMarker);
            }

            // 创建终点标记
            if (this.options.endIcon) {
                const endPoint = bPoints[ bPoints.length - 1 ];
                const endIcon = new (window as any).BMap.Icon(
                    this.options.endIcon.url,
                    new (window as any).BMap.Size(...(this.options.endIcon.size || [ 32, 32 ])),
                    {
                        anchor: new (window as any).BMap.Size(...(this.options.endIcon.anchor || [ 16, 16 ])),
                        imageOffset: this.options.endIcon.imageOffset ? new (window as any).BMap.Size(...this.options.endIcon.imageOffset) : new (window as any).BMap.Size(0, 0)
                    }
                ) as any;
                this.endMarker = new (window as any).BMap.Marker(endPoint, { icon: endIcon }) as any;
                // 设置终点标记的zIndex为较低层级
                this.endMarker.setZIndex(10);
                this.map.addOverlay(this.endMarker);
            }

            logger.log('轨迹动画初始化完成');
        } catch (err: any) {
            logger.warn('轨迹动画初始化失败:', err);
            // 如果初始化失败，清理已创建的元素
            this.destroy();
        }
    }

    /**
     * 开始播放动画
     * @returns {void}
     */
    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.isPaused = false;
        // Ensure marker exists before calling animate
        if (this.marker) {
            this.animate();
        } else {
            logger.warn('播放轨迹动画失败: 移动标记点未初始化');
        }
    }

    /**
     * 暂停动画
     * @returns {void}
     */
    pause() {
        this.isPaused = true;
        this.isPlaying = false;
    }

    /**
     * 停止动画
     * @returns {void}
     */
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentIndex = 0;

        // 重置标记点位置
        const startPoint = createPoint(this.points[ 0 ]);
        if (this.marker && startPoint) {
            this.marker.setPosition(startPoint);
        }
    }

    /**
     * 重置动画
     * @returns {void}
     */
    reset() {
        this.stop();
        if (this.polyline) this.map.removeOverlay(this.polyline);
        if (this.marker) this.map.removeOverlay(this.marker);
        if (this.startMarker) this.map.removeOverlay(this.startMarker);
        if (this.endMarker) this.map.removeOverlay(this.endMarker);
        // 重新初始化
        this.init();
    }

    /**
     * 执行动画
     * @private
     * @returns {void}
     */
    animate() {
        if (!this.isPlaying || this.isPaused) return;

        if (this.currentIndex >= this.points.length - 1) {
            this.isPlaying = false;
            this.isPaused = false;
            this.currentIndex = 0;
            if (typeof this.options.onComplete === 'function') {
                this.options.onComplete();
            }
            return;
        }

        const currentPoint = createPoint(this.points[ this.currentIndex ]);
        const nextPoint = createPoint(this.points[ this.currentIndex + 1 ]);

        // Ensure points and marker exist
        if (!currentPoint || !nextPoint || !this.marker) {
            logger.warn('执行轨迹动画帧失败: 点或标记点无效');
            this.stop(); // 停止动画以防无限循环
            return;
        }

        // 计算两点间距离和所需时间
        const distance = this.map.getDistance(currentPoint, nextPoint);
        const duration = (distance / this.options.speed) * 1000; // 转换为毫秒

        let startTime: number | null = null;
        let lastTime: number | null = null;
        let progress = 0;

        const animateFrame = (timestamp: number) => {
            if (!this.isPlaying || this.isPaused || !this.marker) return;

            if (!startTime) startTime = timestamp;
            if (!lastTime) lastTime = timestamp;

            // 计算经过的时间
            const elapsed = timestamp - startTime;
            progress = Math.min(elapsed / duration, 1);

            // 计算当前位置
            const lng = currentPoint.lng + (nextPoint.lng - currentPoint.lng) * progress;
            const lat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * progress;
            const currentPos = createPoint([ lng, lat ]);

            if (currentPos) {
                // 更新标记位置
                this.marker.setPosition(currentPos);

                // 计算角度用于旋转标记
                if (this.options.autoRotate && this.marker.setRotation) { // 检查setRotation是否存在
                    // 计算方向角度：正北为0度，顺时针增加
                    const dx = nextPoint.lng - currentPoint.lng;
                    const dy = nextPoint.lat - currentPoint.lat;
                    // 使用 atan2 计算角度，返回的是弧度，范围从 -PI 到 PI
                    // 转换为度，并调整使其相对于正北方向顺时针
                    let angle = Math.atan2(dx, dy) * 180 / Math.PI;

                    // 确保角度在0-360度之间
                    if (angle < 0) {
                        angle += 360;
                    }

                    this.marker.setRotation(angle);
                }
            }

            // 如果动画未完成，继续下一帧
            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                // 当前段动画完成，继续下一段
                this.currentIndex++;
                // 确保移动标记精确停留在段终点
                this.marker.setPosition(nextPoint);
                this.animate();
            }

            lastTime = timestamp;

            // 调用进度回调
            if (typeof this.options.onProgress === 'function') {
                // 提供当前位置和当前段的进度
                this.options.onProgress({
                    position: [ currentPos.lng, currentPos.lat ],
                    segmentProgress: progress
                });
            }
        };

        // 启动动画
        requestAnimationFrame(animateFrame);
    }

    /**
     * 销毁动画实例
     * @returns {void}
     */
    destroy() {
        this.stop();
        if (this.polyline) this.map.removeOverlay(this.polyline);
        if (this.marker) this.map.removeOverlay(this.marker);
        if (this.startMarker) this.map.removeOverlay(this.startMarker);
        if (this.endMarker) this.map.removeOverlay(this.endMarker);
    }
}

/**
 * 添加轨迹动画
 * @param {string} id - 轨迹的唯一标识符
 * @param {Array<Array<number>>} points - 轨迹点坐标数组，每个点格式为 [经度, 纬度]
 * @param {Object} [options={}] - 轨迹动画配置选项
 * @param {string} [options.strokeColor='#FF0000'] - 轨迹线颜色
 * @param {number} [options.strokeWeight=3] - 轨迹线宽度
 * @param {number} [options.strokeOpacity=0.8] - 轨迹线透明度
 * @param {number} [options.speed=500] - 移动速度，单位：米/秒
 * @param {Object} [options.icon] - 移动标记点图标配置
 * @param {string} options.icon.url - 图标URL
 * @param {Array<number>} [options.icon.size=[32,32]] - 图标大小 [宽度, 高度]
 * @param {Array<number>} [options.icon.anchor=[16,16]] - 图标锚点位置
 * @param {Array<number>} [options.icon.imageOffset=[0,0]] - 图标偏移量
 * @param {boolean} [options.autoRotate=false] - 移动标记是否自动沿轨迹方向旋转
 * @param {Object} [options.startIcon] - 起点图标配置，格式同icon
 * @param {Object} [options.endIcon] - 终点图标配置，格式同icon
 * @param {Function} [options.onComplete] - 动画完成时调用的回调函数
 * @param {Function} [options.onProgress] - 动画过程中调用的进度回调函数，参数为 { position: [lng, lat], segmentProgress: number }
 * @returns {Object|null} 轨迹控制对象，包含play/pause/stop/reset/destroy方法，创建失败返回null
 */
const addTrajectory = (id: string, points: [ number, number ][], options: any = {}) => {
    if (!map || !points || points.length < 2) {
        logger.warn('添加轨迹失败：参数无效');
        return null;
    }

    try {
        // 如果已存在同ID的轨迹，先销毁它
        if (instances.trajectories.has(id)) {
            const existingTrajectory = instances.trajectories.get(id); // 获取实例
            if (existingTrajectory) { // 添加 undefined 检查
                existingTrajectory.destroy();
            }
        }

        // 创建新的轨迹动画实例
        const trajectory = new TrajectoryAnimation(map, points, options);
        instances.trajectories.set(id, trajectory);

        return {
            play: () => trajectory.play(),
            pause: () => trajectory.pause(),
            stop: () => trajectory.stop(),
            reset: () => trajectory.reset(),
            destroy: () => {
                trajectory.destroy();
                instances.trajectories.delete(id);
            }
        };
    } catch (err) {
        logger.warn('添加轨迹失败:', err);
        return null;
    }
};

/**
 * 获取指定ID的轨迹动画实例
 * @param {string} id - 轨迹的唯一标识符
 * @returns {Object|null} 轨迹控制对象，如果未找到返回null
 */
const getTrajectory = (id: string) => instances.trajectories.get(id);

/**
 * 移除指定ID的轨迹动画
 * @param {string} id - 轨迹的唯一标识符
 * @returns {boolean} 操作是否成功
 */
const removeTrajectory = (id: string): boolean => {
    if (instances.trajectories.has(id)) {
        try {
            const trajectory = instances.trajectories.get(id);
            if (trajectory) {
                trajectory.destroy();
            }
            instances.trajectories.delete(id);
            logger.log(`轨迹[${ id }]已移除`);
            return true;
        } catch (err: any) {
            logger.warn(`移除轨迹[${ id }]失败:`, err);
            return false;
        }
    }
    return false;
};

/**
 * 清除所有轨迹动画
 * @returns {boolean} 操作是否成功
 */
const clearTrajectories = (): boolean => {
    instances.trajectories.forEach(trajectory => trajectory.destroy());
    instances.trajectories.clear();
    return true;
};

/**
 * 控制图形显示/隐藏
 * @param {string} [type] 图形类型：'markers'|'polylines'|'polygons'|'circles'
 * @param {string} [id] 图形ID
 * @param {boolean} [visible=true] 是否显示
 */
const toggleGraphics = (type?: keyof Omit<Instances, 'trajectories'>, id?: string, visible: boolean = true) => {
    if (!map) return;

    try {
        // 控制所有图形
        if (!type) {
            // 处理所有标记点
            instances.markers.forEach((marker: BMapMarker) => {
                visible ? marker.show() : marker.hide();
            });
            // 处理所有折线
            instances.polylines.forEach((polyline: BMapPolyline) => {
                visible ? polyline.show() : polyline.hide();
            });
            // 处理所有多边形
            instances.polygons.forEach((polygon: BMapPolygon) => {
                visible ? polygon.show() : polygon.hide();
            });
            // 处理所有圆形
            instances.circles.forEach((circle: BMapCircle) => {
                visible ? circle.show() : circle.hide();
            });
            return;
        }

        // 控制特定类型
        if (!id) {
            switch (type) {
                case 'markers':
                    instances.markers.forEach((marker: BMapMarker) => {
                        visible ? marker.show() : marker.hide();
                    });
                    break;
                case 'polylines':
                    instances.polylines.forEach((polyline: BMapPolyline) => {
                        visible ? polyline.show() : polyline.hide();
                    });
                    break;
                case 'polygons':
                    instances.polygons.forEach((polygon: BMapPolygon) => {
                        visible ? polygon.show() : polygon.hide();
                    });
                    break;
                case 'circles':
                    instances.circles.forEach((circle: BMapCircle) => {
                        visible ? circle.show() : circle.hide();
                    });
                    break;
            }
            return;
        }

        // 控制单个图形
        const findGraphic = <T extends keyof Omit<Instances, 'trajectories'>>(collection: Instances[T], graphicId: string): (Instances[T] extends (infer U)[] ? U : never) | undefined => {
            if (!Array.isArray(collection)) { // 确保 collection 是数组
                return undefined;
            }
            return (collection as any[]).find((item: any) => item.userData && item.userData.id === graphicId);
        };

        switch (type) {
            case 'markers':
                const marker = findGraphic(instances.markers, id);
                if (marker) {
                    visible ? (marker as BMapOverlay).show() : (marker as BMapOverlay).hide();
                }
                break;
            case 'polylines':
                const polyline = findGraphic(instances.polylines, id);
                if (polyline) {
                    visible ? (polyline as BMapOverlay).show() : (polyline as BMapOverlay).hide();
                }
                break;
            case 'polygons':
                const polygon = findGraphic(instances.polygons, id);
                if (polygon) {
                    visible ? (polygon as BMapOverlay).show() : (polygon as BMapOverlay).hide();
                }
                break;
            case 'circles':
                const circle = findGraphic(instances.circles, id);
                if (circle) {
                    visible ? (circle as BMapOverlay).show() : (circle as BMapOverlay).hide();
                }
                break;
        }
    } catch (err: any) {
        logger.warn('控制图形显示状态失败:', err);
    }
};

/**
 * 计算两点之间的距离
 * @param {BMap.Point} point1 第一个点
 * @param {BMap.Point} point2 第二个点
 * @returns {number} 距离（米）
 */
const calculateDistance = (point1: BMapPoint, point2: BMapPoint): number => {
    if (!map || !map.getDistance) return 0;
    return map.getDistance(point1, point2);
};

// ==================== 错误恢复函数 ====================
/**
 * 自动恢复地图（当检测到地图实例无效时）
 * @param {boolean} forceReinit 是否强制重新初始化
 * @return {Promise<boolean>} 恢复结果
 */
const autoRecoverMap = async (forceReinit = false): Promise<boolean> => {
    if (!forceReinit && map && state.isMapLoaded) {
        logger.log('地图实例正常，无需恢复');
        return true;
    }

    logger.warn('检测到地图实例异常，尝试自动恢复...');

    try {
        // 重新初始化地图
        await reinitMap();
        logger.log('地图自动恢复成功');
        return true;
    } catch (err: any) {
        logger.warn('地图自动恢复失败:', err);
        return false;
    }
};

const clearErrorState = (): boolean => {
    state.hasApiError = false;
    state.apiErrorMessage = '';
    return true;
};

/**
 * 检查环境是否支持百度地图
 * @return {Object} 环境检查结果
 */
const checkEnvironment = (): object => {
    try {
        // 检查DOM环境
        const hasDocument = typeof document !== 'undefined';
        // 检查浏览器环境
        const hasBrowser = typeof (window as any) !== 'undefined';
        // 检查容器元素
        const hasContainer = !!mapContainer.value;
        // 检查API状态
        const apiStatus = {
            apiKey: !!props.apiKey,
            BMap: !!(window as any).BMap,
            isApiLoaded: state.isApiLoaded,
            hasApiError: state.hasApiError
        };

        const result = {
            hasDocument,
            hasBrowser,
            hasContainer,
            apiStatus,
            userAgent: hasBrowser ? (window as any).navigator.userAgent : '未知'
        };

        logger.log('环境检查结果:', result);
        return result;
    } catch (err: any) {
        logger.warn('环境检查失败:', err);
        return { error: err.message };
    }
};

// ==================== 应急处理函数 ====================
/**
 * 紧急断开所有地图资源连接
 * 用于处理严重错误情况，强制清理所有地图相关资源
 */
const emergencyDisconnect = (): boolean => {
    logger.warn('执行紧急断开操作...');

    try {
        // 1. 标记为已取消，阻止任何回调执行
        (window as any)._baiduMapCancelled = true;

        // 2. 移除正在加载的脚本
        try {
            const scripts = document.querySelectorAll('script[src*="api.map.baidu.com"]') as NodeListOf<HTMLScriptElement>;
            scripts.forEach(script => {
                script.onerror = null; // 移除错误处理器
                script.onload = null;  // 移除加载处理器
                script.remove();
            });
            logger.log('已移除所有百度地图API脚本');
        } catch (scriptErr) {
            logger.warn('移除脚本失败:', scriptErr);
        }

        // 3. 尝试通过DOM操作断开连接
        try {
            // 移除所有百度地图相关元素
            const mapElements = document.querySelectorAll([
                '.BMap_mask', '.BMap_cpyCtrl', '.BMap_scaleCtrl',
                '.BMap_omCtrl', '.BMap_stdMpCtrl', '.BMap_pop',
                '.BMap_shadow', '.BMap_noprint', '.anchorBL'
            ].join(','));

            mapElements.forEach(el => {
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
            logger.log('已移除所有百度地图相关DOM元素');

            // 清空地图容器
            if (mapContainer.value) {
                mapContainer.value.innerHTML = '';
                logger.log('已清空地图容器');
            }
        } catch (domErr) {
            logger.warn('清理DOM元素失败:', domErr);
        }

        // 4. 移除百度地图挂载的全局对象和事件
        try {
            // 清理已知的全局回调
            for (const key in (window as any)) {
                if ((key.startsWith('BMap') || key.startsWith('initBaiduMap') || key.startsWith('_BMap'))) {
                    (window as any)[ key ] = undefined;
                }
            }

            // 移除可能的全局事件监听器（已注释，避免类型报错）
            // if ((window as any).removeEventListener) {
            //     (window as any).removeEventListener('resize', null);
            //     (window as any).removeEventListener('online', null);
            //     (window as any).removeEventListener('offline', null);
            // }

            logger.log('已清理百度地图全局对象');
        } catch (error: any) {
            logger.warn('清理全局对象失败:', error);
        }

        // 5. 设置地图实例为null
        map = null;

        // 6. 重置内部状态
        state.isMapLoaded = false;
        state.isApiLoaded = false;

        logger.log('紧急断开操作完成');
        return true;
    } catch (err: any) {
        logger.warn('紧急断开操作失败:', err);
        return false;
    }
};

/**
 * 清除地图上所有覆盖物（不区分类型，直接调用BMap原生API）
 */
const clearAllOverlays = (): void => {
    if (map && typeof map.clearOverlays === 'function') {
        map.clearOverlays();
        // 同步清空实例管理数组
        instances.markers = [];
        instances.polylines = [];
        instances.polygons = [];
        instances.circles = [];
        instances.labels = [];
    }
};

/**
 * 通用diff算法及增删改图形函数
 * @param {string} type 图形类型
 * @param {Array} oldList 旧数据列表
 * @param {Array} newList 新数据列表
 * @param {Function} creator 图形创建函数
 * @param {Function} updater 图形更新函数 (可选)
 * @param {Function} remover 图形移除函数
 */
const diffAndAddUpdateRemove = <T extends { id: string }>(
    type: string,
    oldList: T[],
    newList: T[],
    creator: (data: any) => unknown,
    updater: ((id: string, data: any) => void) | undefined,
    remover: (id: string) => void
): void => {
    if (!map) return;

    const oldMap = new Map(oldList.map((item: T) => [ item.id, item ]));
    const newMap = new Map(newList.map((item: T) => [ item.id, item ]));

    // 1. 移除旧的但新列表中不存在的图形
    oldList.forEach((oldItem: T) => {
        if (!newMap.has(oldItem.id)) {
            logger.log(`移除${ type } (diff): ID ${ oldItem.id }`);
            remover(oldItem.id);
        }
    });

    // 2. 添加新的图形和更新现有图形
    newList.forEach((newItem: T) => {
        if (!oldMap.has(newItem.id)) {
            // 新增图形
            logger.log(`新增${ type } (diff): ID ${ newItem.id }`);
            addGraphic(type as any, newItem, creator);
        } else {
            // 检查是否需要更新
            const oldItem = oldMap.get(newItem.id);
            // 简单的深层比较（可以根据实际情况优化比较逻辑）
            if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                logger.log(`更新${ type } (diff): ID ${ newItem.id }`);
                // 调用类型特定的更新函数
                if (updater) {
                    // 需要将新的完整数据传递给updater，以便它可以根据新数据更新图形
                    updater(newItem.id, newItem);
                } else {
                    // 如果没有提供updater，则移除旧的再新增新的
                    logger.warn(`类型 ${ type } 没有提供updater函数，移除旧的再新增`);
                    remover((oldItem as T).id);
                    addGraphic(type as any, newItem, creator);
                }
            }
        }
    });

    // 更新实例数组以匹配当前地图上的图形
    // 这部分依赖于addGraphic和remover内部是否正确管理instances数组
    // 确保 addGraphic 会添加到 instances[type]
    // 确保 remover 会从 instances[type] 移除
    // 如果不是，需要在这里根据newList重建instances[type]数组
    // 假设 addGraphic 和 remover 已经正确管理了 instances[type]
};

// ==================== 导出方法 ====================
// 暴露方法供父组件调用
defineExpose({
    isReady,
    getState: () => ({ ...state }),
    destroy,
    addEventListener,
    removeEventListener,
    getMapCenter,
    panTo,
    getZoom,
    setZoom,
    getBounds,
    setBounds,
    setCustomStyle,
    reinitMap,
    getTileUrl,
    addLabel,
    addLabels,
    updateLabel,
    removeLabel,
    clearLabels,
    addMarker,
    addMarkers,
    removeMarker,
    updateMarker,
    clearMarkers,
    addPolyline,
    addPolylines,
    updatePolyline,
    removePolyline,
    clearPolylines,
    addPolygon,
    addPolygons,
    removePolygon,
    updatePolygon,
    clearPolygons,
    addCircle,
    addCircles,
    removeCircle,
    updateCircle,
    clearCircles,
    clearAllOverlays,
    addTrajectory,
    getTrajectory,
    removeTrajectory,
    clearTrajectories,
    addTileLayer,
    showTileLayer,
    hideTileLayer,
    getTileLayers,
    reloadTileLayers,
    toggleGraphics,
    calculateDistance,
    autoRecoverMap,
    clearErrorState,
    checkEnvironment,
    emergencyDisconnect
});

</script>

<template>
<div class="baidu-map-wrapper">
    <div v-if="!offline && !apiKey" class="api-key-error">
        <div class="error-content">
            <h3>缺少百度地图API密钥</h3>
            <p>请提供有效的百度地图API密钥以初始化地图</p>
            <a class="get-key-link" href="https://lbsyun.baidu.com/" target="_blank">获取密钥</a>
        </div>
    </div>
    <div ref="mapContainer" :class="{ 'hidden': !offline && !apiKey }" class="baidu-map-container"></div>
    <slot name="controls"></slot>
</div>
</template>

