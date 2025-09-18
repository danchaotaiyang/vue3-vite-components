<script setup>
import { computed, ref, watch } from 'vue';
import * as d3 from 'd3';


const props = defineProps({
    data: {
        type: Array,
        default: () => ([])
    },
    width: {
        type: Number,
        default: 800
    },
    height: {
        type: Number,
        default: 400
    },
    itemHeight: {
        type: Number
    },
    mainRange: {
        type: Array
    },
    crossRange: {
        type: Array
    },
    offsetX: {
        type: Number,
        default: 20
    },
    offsetY: {
        type: Number,
        default: 20
    },
    offsetStart: {
        type: Number,
        default: 1
    },
    offsetEnd: {
        type: Number,
        default: 8
    },
    duration: {
        type: Number,
        default: 1000
    },
    ease: {
        type: String,
        default: 'easeCubic'
    },
    color: {
        type: String,
        default: '#000000'
    },
    atLast: {
        type: Boolean,
        default: true
    }
});

const daysInMillis = 24 * 60 * 60 * 1000;
let { width, height, itemHeight, offsetX, offsetY, offsetStart, offsetEnd, mainRange, crossRange, duration, ease, color, atLast } = props;

let $svg;
let $clipPath;
let $panel;
let $axisX;
let $mainAxis;
let $gClip;
let $crossAxis;
let __step__height__;
let __domain__min__;
let __domain__max__;
let __range__x__min__;
let __range__x__max__;
let __range__y__min__;
let __range__y__max__;
let __d_s_x__ = 0;
let __d_e_x__ = 0;
let __d_o_x__ = 0;
let __d_t_x__ = 0;
let __d_s_y__ = 0;
let __d_e_y__ = 0;
let __d_o_y__ = 0;
let __d_t_y__ = 0;
let __scale__time__ = d3.scaleTime();

if (!Array.isArray(mainRange) || mainRange.length !== 2) {
    mainRange = [ 0, width ];
}
__range__x__min__ = mainRange[ 0 ];
__range__x__max__ = mainRange[ 1 ];

if (!Array.isArray(crossRange) || crossRange.length !== 2) {
    crossRange = [ 0, height ];
}

__range__y__min__ = crossRange[ 0 ];
__range__y__max__ = crossRange[ 1 ];

if (atLast) {
    __d_t_x__ = -(__range__x__max__ - width);
}

const chartRef = ref();
const tipRef = ref();
const tipInfoRef = ref(null);
const tipPositionRef = ref([ 0, 0 ]);
const timestamp = new Date().getTime();

const tipStyle = computed(() => {
    let [ x, y ] = tipPositionRef.value;
    x += offsetX;
    if (tipRef.value) {
        const { clientWidth } = tipRef.value;
        if (x + clientWidth > width) {
            x -= offsetX * 2 + clientWidth;
        }
    }
    return {
        top: `${ y }px`,
        left: `${ x }px`
    };
});

const eventDrag = d3.drag()
    .on('start', (event) => {
        __d_s_x__ = event.x;
        __d_s_y__ = event.y;
        setTips();
    })
    .on('drag', (event) => {

        __d_e_x__ = event.x;
        __d_o_x__ = __d_t_x__ + __d_e_x__ - __d_s_x__;
        __d_o_x__ = Math.min(0, Math.max(-(__range__x__max__ - width), __d_o_x__));

        $mainAxis.attr('transform', `translate(${ __d_o_x__ }, ${ offsetY })`);

        __d_e_y__ = event.y + offsetY;
        __d_o_y__ = __d_t_y__ + __d_e_y__ - __d_s_y__;
        __d_o_y__ = Math.min(offsetY, Math.max(-(__range__y__max__ - height - offsetY), __d_o_y__));

        $crossAxis.attr('transform', `translate(${ __d_o_x__ }, ${ __d_o_y__ })`);
    })
    .on('end', () => {
        __d_t_x__ = __d_o_x__;
        __d_t_y__ = __d_o_y__;
    });

const getInterpolate = (item, field, value) => {

    let current = item[ field ];

    if (typeof current === 'undefined') {
        current = value;
    }

    let interpolate = d3[ 'interpolate' ](current, value);

    return t => {
        item[ field ] = interpolate(t);
        return item[ field ];
    };
};

const setTips = (info) => {
    if (info) {

        let { name, start, end, value } = info;
        let bgColor = '#069F69';
        let color = '#fff';

        start = start.toLocaleDateString();
        end = end.toLocaleDateString();

        if (value > .7) {
            bgColor = '#F6F140';
        }
        if (value > .8) {
            bgColor = '#F61213';
        }
        if (value > .7 && value < .9) {
            color = '#000';
        }

        value = `${ value * 100 }%`;
        tipInfoRef.value = { name, start, end, value, bgColor, color };
    } else {
        tipInfoRef.value = null;
    }
};

