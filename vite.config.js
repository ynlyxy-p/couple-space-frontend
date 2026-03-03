import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        port: 3000,          // 强制固定3000端口
        open: true,          // 启动时自动打开浏览器
        host: '0.0.0.0',     // 允许局域网访问
        cors: true           // 允许跨域
    }
})