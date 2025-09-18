<script setup>
import { reactive, ref, watch, onMounted } from 'vue';
import * as echarts from 'echarts';


const props = defineProps({
    value: {
        type: Number,
        default: 0
    }
});

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
let chartInstance;
const chartRef = ref();
const chartState = reactive({
    options: {
        background: 'transparent',
        title: {
            x: 'center',
            y: 'center',
            textStyle: {
                rich: {
                    a: {
                        fontSize: 36,
                        color: '#29EEF3',
                        fontFamily: 'Promethean'
                    },
                    c: {
                        fontSize: 20,
                        color: '#ffffff'
                    }
                }
            }
        },
        series: [
            {
                name: '',
                type: 'pie',
                radius: 36,
                silent: true,
                clockwise: true,
                startAngle: 90,
                label: {
                    position: 'center'
                },
                data: [
                    {
                        name: '',
                        value: 100,
                        itemStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    {
                                        offset: .8,
                                        color: 'rgba(63, 68, 137, 0)'
                                    },
                                    {
                                        offset: .95,
                                        color: 'rgba(63, 68, 137, .9)'
                                    }
                                ],
                                global: false
                            }
                        }
                    },
                    {
                        name: '',
                        value: 0,
                        itemStyle: {
                            color: '#173164'
                        }
                    }
                ]
            },
            {
                name: '',
                type: 'pie',
                radius: [ '36px', '37px' ],
                silent: true,
                clockwise: true,
                startAngle: 90,
                label: {
                    position: 'center'
                },
                data: [
                    {
                        name: '',
                        value: 100,
                        itemStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    {
                                        offset: .8,
                                        color: 'rgba(81, 122, 173, 0)'
                                    },
                                    {
                                        offset: .95,
                                        color: '#517AAD'
                                    }
                                ],
                                global: false
                            }
                        }
                    },
                    {
                        name: '',
                        value: 0,
                        itemStyle: {
                            color: '#173164'
                        }
                    }
                ]
            },
            {
                name: '',
                type: 'pie',
                radius: [ '39px', '59px' ],
                silent: true,
                clockwise: true,
                startAngle: 90,
                label: {
                    position: 'center'
                },
                data: [
                    {
                        name: '',
                        value: 100,
                        itemStyle: {
                            color: {
                                type: 'radial',
                                x: .5,
                                y: .55,
                                r: 0.64,
                                colorStops: [
                                    {
                                        offset: .69,
                                        color: 'rgba(41, 83, 147, 0)'
                                    },
                                    {
                                        offset: 1,
                                        color: '#295393'
                                    }
                                ],
                                global: false
                            }
                        }
                    },
                    {
                        name: '',
                        value: 0,
                        itemStyle: {
                            color: '#173164'
                        }
                    }
                ]
            },
            {
                name: '',
                type: 'pie',
                radius: [ '40px', '59px' ],
                silent: true,
                clockwise: true,
                startAngle: 90,
                avoidLabelOverlap: true,
                label: {
                    position: 'center'
                },
                data: [],
                universalTransition: {
                    enabled: true,
                    seriesKey: [ 'color' ]
                }
            },
            {
                name: '',
                type: 'pie',
                radius: [ '39px', '40px' ],
                silent: true,
                clockwise: true,
                startAngle: 90,
                label: {
                    position: 'center'
                },
                data: [
                    {
                        name: '',
                        value: 100,
                        itemStyle: {
                            color: {
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: '#3f83fc'
                                    },
                                    {
                                        offset: 1,
                                        color: '#847bff'
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: '',
                        value: 0,
                        itemStyle: {
                            color: '#173164'
                        }
                    }
                ]
            },
            {
                name: '',
                type: 'pie',
                radius: [ '43px', '44px' ],
                silent: true,
                clockwise: true,
                startAngle: 90,
                label: {
                    position: 'center'
                },
                data: [
                    {
                        name: '',
                        value: 100,
                        itemStyle: {
                            color: 'rgba(115, 157, 255, .3)'
                        }
                    },
                    {
                        name: '',
                        value: 0,
                        itemStyle: {
                            color: '#173164'
                        }
                    }
                ]
            },
            {
                name: '',
                type: 'pie',
                radius: [ '60px', '61px' ],
                silent: true,
                clockwise: true,
                startAngle: 90,
                label: {
                    position: 'center'
                },
                data: [
                    {
                        name: '',
                        value: 100,
                        itemStyle: {
                            color: {
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: 'rgba(128, 215, 255, 0.6)'
                                    },
                                    {
                                        offset: 1,
                                        color: 'rgba(132, 123, 255, 0.4)'
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: '',
                        value: 0,
                        label: {
                            show: false
                        },
                        itemStyle: {
                            color: '#173164'
                        }
                    }
                ]
            },
            {
                name: '',
                type: 'pie',
                radius: [ '64px', '65px' ],
                silent: true,
                clockwise: true,
                startAngle: 90,
                label: {
                    position: 'center'
                },
                data: [
                    {
                        name: '',
                        value: 100,
                        itemStyle: {
                            color: '#283E60'
                        }
                    },
                    {
                        name: '',
                        value: 0,
                        label: {
                            show: false
                        },
                        itemStyle: {
                            color: '#1e2e4e'
                        }
                    }
                ]
            }
        ]
    }
});
const setOptions = () => {
    if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value);
    }
    const { clientWidth, clientHeight } = chartRef.value;
    const d = Math.min(clientHeight, clientWidth) - 14;
    const r = Math.round(d / 2);
    const punctual = props.value;

    const data = new Array(180).fill(0).map((d, i) => {
        const num = punctual * 1.8;

        let color = 'transparent';

        if (i < num) {
            color = `rgba(131, 123, 255, ${ i / num })`;
        }

        if (num - i > 0 && Math.ceil(num - i) === 1) {
            color = `#ffffff`;
        }

        return {
            name: '',
            value: 1,
            itemStyle: {
                color,
                shadowColor: color,
                shadowBlur: 10
            }
        };
    });

    const outer = r;
    const inner = r * .6769;
    chartState.options.series[ 3 ].data = data;
    chartState.options.series.at(-1).radius = [ `${ outer - 1 }px`, `${ outer }px` ];
    chartState.options.series.at(-2).radius = [ `${ outer - 5 }px`, `${ outer - 4 }px` ];
    chartState.options.series.at(-3).radius = [ `${ inner - 1 }px`, `${ inner }px` ];
    chartState.options.series.at(-4).radius = [ `${ inner - 5 }px`, `${ inner - 4 }px` ];
    chartState.options.series.at(-5).radius = [ `${ inner - 4 }px`, `${ outer - 6 }px` ];
    chartState.options.series.at(-6).radius = [ `${ inner - 5 }px`, `${ outer - 6 }px` ];
    chartState.options.series.at(-7).radius = [ `${ inner - 9 }px`, `${ inner - 8 }px` ];
    chartState.options.series.at(-8).radius = inner - 9;
    chartState.options.title.textStyle.rich.a.fontSize = outer * .5538;
    chartState.options.title.textStyle.rich.c.fontSize = outer * .2154;
    chartState.options.title.text = `{a|${ punctual }}{c|\n%}`;
    chartInstance && chartInstance.setOption(chartState.options, true);
};
const create = () => {
    if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value);
    }
};

/*  Lifecycle
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────*/

const resize = () => {
    chartInstance && chartInstance.resize();
};

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

watch(() => props.value, () => {
    setOptions();
});

onMounted(() => {
    create();
});

window.addEventListener('resize', () => {
    setOptions();
    resize();
}, false);
</script>

<template>
<div ref="chartRef" class="doughnut-single"></div>
</template>

<style lang="scss" scoped>
.doughnut-single {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 10;

    &:after {
        content: '';
        display: block;
        position: absolute;
        bottom: 0;
        left: 50%;
        z-index: 0;
        width: 80px;
        height: 8px;
        background: #000;
        border-radius: 50%;
        transform: translateX(-50%);
        filter: blur(5px);
    }
}
</style>
