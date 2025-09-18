<script setup>
import { computed, nextTick, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';


window.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new JsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new CssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new HtmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new TsWorker();
        }
        return new EditorWorker();
    }
};

const model = defineModel();

const props = defineProps({
    width: {
        type: String,
        default: '100%'
    },
    height: {
        type: String,
        default: '100%'
    },
    language: {
        type: String,
        default: ''
    },
    options: {
        type: Object,
        default: () => ({})
    },
    readonly: {
        type: Boolean,
        default: false
    }
});

const state = reactive({
    value: {},
    languages: [],
    index: 0
});

const language = computed(() => {
    let language;
    if (state.languages.length) {
        language = state.languages[ state.index ];
    }
    if (props.language) {
        language = props.language;
    }
    if (props.options[ 'language' ]) {
        language = props.options[ 'language' ];
    }
    if (!language) {
        language = 'html';
    }
    return language;
});

const code = computed(() => {
    return state.value[ language.value ];
});

const editorOptions = {
    fontSize: 12,
    autoIndent: true,
    automaticLayout: true,
    wordWrap: 'off',
    wordWrapColumn: 190,
    theme: 'vs-dark'
};

// 'vs'（默认）、'vs-dark'、'hc-black'、'hc-light'
let editorRef = ref();
let editorModelId = ref('');

let editorInstance;
let editorModel;

const classRef = computed(() => {
    return `theme-${ props.options[ 'theme' ] || editorOptions[ 'theme' ] }`;
});

const styleRef = computed(() => {
    const style = {
        width: props.width,
        height: props.height
    };
    return style;
});

const optionsRef = computed(() => {
    return Object.assign({}, editorOptions, props.options);
});

const createEditor = () => {

    if (state.languages.length === 0) {
        return;
    }

    editorInstance = monaco.editor.create(editorRef.value, {
        value: code.value,
        language: language.value,
        readOnly: props.readonly,
        ...optionsRef.value
    });

    editorModel = editorInstance.getModel();

    editorModelId.value = editorModel.getLanguageId();

    editorModel.onDidChangeContent(() => {
        state.value[ language.value ] = editorInstance.getValue();
    });

    editorInstance.onDidBlurEditorWidget(() => {
        model.value = state.value;
    });
};

const eventChange = (index) => {
    if (state.index !== index) {
        state.index = index;
        if (editorInstance) {
            monaco.editor.setModelLanguage(editorModel, language.value);
            editorInstance.setValue(code.value);
        }
    }
};

const resize = () => {
    editorInstance.layout();
};

const setValue = () => {

    let value = {};

    if (typeof model.value === 'string') {
        value = {
            [ language.value ]: model.value
        };
    } else {
        for (const [ key, code ] of Object.entries(model.value)) {
            let language = key;
            if (key === 'js') {
                language = 'javascript';
            }
            value[ language ] = code;
        }
    }

    state.value = value;

    state.languages = Object.keys(value);

    if (editorInstance) {
        editorInstance.setValue(code.value);
    }
};

onBeforeMount(() => {
    setValue();
});

onMounted(() => {
    createEditor();
});

watch(() => model.value, () => {
    setValue();
}, { deep: true });

watch(() => props.width, () => {
    nextTick(resize);
});

watch(() => props.height, () => {
    nextTick(resize);
});

watch(() => props.options, () => {
    editorInstance.updateOptions(optionsRef.value);
}, { deep: true });

const getValue = () => {
    return state.value;
};

defineExpose({
    getValue
});
</script>

<template>
<div :class="classRef" :style="styleRef" class="monaco-editor-widget">
    <div class="languages">
        <div v-for="(item, index) in state.languages" :key="index" :class="{ active: index === state.index }" class="language" @click.stop="eventChange(index)">
            {{ item }}
        </div>
    </div>
    <div ref="editorRef" class="editor"></div>
</div>
</template>

<style lang="scss" scoped>
.monaco-editor-widget {
    position: relative;
    height: 100%;
    margin-bottom: 10px;
    padding-top: 24px;
    box-sizing: border-box;
    user-select: none;

    .languages {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        font-size: 12px;
        line-height: 1;

        .language {
            display: flex;
            align-items: center;
            height: 24px;
            padding: 0 20px;
            border-bottom: 2px solid transparent;
            box-sizing: border-box;
            cursor: pointer;

            &.active {
                cursor: default;
            }
        }
    }

    .editor {
        width: 100%;
        height: 100%;
        min-height: 80px;
    }

    &.theme-vs {
        background: #f0f0f0;
        border: 1px solid #f0f0f0;

        .language {
            background: #fff;
            color: #000000;

            &.active {
                background: #fff;
                color: #000000;
            }
        }
    }

    &.theme-vs-dark {
        background: #414448;
        border: 1px solid #414448;

        .language {
            background: #1e1e1e;
            color: #d4d4d4;

            &.active {
                background: #1e1e1e;
                color: #d4d4d4;
                border-bottom: 2px solid #3574F0;
            }
        }
    }

    &.theme-hc-black {
        background: #222222;
        border: 1px solid #222222;

        .language {
            background: #000000;
            color: #ffffff;

            &.active {
                background: #000000;
                color: #ffffff;
            }
        }
    }

    &.theme-hc-light {
        background: #f0f0f0;
        border: 1px solid #f0f0f0;

        .language {
            background: #ffffff;
            color: #000000;

            &.active {
                background: #ffffff;
                color: #000000;
            }
        }
    }
}
</style>
