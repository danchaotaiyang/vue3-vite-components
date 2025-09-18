import { ref } from 'vue';
import { defineStore } from 'pinia';
import { $mitt } from '../utils/mitt.js';
import { usePromptDetailsStore, usePromptParameterStore, usePromptSubjectStore } from '../store';


export const usePromptResultStore = defineStore('prompt-result', () => {

    const storeSubject = usePromptSubjectStore();
    const storeDetails = usePromptDetailsStore();
    const storeParameter = usePromptParameterStore();

    const result = ref('');

    const generate = () => {
        try {
            let prompt = [];
            if (storeSubject[ 'result' ]) {
                prompt.push(storeSubject[ 'result' ]);
            }
            if (storeDetails[ 'result' ]) {
                prompt.push(storeDetails[ 'result' ]);
            }
            let parameter = storeParameter[ 'result' ];
            result.value = `${ prompt.join(',') } ${ parameter }`.trim();
        } catch (e) {
            console.warn(e);
        } finally {

        }
    };

    $mitt.off('combination', generate);
    $mitt.on('combination', generate);

    return { result };
});