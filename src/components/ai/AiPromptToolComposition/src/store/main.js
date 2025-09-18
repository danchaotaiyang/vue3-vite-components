import { ref } from 'vue';
import { defineStore } from 'pinia';


export const usePromptMainStore = defineStore('prompt-main', () => {

    const platforms = ref([
        'Midjourney',
        'StableDiffusion'
    ]);

    const current = ref('Midjourney');

    return {
        platforms, current
    };
});