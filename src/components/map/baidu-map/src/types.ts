// 地图相关类型定义

export interface Label {
    id: string;
    position: [ number, number ];
    content: string;
    style?: {
        color?: string;
        fontSize?: string;
        fontWeight?: string;
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: string;
        borderRadius?: string;
        padding?: string;
        boxShadow?: string;
    };
    offset?: [ number, number ];
    zIndex?: number;
}

export interface Marker {
    id: string;
    position: [ number, number ];
    title?: string;
    icon?: {
        url: string;
        size: [ number, number ];
        anchor: [ number, number ];
        imageOffset?: [ number, number ];
    };
    zIndex?: number;
}

export interface Polyline {
    id: string;
    points: [ number, number ][];
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    startIcon?: {
        url: string;
        size: [ number, number ];
        anchor: [ number, number ];
        imageOffset?: [ number, number ];
    };
    endIcon?: {
        url: string;
        size: [ number, number ];
        anchor: [ number, number ];
        imageOffset?: [ number, number ];
    };
}

export interface Polygon {
    id: string;
    points: [ number, number ][];
    strokeColor?: string;
    fillColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    fillOpacity?: number;
}

export interface Circle {
    id: string;
    center: [ number, number ];
    radius: number;
    strokeColor?: string;
    fillColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    fillOpacity?: number;
}

export interface TileLayer {
    id: string;
    url: string;
    visible?: boolean;
}

export interface BaiduMapProps {
    center?: [ number, number ];
    bounds?: any;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    wheelZoom?: boolean;
    scaleControl?: boolean;
    navigationControl?: boolean;
    dragging?: boolean;
    tileLayers?: TileLayer[];
    offline?: boolean;
    apiKey: string;
    type?: string;
    onGraphicClick?: Function;
    debug?: boolean;
}

export interface MapState {
    isMapLoaded: boolean;
    isApiLoaded: boolean;
    hasApiError: boolean;
    apiErrorMessage: string;
    isInitializing: boolean;
}
