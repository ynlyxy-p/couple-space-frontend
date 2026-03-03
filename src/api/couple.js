import request from './request'

// 邀请情侣
export function inviteCouple(data) {
    return request({
        url: '/couple/invite',
        method: 'post',
        data: data
    })
}

// 处理邀请（接受/拒绝）
export function handleInvitation(data) {
    return request({
        url: '/couple/handle-invitation',
        method: 'post',
        data: data
    })
}

// 获取情侣信息
export function getCoupleInfo() {
    return request({
        url: '/couple/info',
        method: 'get'
    })
}

// 获取待处理邀请列表
export function getInvitationList() {
    return request({
        url: '/couple/invitations',
        method: 'get'
    })
}