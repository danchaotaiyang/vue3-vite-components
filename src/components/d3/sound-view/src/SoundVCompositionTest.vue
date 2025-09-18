<template>
<div>
    <input type="file" @change="handleFileChange" accept="audio/*" />
    <button @click="stopPlayback" :disabled="!isLoaded">停止</button>
    <canvas ref="canvas" width="1201" height="211"></canvas>
</div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            // audioUrl:"http://121.41.225.74:9091/mintti/app/storage/newFile/b26uvk9ipd8n5iop1lzs.wav",
            audioUrl: "http://121.41.225.74:9091/mintti/app/storage/newFile/c19xqqqtd8ywqyaf8gno.wav",
            // audioUrl: "http://121.41.225.74:9091/mintti/app/storage/newFile/d3msxipdfxrbyijm3ys0.wav",
            // audioUrl:"http://121.41.225.74:9091/mintti/app/storage/newFile/xm456t9dptsrigxye84q.wav",

            dataArray: [],
            isPlaying: false,
            isLoaded: false,
            drawInterval: 200, // 设置绘制的时间间隔（单位：毫秒）
            drawIntervalId: null,
            fileData: new Int8Array(0),
            index: 0,
            mWidth: 0,
            mHeight: 0,
        }
    },
    mounted() {
        const ctx = this.$refs.canvas.getContext('2d')
        this.drawGrid(ctx)
        this.downloadAudio()
    },
    methods: {
        // 下载音频文件
        downloadAudio() {
            axios({
                method: 'get',
                url: this.audioUrl,
                responseType: 'arraybuffer'
            }).then(res => {
                if (!res) {
                    return;
                }

                console.log("decodeAudioData")
                this.loadAudio(res.data)
            }).catch(error => {
                console.error('下载音频时出错:', error);
            });
        },

        handleFileChange(event) {
            this.isLoaded = false
            const file = event.target.files[0]

            this.stopPlayback()
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log("onLoad")
                this.loadAudio(e.target.result)

            };

            reader.readAsArrayBuffer(file);
        },

        loadAudio(res) {
            this.dataArray = []
            this.isLoaded = true
            this.index = 0;
            // 获取文件的前 100 个字节
            this.fileData = new Int8Array(res);
            this.refreshData()

            this.drawIntervalId = setInterval(() => {
                console.log("定时器执行了")
                this.refreshData()
            }, this.drawInterval)//循环读取
        },
        refreshData() {
            let i = this.index
            console.log("文件总长度：" + this.fileData.byteLength + ",,i=" + i)
            if (i * 1600 + 44 > this.fileData.byteLength) {
                clearInterval(this.drawIntervalId)
                return
            }
            const byteArray = this.fileData.slice(i * 1600 + 44, (i + 1) * 1600 + 44);

            // 创建一个新的 Uint16Array,长度为 byteArray 的一半
            let shortArray = new Int16Array(byteArray.length / 2)

            //遍历 byteArray,将每两个字节合并成一个短整型
            for (let i = 0; i < byteArray.length; i += 2) {
                shortArray[i / 2] = (byteArray[i] & 0xFF) | (byteArray[i + 1] & 0xFF) << 8;
            }

            const step = 10;

            for (let i = 0; i < shortArray.length; i += step) {
                // console.log(i + "文件short值：" + shortArray[i])
                if (this.mWidth > 0 && this.dataArray.length >= this.mWidth) {
                    this.dataArray.shift()
                }
                this.dataArray.push(shortArray[i])
            }

            this.isPlaying = true
            this.draw2();
            this.index += 1;
        },
        stopPlayback() {
            console.log("停止播放-stopPlayback")
            this.isPlaying = false

            clearInterval(this.drawIntervalId)
            const ctx = this.$refs.canvas.getContext('2d')
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            this.drawGrid(ctx)
        },

        draw2() {
            if (!this.isPlaying) {
                return
            }
            // console.log('开始绘图-draw')

            const ctx = this.$refs.canvas.getContext('2d')
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            this.drawGrid(ctx)
            this.drawWaveform(ctx)
        },
        drawGrid(ctx) {
            const { width, height } = ctx.canvas
            this.mWidth = ctx.canvas.width
            this.mHeight = ctx.canvas.height

            ctx.strokeStyle = '#ccc'
            ctx.lineWidth = 1

            for (let i = 0; i < height; i += 10) {
                ctx.beginPath()
                ctx.moveTo(0, i)
                ctx.lineTo(width, i)
                ctx.stroke()
            }

            for (let j = 0; j < width; j += 10) {
                ctx.beginPath()
                ctx.moveTo(j, 0)
                ctx.lineTo(j, height)
                ctx.stroke()
            }
        },
        drawWaveform(ctx) {
            ctx.beginPath()
            ctx.lineWidth = 1
            ctx.strokeStyle = '#25ebd7'


            let x = 0
            let len = this.dataArray.length;
            let index = this.mWidth - len;
            for (let i = index + 1; i < this.mWidth; i++) {
                const mCenterY = this.mHeight / 2;
                const y = mCenterY - (this.dataArray[i - index - 1] / (32768 / mCenterY));
                // console.log(`i=${i},position=${i - index - 1},,data=${this.dataArray[i - index - 1]},,y=${y},,mCenterY=${mCenterY}`)
                x = i - 1;

                ctx.lineTo(x, y)
                ctx.stroke()
            }
        },
    }
}
</script>