import axios from 'axios'

// 后端接口基础地址（对接你之前的后端8080端口）
const baseURL = 'http://localhost:8080/api'

const request = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器：添加token
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('couple_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器：统一处理结果
request.interceptors.response.use(
    (response) => {
        const res = response.data
        // 登录失效
        if (res.code === 401) {
            localStorage.removeItem('couple_token')
            window.location.href = '/login'
            ElMessage.error('登录失效，请重新登录')
            return Promise.reject(res.msg)
        }
        // 其他错误
        if (res.code !== 200) {
            ElMessage.error(res.msg || '请求失败')
            return Promise.reject(res.msg)
        }
        return res
    },
    (error) => {
        ElMessage.error(error.message || '网络异常')
        return Promise.reject(error)
    }
)

export default request