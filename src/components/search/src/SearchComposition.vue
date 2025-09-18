<script setup>

const model = defineModel();

const params = defineModel('params', { type: [ Object, null ], default: null });

const loading = defineModel('loading', { type: Boolean, default: false });

const props = defineProps({
    api: {
        type: Function,
        required: true
    },
    params: {
        type: Object
    },
    compose: {
        type: Function
    },
    onSuccess: {
        type: Function
    },
    onError: {
        type: Function
    },
    onComplete: {
        type: Function
    },
    debug: {
        type: Boolean,
        default: false
    }
});

const emit =defineEmits([ 'search' ]);

const paramsCompose = () => {

    let conditions = {};

    try {

        if (typeof params.value === 'object' && params.value !== null && !Array.isArray(params.value)) {

            let redefined = [];

            Object.keys(params.value).map(k => {

                if (typeof conditions[ k ] !== 'undefined' && conditions[ k ] === undefined) {
                    redefined.push([ k, conditions[ k ], params.value[ k ] ]);
                }
                conditions[ k ] = params.value[ k ];
            });

            if (props.debug && redefined.length) {

                console.group('参数警告');
                for (const r of redefined) {
                    console.warn(`请求条件中 ${ r[ 0 ] } 的值 ${ r[ 1 ] } 被重新定义为 ${ r[ 2 ] }.`);
                }
                console.groupEnd();
            }

            redefined = null;
        }

        if (typeof props.compose === 'function') {
            conditions = props.compose(conditions);
        }
    } catch (e) {
        console.warn(e);
    }

    if (props.debug) {

        console.group('请求参数');
        console.log(conditions);
        console.groupEnd();
    }

    return conditions;
};

const fetchData = async () => {

    if (typeof props.api !== 'function') {
        console.warn(`请求的API不是一个方法.`);
        return;
    }

    if (loading.value) {
        return;
    }

    loading.value = true;

    let response = null;

    try {

        let params = paramsCompose();

        response = await props.api(params);

        if (typeof props.onSuccess === 'function') {
            props.onSuccess(response);
        }

        model.value = response;

    } catch (e) {

        if (typeof props.onError === 'function') {
            props.onError(e);
        } else {
            console.warn(e);
        }
    } finally {

        if (typeof props.onComplete === 'function') {
            props.onComplete();
        }

        loading.value = false;

        if (props.debug) {
            console.group('请求响应');
            console.log(response);
            console.groupEnd();
        }

        response = null;
    }
};

const search = () => {

    if (loading.value) {
        return;
    }

    emit('search');
    fetchData();
};

defineExpose({
    search
});
</script>

<template>
<slot :loading="loading" :data="model"></slot>
</template>
