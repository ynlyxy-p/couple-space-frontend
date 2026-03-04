<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <el-header class="home-header">
      <div class="header-content">
        <h2>情侣空间 💑</h2>
        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <!-- 主要内容 -->
    <el-main class="home-main">
      <el-row :gutter="20">
        <!-- 左侧：情侣信息 -->
        <el-col :span="6">
          <el-card header="我的情侣" shadow="hover">
            <div v-if="coupleInfo" class="couple-info">
              <el-avatar :src="coupleInfo.partner.avatar" size="large"></el-avatar>
              <p class="partner-name">{{ coupleInfo.partner.username }}</p>
              <el-button type="primary" size="small" @click="showInviteModal = true">
                更换情侣
              </el-button>
            </div>
            <div v-else class="no-couple">
              <p>还没有情侣？</p>
              <el-button type="primary" @click="showInviteModal = true">
                邀请情侣
              </el-button>
            </div>
          </el-card>

          <!-- 待处理邀请 -->
          <el-card header="待处理邀请" shadow="hover" style="margin-top: 20px;">
            <div v-if="invitationList.length > 0">
              <div v-for="invite in invitationList" :key="invite.invitation_id" class="invite-item">
                <p>来自 {{ invite.inviter.username }} 的邀请</p>
                <el-button type="primary" size="mini" @click="handleInvite(invite.invitation_id, 1)">
                  接受
                </el-button>
                <el-button size="mini" @click="handleInvite(invite.invitation_id, 2)">
                  拒绝
                </el-button>
              </div>
            </div>
            <div v-else>
              <p>暂无待处理邀请</p>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：动态区域 -->
        <el-col :span="18">
          <!-- 发布动态 -->
          <el-card shadow="hover" class="publish-card">
            <el-form ref="momentFormRef" :model="momentForm">
              <el-form-item>
                <el-input
                    v-model="momentForm.content"
                    type="textarea"
                    placeholder="分享你们的甜蜜瞬间..."
                    :rows="3"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitMoment">发布</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 动态列表（核心修复：字段名匹配 + 图片空值判断） -->
          <el-card header="甜蜜瞬间" shadow="hover" style="margin-top: 20px;">
            <div v-if="momentList.length > 0" class="moment-list">
              <div v-for="moment in momentList" :key="moment.moment_id" class="moment-item">
                <div class="moment-header">
                  <!-- 修复：直接使用后端返回的avatar字段，而非嵌套的publisher.avatar -->
                  <el-avatar :src="moment.avatar"></el-avatar>
                  <!-- 修复：直接使用后端返回的username字段，而非嵌套的publisher.username -->
                  <span class="publisher-name">{{ moment.username }}</span>
                  <span class="moment-time">{{ formatTime(moment.created_at) }}</span>
                </div>
                <div class="moment-content">{{ moment.content }}</div>
                <!-- 修复：增加images空值判断，避免null导致的渲染错误 -->
                <div v-if="moment.images && moment.images.length > 0" class="moment-images">
                  <el-image
                      v-for="img in moment.images"
                      :key="img"
                      :src="img"
                      style="width: 100px; height: 100px; margin-right: 10px;"
                      fit="cover"
                  ></el-image>
                </div>
              </div>
            </div>
            <div v-else>
              <p class="no-moment">暂无动态，发布第一条甜蜜瞬间吧～</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <!-- 邀请情侣弹窗 -->
    <el-dialog title="邀请情侣" v-model="showInviteModal" width="400px">
      <el-form ref="inviteFormRef" :model="inviteForm" :rules="inviteRules">
        <el-form-item label="对方用户名" prop="invitee_username">
          <el-input v-model="inviteForm.invitee_username" placeholder="输入对方的用户名"></el-input>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="showInviteModal = false">取消</el-button>
        <el-button type="primary" @click="sendInvite">发送邀请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '../api/user'
