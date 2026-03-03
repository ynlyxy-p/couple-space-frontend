import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

// 创建axios实例
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 添加token
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data
        // 业务错误处理
        if (res.code !== 200) {
            ElMessage.error(res.msg || '请求失败')
            // token过期
            if (res.code === 401) {
                const router = useRouter()
                ElMessageBox.confirm(
                    '登录已过期，请重新登录',
                    '提示',
                    {
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                ).then(() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('userInfo')
                    router.push('/login')
                })
            }
            return Promise.reject(res)
        }
        return res
    },
    error => {
        ElMessage.error(error.message || '服务器错误')
        return Promise.reject(error)
    }
)

export default service