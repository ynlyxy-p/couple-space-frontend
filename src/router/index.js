import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'

// 路由守卫：未登录不能访问主页
const requireAuth = (to, from, next) => {
    const token = localStorage.getItem('couple_token')
    if (token) {
        next()
    } else {
        next('/login')
    }
}

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/home', component: Home, beforeEnter: requireAuth }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router