import { getCoupleInfo, inviteCouple, getInvitationList, handleInvitation } from '../api/couple'
import { getMomentList, publishMoment } from '../api/moment'

const router = useRouter()
const showInviteModal = ref(false)

// 情侣信息
const coupleInfo = ref(null)
// 邀请列表
const invitationList = ref([])
// 动态列表
const momentList = ref([])

// 邀请表单
const inviteFormRef = ref(null)
const inviteForm = ref({
  invitee_username: ''
})
const inviteRules = ref({
  invitee_username: [{ required: true, message: '请输入对方用户名', trigger: 'blur' }]
})

// 动态表单
const momentFormRef = ref(null)
const momentForm = ref({
  content: ''
})

// 初始化数据
onMounted(() => {
  loadCoupleInfo()
  loadInvitations()
  loadMoments()
})

// 加载情侣信息
const loadCoupleInfo = async () => {
  try {
    const res = await getCoupleInfo()
    coupleInfo.value = res.data
  } catch (err) {
    ElMessage.warning('未查询到情侣关系')
  }
}

// 加载邀请列表
const loadInvitations = async () => {
  try {
    const res = await getInvitationList()
    invitationList.value = res.data
  } catch (err) {
    console.log('加载邀请列表失败：', err)
  }
}

// 加载动态列表（保留调试日志，方便排查）
const loadMoments = async () => {
  try {
    const res = await getMomentList()
    momentList.value = res.data || [] // 确保数组不为空
    console.log('加载到的动态列表:', momentList.value) // 调试用，可保留
  } catch (err) {
    console.log('加载动态列表失败：', err)
  }
}

// 发送邀请
const sendInvite = async () => {
  try {
    await inviteFormRef.value.validate()
    await inviteCouple(inviteForm.value)
    ElMessage.success('邀请已发送！')
    showInviteModal.value = false
    loadInvitations()
  } catch (err) {
    ElMessage.error(err || '发送邀请失败')
  }
}

// 处理邀请
const handleInvite = async (invitationId, action) => {
  try {
    await handleInvitation({
      invitation_id: invitationId,
      action: action
    })
    ElMessage.success(action === 1 ? '接受邀请成功！' : '拒绝邀请成功')
    loadInvitations()
    loadCoupleInfo()
  } catch (err) {
    ElMessage.error(err || '处理邀请失败')
  }
}

// 发布动态（已保留发布后刷新列表的逻辑）
const submitMoment = async () => {
  try {
    if (!momentForm.value.content) {
      ElMessage.warning('请输入内容')
      return
    }
    // 调用接口发布
    await publishMoment(momentForm.value)
    ElMessage.success('发布成功！')
    // 清空输入框
    momentForm.value.content = ''
    // 关键：发布成功后重新加载动态列表
    await loadMoments()
  } catch (err) {
    ElMessage.error(err || '发布失败')
  }
}

// 退出登录
const logout = () => {
  localStorage.removeItem('couple_token')
  router.push('/login')
  ElMessage.success('已退出登录')
}

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString()
}
</script>

<style scoped>
.home-container {
  height: 100%;
}
.home-header {
  background-color: #409eff;
  color: white;
  padding: 0 20px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}
.home-main {
  padding: 20px;
}
.couple-info {
  text-align: center;
  padding: 20px 0;
}
.partner-name {
  margin: 10px 0;
  font-size: 16px;
  font-weight: bold;
}
.no-couple {
  text-align: center;
  padding: 20px 0;
}
.invite-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.publish-card {
  margin-bottom: 20px;
}
.moment-list {
  padding: 10px 0;
}
.moment-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}
.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.publisher-name {
  margin: 0 10px;
  font-weight: bold;
}
.moment-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}
.moment-content {
  margin-bottom: 10px;
  line-height: 1.5;
}
.moment-images {
  display: flex;
  flex-wrap: wrap;
}
.no-moment {
  text-align: center;
  padding: 20px 0;
  color: #999;
}
</style>