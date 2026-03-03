<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <el-header>
      <div class="header-content">
        <h1>情侣空间</h1>
        <div class="user-info">
          <el-avatar :src="userInfo.avatar" class="user-avatar"></el-avatar>
          <span class="username">{{ userInfo.username }}</span>
          <el-button type="text" @click="logout">退出登录</el-button>
        </div>
      </div>
    </el-header>

    <el-container style="height: calc(100vh - 60px);">
      <!-- 侧边栏 -->
      <el-aside width="200px" style="background-color: #f5f5f5;">
        <el-menu default-active="1">
          <el-menu-item index="1">
            <el-icon><House /></el-icon>
            <span slot="title">我的空间</span>
          </el-menu-item>
          <el-menu-item index="2" @click="showInviteModal = true">
            <el-icon><UserFilled /></el-icon>
            <span slot="title">邀请情侣</span>
          </el-menu-item>
          <el-menu-item index="3" @click="getInvitations">
            <el-icon><Message /></el-icon>
            <span slot="title">邀请消息</span>
            <el-badge :value="invitationCount" class="badge" v-if="invitationCount > 0"></el-badge>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main>
        <!-- 情侣信息 -->
        <div class="couple-info" v-if="coupleInfo">
          <el-card>
            <div class="couple-header">
              <el-avatar :src="userInfo.avatar" size="large"></el-avatar>
              <div class="love-icon">❤️</div>
              <el-avatar :src="coupleInfo.partner.avatar" size="large"></el-avatar>
            </div>
            <div class="couple-names">
              <span>{{ userInfo.username }}</span>
              <span> & {{ }} </span>
              <span>{{ coupleInfo.partner.username }}</span>
            </div>
            <div class="couple-time">
              在一起 {{ formatDate(coupleInfo.created_at) }}
            </div>
          </el-card>
        </div>

        <!-- 未建立情侣关系提示 -->
        <div class="no-couple" v-else>
          <el-card>
            <div class="no-couple-content">
              <el-icon size="48"><Heart /></el-icon>
              <p>还没有情侣，快去邀请TA吧！</p>
              <el-button type="primary" @click="showInviteModal = true">邀请情侣</el-button>
            </div>
          </el-card>
        </div>

        <!-- 发布动态 -->
        <el-card class="publish-card" v-if="coupleInfo">
          <el-form :model="momentForm" ref="momentFormRef">
            <el-form-item>
              <el-input
                  v-model="momentForm.content"
                  type="textarea"
                  rows="3"
                  placeholder="分享你们的甜蜜时光..."
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-upload
                  action="#"
                  :auto-upload="false"
                  :on-change="handleImageChange"
                  list-type="picture-card"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item align="right">
              <el-button type="primary" @click="publishMoment">发布</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 动态列表 -->
        <div class="moment-list" v-if="coupleInfo">
          <moment-item
              v-for="moment in momentList"
              :key="moment.moment_id"
              :moment="moment"
          ></moment-item>
        </div>
      </el-main>
    </el-container>

    <!-- 邀请情侣弹窗 -->
    <invite-modal
        v-model="showInviteModal"
        @invite-success="getCoupleInfo"
    ></invite-modal>

    <!-- 邀请消息弹窗 -->
    <el-dialog
        title="情侣邀请"
        v-model="showInvitationModal"
        width="400px"
    >
      <el-table :data="invitationList" border>
        <el-table-column prop="inviter.username" label="邀请人"></el-table-column>
        <el-table-column prop="created_at" label="邀请时间">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="handleInvitation(scope.row.invitation_id, 1)"
            >
              接受
            </el-button>
            <el-button
                type="danger"
                size="small"
                @click="handleInvitation(scope.row.invitation_id, 2)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { House, UserFilled, Message, Heart, Plus } from '@element-plus/icons-vue'
import { getUserInfo } from '@/api/user'
import { getCoupleInfo, getInvitationList, handleInvitation } from '@/api/couple'
import { getMomentList, publishMoment } from '@/api/moment'
import InviteModal from '@/components/InviteModal.vue'
import MomentItem from '@/components/MomentItem.vue'

const router = useRouter()
// 用户信息
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || {})
// 情侣信息
const coupleInfo = ref(null)
// 邀请弹窗
const showInviteModal = ref(false)
// 邀请消息弹窗
const showInvitationModal = ref(false)
// 邀请列表
const invitationList = ref([])
// 邀请数量
const invitationCount = ref(0)
// 动态表单
const momentFormRef = ref(null)
const momentForm = ref({
  content: '',
  images: []
})
// 动态列表
const momentList = ref([])

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  ElMessage.success('退出成功')
  router.push('/login')
}

// 获取情侣信息
const getCoupleInfoHandler = async () => {
  try {
    const res = await getCoupleInfo()
    coupleInfo.value = res.data
    // 如果有情侣关系，获取动态列表
    if (res.data) {
      getMomentListHandler()
    }
  } catch (error) {
    console.error('获取情侣信息失败:', error)
  }
}

// 获取邀请列表
const getInvitations = async () => {
  try {
    const res = await getInvitationList()
    invitationList.value = res.data
    invitationCount.value = res.data.length
    showInvitationModal.value = true
  } catch (error) {
    console.error('获取邀请列表失败:', error)
  }
}

// 处理邀请
const handleInvitationHandler = async (invitationId, action) => {
  try {
    await handleInvitation({
      invitation_id: invitationId,
      action
    })
    ElMessage.success(action === 1 ? '接受邀请成功' : '拒绝邀请成功')
    showInvitationModal.value = false
    // 刷新情侣信息
    getCoupleInfoHandler()
    // 刷新邀请列表
    getInvitations()
  } catch (error) {
    console.error('处理邀请失败:', error)
  }
}

// 处理图片上传
const handleImageChange = (file) => {
  // 这里简化处理，实际项目需要上传到服务器
  momentForm.value.images.push(file.url || file.name)
}

// 发布动态
const publishMomentHandler = async () => {
  try {
    await publishMoment(momentForm.value)
    ElMessage.success('发布成功')
    // 清空表单
    momentForm.value = {
      content: '',
      images: []
    }
    // 刷新动态列表
    getMomentListHandler()
  } catch (error) {
    console.error('发布动态失败:', error)
  }
}

// 获取动态列表
const getMomentListHandler = async () => {
  try {
    const res = await getMomentList()
    momentList.value = res.data
  } catch (error) {
    console.error('获取动态列表失败:', error)
  }
}

// 初始化
onMounted(async () => {
  // 获取用户信息
  try {
    const res = await getUserInfo()
    userInfo.value = {
      userId: res.data.user_id,
      username: res.data.username,
      avatar: res.data.avatar
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }

  // 获取情侣信息
  getCoupleInfoHandler()

  // 获取未处理的邀请数量
  try {
    const res = await getInvitationList()
    invitationCount.value = res.data.length
  } catch (error) {
    console.error('获取邀请数量失败:', error)
  }
})
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  cursor: pointer;
}

.couple-info {
  margin-bottom: 20px;
}

.couple-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}

.love-icon {
  font-size: 24px;
}

.couple-names {
  text-align: center;
  font-size: 18px;
  margin-bottom: 10px;
}

.couple-time {
  text-align: center;
  color: #999;
}

.no-couple {
  margin-bottom: 20px;
}

.no-couple-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.publish-card {
  margin-bottom: 20px;
}

.moment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.badge {
  margin-top: -5px;
}
</style>