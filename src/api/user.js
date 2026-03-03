import request from './request'

// 用户注册
export function userRegister(data) {
    return request({
        url: '/register',
        method: 'post',
        data: data
    })
}

// 用户登录
export function userLogin(data) {
    return request({
        url: '/login',
        method: 'post',
        data: data
    })
}

// 获取当前用户信息
export function getUserInfo() {
    return request({
        url: '/user/info',
        method: 'get'
    })
}