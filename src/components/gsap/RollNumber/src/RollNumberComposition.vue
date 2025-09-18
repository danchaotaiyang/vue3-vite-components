<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { gsap } from 'gsap';


const props = defineProps({
    value: {
        type: Number,
        default: 0
    },
    spacing: {
        type: Number,
        default: 0
    },
    fontSize: {
        type: String,
        default: '16px'
    },
    fontWeight: {
        type: Number,
        default: 500
    },
    interval: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0
    },
    digits: {
        type: Number,
        default: 0
    },
    roll: {
        type: Boolean,
        default: false
    },
    numberClass: {
        type: String,
        default: ''
    },
    digitClass: {
        type: String,
        default: ''
    }
});

const state = reactive({
    from: 0,
    to: 0,
    diff: 0,
    result: 0
});

const resultRef = computed(() => {

    const result = `${ state.result }`.split('');

    if (props.digits > 0 && props.digits > result.length) {

        let diff = Math.round(props.digits - result.length);

        for (let i = 0; i < diff; i++) {
            result.unshift('0');
        }
    }

    return result.map((d) => Number(d).toFixed(0));
});

const defaultInterval = .06;

const durationTime = computed(() => {

    let time = 0;

    if (props.roll) {
        const t = props.duration > 0 ? props.duration / state.diff : props.interval / 1000;
        time = defaultInterval + t;
    }

    return time;
});

const numberStyleRef = computed(() => {
    return {
        fontSize: props.fontSize,
        fontWeight: props.fontWeight,
        marginRight: props.spacing
    };
});

let __roll__number__;

const setRollNumberAnimation = () => {

    state.from = state.to;
    state.to = props.value;
    state.diff = Math.abs(state.from - state.to);

    __roll__number__ = gsap
        .timeline()
        .fromTo(
            state,
            {
                result: state.from
            },
            {
                result: state.to,
                duration: props.duration > 0 ? props.duration : durationTime.value * state.diff,
                ease: 'none',
                onUpdate() {
                    state.result = Math.round(state.result);
                }
            }
        );
};

const resetRollNumberAnimation = () => {
    if (__roll__number__) {
        __roll__number__.kill();
    }
    state.to = state.result;
    setRollNumberAnimation();
};

const rollNumberHeightRef = ref(0);

const setRollNumberHeight = () => {
    const $number = document.querySelector('.roll-number-digit');
    rollNumberHeightRef.value = $number.offsetHeight;
};

onMounted(() => {
    setRollNumberHeight();
    setRollNumberAnimation();
});

watch(() => props, () => {
    resetRollNumberAnimation();
}, {
    deep: true
});

</script>

<template>
<div :style="{ '--duration-time': `${ durationTime }s`, '--roll-number-height': `${ rollNumberHeightRef }px` }" class="gsap-roll-number-composition roll-number">
    <div class="roll">
        <div v-for="(item, index) in resultRef" :key="index" :class="[ props.numberClass ]" :style="{...numberStyleRef, marginLeft: index > 0 ? `${ props.spacing }px` : 0}" class="roll-number-item">
            <div :style="{ transform: `translate(0, -${ Number(item) * 10 }%)` }" class="number-transition">
                <div v-for="(item, index) in 10" :key="item" :class="[ props.digitClass ]" class="roll-number-digit">{{ index }}</div>
            </div>
        </div>
    </div>
</div>
</template>

<style lang="scss" scoped>
.gsap-roll-number-composition {
    display: inline-block;
    line-height: 1;

    .roll {
        display: inline-flex;

        .roll-number-item {
            height: var(--roll-number-height);
            overflow: hidden;

            .number-transition {
                transition: transform var(--duration-time);

                .roll-number-digit {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                }
            }
        }
    }
}
</style>
