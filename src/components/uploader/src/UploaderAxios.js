import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000'
});

axiosInstance.interceptors.response.use((response) => {
    if (response.data && response.data.code === 0) {
        return response.data;
    } else {
        throw new Error(response.data.message || '服务异常!');
    }
}, (error) => {
    throw error;
});

export default axiosInstance;
