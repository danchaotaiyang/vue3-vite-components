import { ref } from 'vue';
import { defineStore } from 'pinia';
import { promptFilterBreak } from '../utils/tool.js';
import { MD5 } from '../utils/md5.js';
import $ from 'jquery';


const appid = '20250518002360340';
const key = 'zOW9rdIfgZfIhbHqj3P2';
const HISTORY_KEY = 'TRANSLATE_HISTORY_BAIDU';

export const usePromptTranslateStore = defineStore('prompt-translate', () => {

    const loading = ref(false);


    const translateHistory = new Map();

    const getHistory = () => {
        let history = JSON.parse(localStorage.getItem(HISTORY_KEY));
        if (!history) {
            return;
        }
        for (const [ key, value ] of history) {
            translateHistory.set(key, value);
        }
    };

    getHistory();

    const setHistory = () => {
        let history = [];
        translateHistory.forEach((value, key) => {
            history.push([ key, value ] );
        });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    };

    const fetchData = (query, from = 'zh', to = 'en') => {
        return new Promise((resolve, reject) => {
            let q = query.join('\n');
            let salt = (new Date).getTime();
            let sign = MD5(appid + q + salt + key);
            let needIntervene = 1;
            $.ajax({
                url: '//fanyi-api.baidu.com/api/trans/vip/translate',
                type: 'get',
                dataType: 'jsonp',
                data: { q, appid, salt, from, to, sign, needIntervene },
                success(data) {
                    let { trans_result } = data;
                    let result = trans_result.map(({ src: key, dst: value }) => {
                        translateHistory.set(key, value);
                        return { key, value };
                    });
                    resolve(result);
                },
                fail(error) {
                    console.warn(error);
                    reject(error);
                }
            });
        });
    };

    const translate = (keyword, from = 'zh', to = 'en') => {
        return new Promise(async (resolve, reject) => {
            if (!keyword) {
                reject('no keywords');
                return;
            }
            if (loading.value) {
                reject('loading');
                return;
            }
            loading.value = true;
            let result = new Map();
            let keywords = [];
            keyword.map(d => {
                let ks = promptFilterBreak(d);
                keywords.push(...ks);
            });
            console.log(keywords);
            let query = [];
            for (const key of keywords) {
                let history = translateHistory.get(key);
                if (history) {
                    result.set(key, history);
                } else {
                    result.set(key, '');
                    query.push(key);
                }
            }
            try {
                if (query.length) {
                    let searched = await fetchData(query, from, to);
                    console.log(searched);
                    for (const d of searched) {
                        result.set(d?.key, d?.value);
                        result.set(d?.value, d?.value);
                    }
                }
            } catch (e) {
                console.warn(e);
                reject(e);
            } finally {
                let finish = [];
                for (const key of keywords) {
                    finish.push({
                        key, value: result.get(key)
                    });
                }
                resolve(finish);
                loading.value = false;
                setHistory();
            }
        });
    };

    return { translate };
});