/**
 * 坐标转换相关常量
 */
export const x_pi = 3.14159265358979324 * 3000.0 / 180.0;

/**
 * 将GCJ-02坐标转换为BD-09坐标
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @returns {Array<number>} 转换后的BD-09坐标 [经度, 纬度]
 */
export const gcj02ToBd09 = (lng, lat) => {
    const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_pi);
    const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_pi);
    const longitude = z * Math.cos(theta) + 0.0065;
    const latitude = z * Math.sin(theta) + 0.006;
    return [ longitude, latitude ];
};

/**
 * 格式化URL路径，确保以/开头
 * @param {string} url 原始URL
 * @returns {string} 格式化后的URL
 */
export const formatUrl = (url) => {
    if (!url.startsWith('/') && !url.startsWith('http')) {
        return '/' + url;
    }
    return url;
};

/**
 * 生成瓦片URL
 * @param {string} url URL模板
 * @param {string} x X坐标
 * @param {string} y Y坐标
 * @param {string} zoom 缩放级别
 * @returns {string} 生成的瓦片URL
 */
export const generateTileUrl = (url, x, y, zoom) => {
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
 * 获取瓦片URL
 * @param {string} template URL模板
 * @param {string} x X坐标
 * @param {string} y Y坐标
 * @param {string} zoom 缩放级别
 * @returns {string|null} 瓦片URL，生成失败返回null
 */
export const getTileUrl = (template, x, y, zoom) => {
    try {
        return generateTileUrl(template, x, y, zoom);
    } catch (err) {
        console.warn('生成测试瓦片URL失败:', err.message || err);
        return null;
    }
};

/**
 * 2D坐标判断在围栏中
 * @param { Number } x - 原坐标x
 * @param { Number } y - 原坐标y
 * @param { Array } vertexes - 围栏范围坐标
 * @return { Boolean } 是否在围栏中
 * */
export const isInside = (x, y, vertexes) => {

    let intersections = 0;

    let length = vertexes.length;

    for (let i = 0; i < length; i++) {

        let c = vertexes[ i ];
        let n = vertexes[ (i + 1) % length ];
        let cx = c[ 0 ];
        let cy = c[ 1 ];
        let nx = n[ 0 ];
        let ny = n[ 1 ];

        if ((cy > y) !== (ny > y) && x < (nx - cx) * (y - cy) / (ny - cy) + cx) {
            intersections++;
        }
    }

    return intersections % 2 === 1;

    /*
    let intersectCount = 0;

    for (let i = 0; i < vertexes.length - 1; i++) {

        let x1 = vertexes[ i ][ 0 ];
        let y1 = vertexes[ i ][ 1 ];
        let x2 = vertexes[ i + 1 ][ 0 ];
        let y2 = vertexes[ i + 1 ][ 1 ];

        if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
            // 计算交点的x坐标
            let xIntersect = (x1 + (y - y1) * (x2 - x1) / (y2 - y1));

            if (xIntersect <= x) {
                intersectCount++;
            }
        }
    }

    return intersectCount % 2 === 1;
    */

    /*
    let intersect = false;

    for (let i = 0, j = vertexes.length - 1; i < vertexes.length; j = i++) {

        let xi = vertexes[ i ][ 0 ], yi = vertexes[ i ][ 1 ];
        let xj = vertexes[ j ][ 0 ], yj = vertexes[ j ][ 1 ];

        let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) {
            intersect = !intersect;
        }
    }

    return intersect;
    */
};

/**
 * 2D坐标获取中心点
 * @param { Array } vertexes - 坐标列表
 * @return { Array } 中心坐标
 * */
export const getCenter = (vertexes) => {

    let [ minX, maxX, minY, maxY ] = [
        vertexes[ 0 ][ 0 ], vertexes[ 0 ][ 0 ],
        vertexes[ 0 ][ 1 ], vertexes[ 0 ][ 1 ]
    ];

    for (let i = 1; i < vertexes.length; i++) {

        const [ x, y ] = vertexes[ i ];
        minX = x < minX ? x : minX;
        maxX = x > maxX ? x : maxX;
        minY = y < minY ? y : minY;
        maxY = y > maxY ? y : maxY;
    }

    return [ (minX + maxX) * 0.5, (minY + maxY) * 0.5 ];
};
