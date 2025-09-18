/**
 * Web Worker 用于计算波形图数据
 * 避免在主线程中进行大量计算，提高性能
 */

// 监听主线程发送的消息
self.onmessage = function(e) {
    const { type, data, config } = e.data;
    
    switch (type) {
        case 'CALCULATE_WAVEFORM': {
            waveformCalculate(data, config);
            break;
        }

        case 'TERMINATE': {
            self.close();
            break;
        }

        default: {
            console.warn('未知的消息类型:', type);
        }
    }
};

let mode;
let width;
let height;
let dataLength;
let barWidth;
let waveformData = [];

/**
 * 计算波形图数据
 * @param {Array|TypedArray} audioData - 音频数据
 * @param {Object} config - 配置参数
 */
function waveformCalculate(audioData, config) {

    if (!mode) {
        mode = config.mode;
        width = config.width;
        height = config.height;
        dataLength = config.dataLength;
        barWidth = width / dataLength;
    }

    waveformData.length = 0;
    
    try {
        for (let i = 0; i < dataLength; i++) {
            let barHeight = 0;
            let d = audioData[i];
            let x = i * barWidth;
            
            // 根据不同的模式计算条形高度
            switch (mode) {
                case 'byteFrequency': {
                    barHeight = d / 2;
                    break;
                }
                case 'byteTimeDomain': {
                    barHeight = d - 128;
                    break;
                }
                case 'floatFrequency': {
                    barHeight = d + height;
                    break;
                }
                case 'floatTimeDomain': {
                    barHeight = d * 200;
                    break;
                }
                default: {
                    barHeight = 0;
                    break;
                }
            }
            
            const y = height / 2 - barHeight / 2;
            
            waveformData.push({
                x: x,
                y: y,
                width: barWidth,
                height: barHeight
            });
        }
        
        // 将计算结果发送回主线程
        self.postMessage({
            type: 'WAVEFORM_CALCULATED',
            data: waveformData,
            config: config
        });
        
    } catch (error) {
        // 如果计算过程中出现错误，发送错误信息
        self.postMessage({
            type: 'WAVEFORM_ERROR',
            error: error.message,
            config: config
        });
    }
}