const createChart = () => {

    const { data } = props;

    if (typeof itemHeight === 'undefined') {
        __step__height__ = Math.floor((__range__y__max__ - offsetY * 2) / data.length);
        itemHeight = __step__height__ - 15;
    } else {
        __step__height__ = itemHeight + 15;
    }

    //>>>  设置映射值  <<<//
    __domain__min__ = d3.min(data, d => d.start);
    __domain__min__ = new Date(__domain__min__.getTime() - daysInMillis * offsetStart);
    __domain__max__ = d3.max(data, d => d.end);
    __domain__max__ = new Date(__domain__max__.getTime() + daysInMillis * offsetEnd);
    __scale__time__.domain([ __domain__min__, __domain__max__ ]).range([ __range__x__min__, __range__x__max__ ]);

    let tx = 0;

    if (atLast) {
        tx = -(__range__x__max__ - width);
    }

    $svg = d3
        .select(chartRef.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    $clipPath = $svg
        .append('clipPath')
        .attr('id', `clip${ timestamp }`);

    $clipPath
        .append('rect')
        .attr('width', width)
        .attr('height', height - 1)
        .attr('x', 0)
        .attr('y', offsetY + 1);

    $mainAxis = $svg
        .append('g')
        .classed('mainAxis', true)
        .attr('transform', `translate(${ tx }, ${ offsetY })`);

    $gClip = $svg
        .append('g')
        .classed('gClip', true)
        .attr('clip-path', `url(#clip${ timestamp })`);

    $crossAxis = $gClip
        .append('g')
        .classed('crossAxis', true)
        .attr('transform', `translate(${ tx }, ${ offsetY })`);

    $axisX = $mainAxis
        .append('g')
        .classed('.time-axis', true)
        .call(d3.axisTop(__scale__time__));

    $panel = $svg
        .append('rect')
        .classed('pane', true)
        .attr('width', width)
        .attr('height', height);
};

const setData = () => {

    let { data } = props;

    if (typeof itemHeight === 'undefined') {
        __step__height__ = Math.floor((__range__y__max__ - offsetY * 2) / data.length);
        itemHeight = __step__height__ - 15;
    } else {
        __step__height__ = itemHeight + 15;
    }

    //>>>  设置映射值  <<<//
    __domain__min__ = d3.min(data, d => d.start);
    __domain__min__ = new Date(__domain__min__.getTime() - daysInMillis * offsetStart);
    __domain__max__ = d3.max(data, d => d.end);
    __domain__max__ = new Date(__domain__max__.getTime() + daysInMillis * offsetEnd);
    __scale__time__.domain([ __domain__min__, __domain__max__ ]).range([ __range__x__min__, __range__x__max__ ]);

    //>>>  通过映射值得时间轴比例尺  <<<//
    const __axis__ = d3.axisTop(__scale__time__).tickFormat(d3.timeFormat('%Y\n%m-%d'));

    $axisX
        .transition()
        .ease(d3[ ease ])
        .duration(duration)
        .call(__axis__);

    //>>>  移除时间轴线  <<<//
    $crossAxis
        .selectAll('g.tick')
        .select('line.grid-line')
        .remove();

    //>>>  更新时间轴线  <<<//
    $crossAxis
        .selectAll('g.tick')
        .append('line')
        .classed('grid-line', true)
        .attr('stroke', 'rgba(0, 0, 0, .1)')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', __range__y__max__);

    if (color) {
        $axisX.selectAll('path.domain').attr('stroke', color); // 更改刻度线的颜色为白色
        $axisX.selectAll('g.tick > line').attr('stroke', color); // 更改刻度线的颜色为白色
        $axisX.selectAll('g.tick > text').attr('fill', color); // 更改刻度文本的颜色为白色
    }

    //>>>  绘制任务  <<<//
    const $tasks = $crossAxis
        .selectAll('.task')
        .data(data);

    $tasks
        .enter()
        .append('rect')
        .merge($tasks)
        .classed('task', true)
        .attr('y', (d, i) => i * __step__height__ + offsetY)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('height', itemHeight)
        .style('fill', '#B9E2D2')
        .transition()
        .ease(d3[ ease ])
        .duration(duration)
        .attr('x', d => __scale__time__(d.start))
        .attr('width', d => __scale__time__(d.end) - __scale__time__(d.start));

    $tasks
        .exit()
        .remove();

    //>>>  绘制任务进度比例  <<<//
    const $tasksValue = $crossAxis
        .selectAll('.task-value')
        .data(data);

    $tasksValue
        .enter()
        .append('rect')
        .merge($tasksValue)
        .classed('task-value', true)
        .attr('y', (d, i) => i * __step__height__ + offsetY)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('height', itemHeight)
        .transition()
        .ease(d3[ ease ])
        .duration(duration)
        .attr('x', d => __scale__time__(d.start))
        .attrTween('fill', (d, i, a) => {

            let color = '#069F69';

            if (d.value > .7) {
                color = '#F6F140';
            }
            if (d.value > .8) {
                color = '#F61213';
            }

            return getInterpolate(a[ i ], 'currentFill', color);
        })
        .attrTween('width', (d, i, a) => {

            let width = (__scale__time__(d.end) - __scale__time__(d.start)) * d.value;
            let current = a[ i ][ 'currentWidth' ];

            if (typeof current === 'undefined') {
                current = 0;
            }

            let interpolate = d3[ 'interpolate' ](current, width);

            return t => {
                a[ i ][ 'currentWidth' ] = interpolate(t);
                return a[ i ][ 'currentWidth' ];
            };
        });

    $tasksValue
        .exit()
        .remove();

    //>>>  绘制任务名称  <<<//
    const $tasksName = $crossAxis
        .selectAll('.task-name')
        .data(data);

    $tasksName
        .enter()
        .append('text')
        .merge($tasksName)
        .classed('task-name', true)
        .attr('y', (d, i) => i * __step__height__ + itemHeight / 2 + offsetY)
        .attr('font-size', '12px')
        .attr('dominant-baseline', 'middle')
        .attr('fill', color)
        .text((d) => d.name)
        .transition()
        .ease(d3[ ease ])
        .duration(duration)
        .attr('x', d => __scale__time__(d.end) + 5);

    $tasksName
        .exit()
        .remove();

    //>>>  绘制任务进度值  <<<//
    const $tasksValueText = $crossAxis
        .selectAll('.task-value-text')
        .data(data);

    $tasksValueText
        .enter()
        .append('text')
        .merge($tasksValueText)
        .attr('class', 'task-value-text')
        .attr('y', (d, i) => i * __step__height__ + itemHeight / 2 + offsetY)
        .attr('font-size', '12px')
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .transition()
        .ease(d3[ ease ])
        .duration(duration)
        .tween('text', (d, i, a) => {

            let current = a[ i ][ 'currentValue' ];

            if (typeof current === 'undefined') {
                current = 0;
            }

            let interpolate = d3[ 'interpolate' ](current, d.value);

            return t => {
                a[ i ][ 'currentValue' ] = interpolate(t);
                d3.select(a[ i ]).text(`${ Math.floor(a[ i ][ 'currentValue' ] * 100) }%`);
            };
        })
        .attrTween('fill', (d, i, a) => {

            let color = '#fff';

            if (d.value > .7 && d.value < .9) {
                color = '#000';
            }

            return getInterpolate(a[ i ], 'currentFill', color);
        })
        .attr('x', d => __scale__time__(d.start) + (__scale__time__(d.end) - __scale__time__(d.start)) * d.value / 2);

    $tasksValueText
        .exit()
        .remove();

    $panel
        .on('mousemove', (e) => {
            let [ mouseX, mouseY ] = d3.pointer(e);
            let __y__ = mouseY;
            if (__y__ < __step__height__ && __d_t_y__ !== offsetY) {
                __y__ -= offsetY;
            }
            let x = __scale__time__.invert(mouseX - __d_t_x__);
            let y = Math.floor((__y__ - __d_t_y__ - offsetY) / __step__height__);

            if (data[ y ] && x >= data[ y ][ 'start' ] && x <= data[ y ][ 'end' ]) {
                tipPositionRef.value = [ mouseX, mouseY ];
                setTips(data[ y ]);
            } else {
                setTips();
            }
        })
        .on('mouseout', () => {
            setTips();
        })
        .call(eventDrag);
};

watch(() => props.data, () => {
    if (Array.isArray(props.data) && props.data.length) {
        typeof $svg === 'undefined' && createChart();
        setData();
    }
});
</script>

<template>
<div class="d3-gantt-vue-composition">
    <div ref="chartRef"></div>
    <div v-if="tipInfoRef" ref="tipRef" :style="tipStyle" class="chart-tips">
        <dl>
            <dt class="date">{{ tipInfoRef.start }} ~ {{ tipInfoRef.end }}</dt>
            <dd class="info">
                <strong class="name">{{ tipInfoRef.name }}</strong>
                <span :style="{ backgroundColor: tipInfoRef.bgColor, color: tipInfoRef.color }" class="value">{{ tipInfoRef.value }}</span>
            </dd>
        </dl>
    </div>
</div>
</template>

<style lang="scss">
.d3-gantt-vue-composition {
    position: relative;

    svg {
        display: block;
    }

    line {
        shape-rendering: crispEdges;
    }

    rect.pane {
        cursor: move;
        fill: none;
        pointer-events: all;
    }
}
</style>

<style lang="scss" scoped>
.chart-tips {
    position: absolute;
    background: rgba(255, 255, 255, 1);
    border-radius: 5px;
    line-height: 1;
    box-shadow: 0 0 8px rgba(0, 0, 0, .125);
    user-select: none;

    .date {
        padding: 10px 14px;
        font-size: 14px;
        color: #999;
        border-bottom: 1px solid rgba(0, 0, 0, .1);
    }

    .info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px;
    }

    .name {
        display: inline-block;
        padding-right: 2em;
        white-space: nowrap;
    }

    .value {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 3px;
    }
}
</style>
