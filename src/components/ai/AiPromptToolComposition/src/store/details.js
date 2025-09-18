import { ref } from 'vue';
import { defineStore } from 'pinia';
import { usePromptTranslateStore } from '../store';
import { $mitt } from '@/components/ai/AiPromptToolComposition/src/utils/mitt.js';
import { promptFilter } from '@/components/ai/AiPromptToolComposition/src/utils/tool.js';


export const usePromptDetailsStore = defineStore('prompt-details', () => {

    const storeTranslate = usePromptTranslateStore();

    const details = ref([
        {
            label: '环境',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '白色背景',
                    value: 'white background',
                },
                {
                    label: '极简的室内装饰',
                    value: 'minimalist interior'
                },
                {
                    label: '在一个角落',
                    value: 'in a corner'
                },
                {
                    label: '宁静与舒缓',
                    value: 'calm and relaxation'
                }
            ]
        },
        {
            label: '氛围',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '在一个宁静的早晨',
                    value: 'on a peaceful morning'
                },
                {
                    label: '???的温馨的画面',
                    value: 'A cozy image of ???'
                }
            ]
        },
        {
            label: '光照',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '柔和的光线',
                    value: 'soft lighting'
                },
                {
                    label: '柔和的晨光',
                    value: 'soft morning light'
                },
                {
                    label: '柔和穹顶光',
                    value: 'soft overhead spotlights'
                },
                {
                    label: '强烈的光线',
                    value: 'dramatic lighting'
                },
                {
                    label: '强烈的阳光和阴影',
                    value: 'dramatic sunlight and casting shadows'
                },
                {
                    label: '自然光',
                    value: 'natural lighting'
                },
                {
                    label: '环境光',
                    value: 'ambient light'
                },
                {
                    label: '自然光与柔影',
                    value: 'natural lighting with soft shadows'
                },
                {
                    label: '光线突出面部和眼睛的细节',
                    value: 'lighting accentuates face and eyes detailing'
                },
                {
                    label: '光影交织',
                    value: 'creating interplay of light and shadow'
                },
                {
                    label: '金色光线',
                    value: 'golden light'
                }
            ]
        },
        {
            label: '色彩',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '哑光白',
                    value: 'matte white'
                },
                {
                    label: '深蓝色',
                    value: 'deep blue'
                },
                {
                    label: '自然色彩',
                    value: 'natural colors'
                },
                {
                    label: '高饱和度',
                    value: 'high saturation'
                }
            ]
        },
        {
            label: '视角',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '前视图',
                    value: 'front view',
                },
                {
                    label: '侧视图',
                    value: 'side view',
                },
                {
                    label: '俯视图',
                    value: 'top view',
                },
                {
                    label: '第一人称视角',
                    value: 'POV first-person',
                }
            ]
        },
        {
            label: '景别',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '全身',
                    value: 'full-body'
                },
                {
                    label: '特写镜头',
                    value: 'close-up shot'
                },
                {
                    label: '极近镜头',
                    value: 'extreme close-up shot'
                }
            ]
        },
        {
            label: '构图',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '完美构图',
                    value: 'perfection composition'
                },
                {
                    label: '对称构图',
                    value: 'symmetrical composition'
                },
                {
                    label: '清晰的聚焦模特',
                    value: 'sharp focus model',
                },
                {
                    label: '将镜头聚焦在展示橱窗上',
                    value: 'focusing a show window',
                },
                {
                    label: '营造空间深度',
                    value: 'creating depth'
                },
                {
                    label: '突出展示产品',
                    value: 'highlighting the product'
                }
            ]
        },
        {
            label: '艺术风格',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '动漫风格',
                    value: 'anime style'
                },
                {
                    label: '迪士尼风格',
                    value: 'disney style'
                },
                {
                    label: '皮克斯风格',
                    value: 'pixar style'
                },
                {
                    label: '赛博朋克',
                    value: 'cyberpunk style'
                },
                {
                    label: '3D渲染',
                    value: '3d rendering'
                },
                {
                    label: '2D平面',
                    value: '2d flat,illustration'
                },
                {
                    label: '线稿风格',
                    value: 'line art,sketch,monochrome,outline'
                },
                {
                    label: '波普艺术',
                    value: 'pop art'
                },
                {
                    label: '概念艺术',
                    value: 'concept art'
                },
                {
                    label: '乐高创作艺术',
                    value: 'lego creation art'
                },
                {
                    label: '肖像画风格',
                    value: 'portraits style'
                },
                {
                    label: '采用笔触密集的肖像画风格',
                    value: 'in the style of brushstroke-intensive portraits'
                },
                {
                    label: '迭戈·委拉斯开兹风格',
                    value: 'style inpired by Diego Velazquez'
                },
                {
                    label: '奥迪隆·雷东风格素描',
                    value: 'sketch in the style of Odilon Redon'
                },
                {
                    label: '安德烈·德·迪内斯',
                    value: 'André de Dienes'
                },
                {
                    label: '以摄影师大卫·拉夏佩尔的风格拍摄',
                    value: 'shot in the style of photographer David LaChapelle'
                }
            ]
        },
        {
            label: '生成方式',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '在索尼A7III上拍摄',
                    value: 'shot on a Sony A7III'
                },
                {
                    label: '佳能EOS R5无反光镜镜头',
                    value: 'using a Canon EOS R5 mirrorless lens'
                }
            ]
        },
        {
            label: '创作模态',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '油画',
                    value: 'oil painting'
                },
                {
                    label: '石版画',
                    value: 'lithograph',
                },
                {
                    label: '炭笔素描',
                    value: 'charcoal sketch'
                },
            ]
        },
        {
            label: '质感',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '颗粒状的触感',
                    value: 'grainy touch'
                },
                {
                    label: '粗糙',
                    value: 'rough'
                },
                {
                    label: '感性的笔触',
                    value: 'emotional strokes'
                }
            ]
        },
        {
            label: '质量',
            value: '',
            translate: [],
            checked: [],
            active: true,
            visible: true,
            commons: [
                {
                    label: '最佳品质',
                    value: 'best quality'
                },
                {
                    label: '超高品质',
                    value: 'ultra quality'
                },
                {
                    label: '杰作',
                    value: 'masterpiece'
                },
                {
                    label: '超高清',
                    value: 'UHD'
                },
                {
                    label: '高分辨率',
                    value: 'high-resolution'
                },
                {
                    label: '高分辨率照片',
                    value: 'high-resolution photograph'
                },
                {
                    label: '逼真',
                    value: 'realistic'
                },
                {
                    label: '超级逼真',
                    value: 'ultra realistic'
                },
                {
                    label: '照片级真实感',
                    value: 'photorealistic'
                },
                {
                    label: '丰富的细节',
                    value: 'rich detailing'
                },
                {
                    label: '官方艺术',
                    value: 'official art'
                },
                {
                    label: '美观且富有艺术美感',
                    value: 'beautiful and aesthetic'
                },
                {
                    label: '砖块细节',
                    value: 'brick details'
                }
            ]
        }
    ]);

    const translating = ref(false);

    const result = ref('');

    const getDetails = () => {
        let values = [];
        for (const detail of details.value) {
            let { value, translate, checked } = detail;
            if (!value) {
                continue;
            }
            let item = translate.filter(d => d.value && checked.includes(d.value)).map(d => d.value);
            if (item.length === 0) {
                continue;
            }
            values.push(item.join(', ').trim());
        }
        result.value = values.join(', ').trim();
        $mitt.emit('combination');
    };

    const translate = async (data) => {
        if (!data.value || translating.value) {
            return;
        }
        try {
            translating.value = true;
            data.translate = await storeTranslate.translate(promptFilter(data.value));
            data.checked = data.translate.map(d => d.value);
        } catch (e) {
            console.warn(e);
        } finally {
            translating.value = false;
            getDetails();
        }
    };

    const checkPrompt = (data, value) => {
        let index = data.checked.findIndex((x) => x === value);
        if (index > -1) {
            data.checked.splice(index, 1);
        } else {
            data.checked.push(value);
        }
        getDetails();
    };

    return {
        details,
        translate,
        getDetails,
        checkPrompt,

        result
    };
});