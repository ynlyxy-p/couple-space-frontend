import request from './request'

// 发布动态
export function publishMoment(data) {
    return request({
        url: '/moment/publish',
        method: 'post',
        data: data
    })
}

// 获取动态列表
export function getMomentList() {
    return request({
        url: '/moment/list',
        method: 'get'
    })
}