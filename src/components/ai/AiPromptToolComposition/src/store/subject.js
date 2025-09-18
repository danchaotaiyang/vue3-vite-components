import { ref } from 'vue';
import { defineStore } from 'pinia';
import { $mitt } from '../utils/mitt.js';
import { usePromptTranslateStore } from '../store';


export const usePromptSubjectStore = defineStore('prompt-structure', () => {

    const storeTranslate = usePromptTranslateStore();

    const common = ref([
        {
            label: '女孩肖像',
            value: 'portrait of girl'
        },
        {
            label: '女性模特',
            value: 'female model'
        },
        {
            label: '一个惊艳的女人',
            value: 'a stunning woman'
        },
        {
            label: '蓝绿色眼眸',
            value: 'blue-green eyes'
        },
        {
            label: '空洞的眼神',
            value: 'empty eyes'
        },
        {
            label: '凝视',
            value: 'gaze'
        },
        {
            label: '明亮的眼睛',
            value: 'bright eyes'
        },
        {
            label: '微微笑',
            value: 'slight smile'
        },
        {
            label: '站在街道上',
            value: 'standing on street'
        },
        {
            label: '飘逸的头发',
            value: 'flowing hair'
        },
        {
            label: '整洁的发型',
            value: 'neat hair style'
        },
        {
            label: '大胆、强烈、深情',
            value: 'bold, intense, soulful'
        },
        {
            label: '细腻的皮肤纹理',
            value: 'delicate skin texture'
        },
        {
            label: '亚洲审美标准',
            value: 'Asian beauty standards'
        },
        {
            label: '可见的皮革纹理',
            value: 'leather texture visible'
        },
        {
            label: '工装裤',
            value: 'cargo pants'
        },
        {
            label: '运动鞋',
            value: 'sneakers'
        },
        {
            label: '摄影',
            value: 'photography'
        },
        {
            label: '静物摄影',
            value: 'still-life photography'
        },
        {
            label: '产品静物图',
            value: 'product still life'
        },
        {
            label: '包装展示摄影',
            value: 'packshot'
        },
        {
            label: '商业静物摄影',
            value: 'commercial still life'
        },
        {
            label: '时尚摄影',
            value: 'fashion photography'
        },
        {
            label: '街头摄影',
            value: 'street photography'
        },
        {
            label: '建筑摄影',
            value: 'architectural photography'
        },
        {
            label: '工业摄影',
            value: 'industrial photography'
        },
        {
            label: '航拍摄影',
            value: 'aerial photography'
        },
        {
            label: '超写实照片',
            value: 'hyperrealistic photo'
        },
        {
            label: '影视剧照',
            value: 'film still'
        }
    ]);

    const translating = ref(false);

    const subject = ref('');

    const translateResult = ref([]);
    const checkedResult = ref([]);

    const result = ref('');

    const clean = () => {
        translateResult.value = [];
        checkedResult.value = [];
        result.value = '';
    };

    const getSubject = () => {
        let value = translateResult.value.filter(d => checkedResult.value.includes(d.value)).map(d => d.value);
        result.value = value.join(', ').trim();
        $mitt.emit('combination');
    };

    const translate = async () => {
        if (!subject.value) {
            clean();
            return;
        }
        if (translating.value) {
            return;
        }
        try {
            translating.value = true;
            translateResult.value = await storeTranslate.translate([ subject.value ]);
            console.log(translateResult.value);
            checkedResult.value = translateResult.value.map(d => d.value);
        } catch (e) {
            console.warn(e);
        } finally {
            translating.value = false;
            getSubject();
        }
    };

    const checkPrompt = (value) => {
        let index = checkedResult.value.findIndex((x) => x === value);
        if (index > -1) {
            checkedResult.value.splice(index, 1);
        } else {
            checkedResult.value.push(value);
        }
        getSubject();
    };

    const selectionStart = ref(0);
    const selectionEnd = ref(0);
    const getSelection = (target) => {
        if (!target) {
            return;
        }
        selectionStart.value = target.selectionStart;
        selectionEnd.value = target.selectionEnd;
    };
    const setSelection = (value) => {
        if (typeof value !== 'string') {
            return;
        }
        value = value.trim();
        if (value === '' || value === ',') {
            return;
        }
        let before = subject.value.substring(0, selectionStart.value);
        let after = subject.value.substring(selectionEnd.value);
        subject.value = `${ before }${ value }${ after }`;
        translate();
    };

    return {
        common, subject,
        translateResult, checkedResult,
        translate, checkPrompt,
        result,
        selectionStart, selectionEnd, getSelection, setSelection
    };
});