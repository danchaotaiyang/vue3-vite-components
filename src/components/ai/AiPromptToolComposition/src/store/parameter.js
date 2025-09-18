import { watch, ref } from 'vue';
import { defineStore } from 'pinia';
import { $mitt } from '../utils/mitt.js';


export const usePromptParameterStore = defineStore('prompt-parameter', () => {

    const parameters = ref([
        [
            {
                label: '宽高比',
                value: '',
                default: '1:1',
                range: null,
                prefix: '--aspect / --ar',
                parameter: '--ar',
                type: 'autocomplete',
                props: {
                    placeholder: `1:1`,
                    clearable: true
                },
                options: [ '2:3', '3:2', '3:4', '4:3', '4:5', '9:16', '16:9' ],
                width: '90px',
                introduce: {
                    description: '默认情况下，图像为正方形，即宽度与高度相同，因此宽高比为 <span>1:1</span>，但可以使用宽高比参数改变此设置：<span>--ar x:y</span> 或 <span>--aspect x:y</span><br>参数不可包含小数，请使用 <span>139:100</span> 替代 <span>1.39:1</span>',
                    prompt: 'a colorful ocean fish --ar 2:3',
                    result: '<img src="https://docs.midjourney.com/hc/article_attachments/31926773524877" alt="" />'
                },
                active: false,
                visible: true
            },
            {
                label: '平铺',
                value: ' ',
                default: ' ',
                prefix: '--tile',
                parameter: '--tile',
                type: 'switch',
                props: {
                    activeValue: '--tile',
                    inactiveValue: ' ',
                    activeText: '开启',
                    inactiveText: '关闭',
                    inlinePrompt: true
                },
                width: '90px',
                introduce: {
                    description: '创建无缝循环的重复图案: <span>--tile</span>',
                    prompt: 'illustration of a cat <span>--w 100</span>',
                    result: '<img src="https://docs.midjourney.com/hc/article_attachments/32497154088077" alt="" />'
                },
                active: false,
                visible: true
            },
            {
                label: '风格化',
                value: 100,
                default: 100,
                range: [ 0, 1000 ],
                prefix: '--stylize / --s',
                parameter: '--s',
                // type: 'input-number',
                // props: {
                //     placeholder: `100`,
                //     min: 0,
                //     max: 1000,
                //     step: 1,
                //     stepStrictly: true
                // },
                type: 'slider',
                props: {
                    min: 0,
                    max: 1000,
                    marks: {
                        100: '',
                        500: ''
                    }
                },
                introduce: {
                    description: '风格化参数让您自主选择：要精准还原提示描述，还是追求更具创造性的艺术表达，掌控图像的艺术风格表现力：<span>--s #</span> 或 <span>--stylize #</span><br>您还可以通过设置命令为所有图像设定默认的风格化值：点击风格化预设按钮即可。<span>🖌️ Stylize med</span> 为默认选项。选择任意预设后，在"Current suffix"处可查看其对应的具体数值。',
                    prompt: `child's drawing of a cat <span>--s 500</span>`,
                    result: '<img src="https://docs.midjourney.com/hc/article_attachments/32197522147725" alt="" />'
                },
                active: false,
                visible: true
            },
            {
                label: '图像权重',
                value: 1,
                default: 1,
                range: [ 0, 2 ],
                prefix: '--iw',
                parameter: '--iw',
                /*type: 'input-number',
                props: {
                    placeholder: `1`,
                    min: 0,
                    max: 2,
                    step: .1
                },*/
                type: 'slider',
                props: {
                    min: 0,
                    max: 2,
                    step: .01,
                    marks: {
                        1: ''
                    }
                },
                introduce: {
                    description: '默认值为 <span>1</span>，取值范围在 <span>0</span> 到 <span>2</span>，图片提示功能允许您在文字提示中添加参考图，以此引导生成方向。系统将解析图像的核心视觉特征，将其作为创作全新独特图像的灵感来源，调整图像提示词相比较于文本提示词部分的权重比，更高的值意味着图像提示对生成图片产生更大影响： <span>--iw #</span>',
                    prompt: 'http://image.jpg vibrant California poppies <span>--iw 2</span>',
                    result: '<img src="https://docs.midjourney.com/hc/article_attachments/35587202934029" alt="" />'
                },
                active: false,
                visible: true
            },
            {
                label: '画质',
                value: 1,
                default: 1,
                range: [ 0, 4 ],
                prefix: '--quality / --q',
                parameter: '--q',
                /*type: 'input-number',
                props: {
                    placeholder: `1`,
                    min: 0,
                    max: 4,
                    step: 0.25
                },*/
                type: 'slider',
                props: {
                    min: 0,
                    max: 4,
                    step: .01,
                    marks: {
                        1: ''
                    }
                },
                introduce: {
                    description: '默认值为 <span>1</span>，取值范围在 <span>0</span> 到 <span>1</span>，质量参数控制图像生成消耗的GPU算力，直接影响细节与纹理的呈现效果，通过质量参数，精准调节图像细节与处理时长：<span>--q #</span> 或 <span>--quality #</span> <br>Midjourney V7版本中质量默认值为1，也可设置为2或4——对应消耗2倍/4倍GPU算力。<br>注意：质量参数仅作用于首次生成的四张基础图，不影响后续变体、局部重绘/扩展或高清放大操作 <br>V7版本中不存在 <span>--q 3</span> 参数设定，若输入该值系统将自动切换至 <span>--q 4</span> <br><span>-q 4</span> 与全能参考（Omni Reference）功能不兼容',
                    prompt: 'vibrant California poppies <span>--q 2</span>',
                    result: '<img src="https://docs.midjourney.com/hc/article_attachments/37914513293965" alt="" />'
                },
                active: false,
                visible: true
            },
            {
                label: '种子',
                value: 0,
                default: 0,
                range: [ 0, 4294967295 ],
                prefix: '--seed',
                parameter: '--seed',
                type: 'input-number',
                props: {
                    placeholder: `0`,
                    min: 0,
                    max: 4294967295,
                    step: 1,
                    stepStrictly: true
                },
                width: '160px',
                introduce: {
                    description: '种子是点燃图像生成的初始火花。想象它如同电视屏幕上的随机噪点——正是图像诞生前的第一步。使用种子时，您能锁定特定的起点，相同种子值多次生图结果一致，固定种子参数，实现可复现的测试与实验，若不指定种子，每次将随机生成新种子，从而产生多样化结果：<span>--seed #</span>',
                    prompt: 'vibrant California poppies <span>--seed 399674</span>',
                    result: '<img src="https://docs.midjourney.com/hc/article_attachments/32629964439309" alt="" />'
                },
                active: false,
                visible: true
            },
            {
                label: '混乱度',
                value: 0,
                default: 0,
                range: [ 0, 100 ],
                prefix: '--chaos / --c',
                parameter: '--c',
                /*type: 'input-number',
                props: {
                    placeholder: `0`,
                    min: 0,
                    max: 100
                },*/
                type: 'slider',
                props: {
                    min: 0,
                    max: 100
                },
                introduce: {
                    description: '混乱度默认值为 <span>0</span>，取值范围在 <span>0</span> 到 <span>100</span> 之间，此时会根据提示生成四张图。若希望每张图的差异更明显，可提高混乱度数值，生成结果增加多样性，会有意想不到的创意： <span>--c #</span> 或 <span>--chaos #</span>',
                    prompt: 'vibrant California poppies <span>--c 10</span>',
                    result: '<img src="https://docs.midjourney.com/hc/article_attachments/35302982032653" alt="" />'
                },
                active: false,
                visible: true
            },
            {
                label: '怪异度',
                value: 0,
                default: 0,
                range: [ 0, 3000 ],
                prefix: '--weird / --w',
                parameter: '--w',
                type: 'input-number',
                props: {
                    placeholder: `0`,
                    min: 0,
                    max: 3000,
                    step: 0.01
                },
               /* type: 'slider',
                props: {
                    min: 0,
                    max: 3000
                },*/
                // width: '374px',
                introduce: {
                    description: '默认值为 <span>0</span>，取值范围在 <span>0</span> 到 <span>3000</span>，这是一个趣味工具，通过注入非常规或奇异元素为图像增添趣味。启用它即指示Midjourney大胆尝试创意突破，该参数赋予您创造实验性、打破常规图像的能力，让创作灵感漫游至新奇领域！突破常规创作边界，生成古怪和非传统的，离经叛道的图像： <span>--w #</span> 或 <span>--weird #</span> <br><br>需注意：古怪模式是实验性功能，"weird" 的定义可能动态变化，且与种子参数不完全兼容，同时仅支持Midjourney V5及以上版本。',
                    prompt: 'illustration of a cat <span>--w 100</span>',
                    result: '<img src="https://docs.midjourney.com/hc/article_attachments/32497154088077" alt="" />'
                },
                active: false,
                visible: true
            },
            {
                label: '排除',
                value: '',
                default: '',
                range: null,
                prefix: '--no',
                parameter: '--no',
                type: 'input',
                props: {},
                width: '374px',
                introduce: {
                    description: '通过反向提示词指定图像中需排除的元素：<span>--no #</span>',
                    prompt: 'still life gouache painting <span>--no fruit</span>',
                    result: '<img src="https://docs.midjourney.com/hc/article_attachments/32174098027021" alt="" />'
                },
                active: false,
                visible: true
            }
        ],
        [
            {
                type: 'input',
                label: '原始模式 --raw',
                value: '',
                description: '通过原始模式深度掌控你的图片',
                active: false,
                visible: false
            },
            {
                type: 'input',
                label: 'Niji 模型：--niji',
                value: '',
                description: '切换专注于动漫和东方美学的模型',
                active: false,
                visible: false
            },
            {
                type: 'input',
                label: '版本 --version / --v',
                value: '',
                description: '切换 Midjourney 模型版本',
                active: false,
                visible: false
            },
            {
                type: 'input',
                label: '批量生成 --repeat / --r',
                value: '',
                description: '无需重复输入，一键生成多组图像',
                active: false,
                visible: false
            }
        ]
        /*
  [
      {
             type: 'input',
             label: '风格参考 --sref',
             value: '',
             description: '想要复刻其他图片的整体风格？只需提供风格参考图即可！',
             active: false,
             visible: false
         },
         {
             type: 'input',
             label: '个性化 --profile / --p',
             value: '',
             description: '通过专属个人档案和情绪画板，打造自定义图片风格',
             active: false,
             visible: false
         },
         {
             type: 'input',
             label: '全域参照 --oref',
             value: '',
             description: '如需使用人物形象特征或物体形态，可为 Midjourney 提供全域参照！（V7 版本中已取代角色参照功能）',
             active: false,
             visible: false
         },
         {
             type: 'input',
             label: '极速生成 --fast',
             value: '',
             description: '将 GPU 切换至极速渲染模式',
             active: false,
             visible: false
         },
         {
             type: 'input',
             label: '放松模式 --relax',
             value: '',
             description: '切换至低速渲染节省算力',
             active: false,
             visible: false
         },
         {
             type: 'input',
             label: '涡轮加速模式 --turbo',
             value: '',
             description: '将GPU速度切换到Turbo超速渲染模式',
             active: false,
             visible: false
         },
         {
             type: 'input',
             label: '公开模式 --public',
             value: '',
             description: '在 Midjourney 官网发布你的作品',
             active: false,
             visible: false
         },
         {
             type: 'input',
             label: '隐身模式 --stealth',
             value: '',
             description: '在 Midjourney 官网上隐藏你的图片作品',
             active: false,
             visible: false
         },
         {
             type: 'input',
             label: '轻量生成 --draft',
             value: '',
             description: '启动 V7 轻量生成模式生成草稿图像，仅需半额 GPU 消耗',
             active: false,
             visible: false
         }
     ]*/
    ]);

    const result = ref('');

    const getParameter = () => {

        let ps = [];

        for (const item of parameters.value) {
            for (const d of item) {
                if (!d.visible || !d.active || d.default === d.value) {
                    continue;
                }
                let value = `${ d.parameter } ${ d.value }`;
                if (d.parameter === d.value) {
                    value = d.value.trim();
                }
                ps.push(value);
            }
        }

        result.value = ps.join(' ');

        $mitt.emit('combination');
    };

    watch(() => parameters.value, () => {
        getParameter();
    }, { deep: true });

    return { parameters, result };
});