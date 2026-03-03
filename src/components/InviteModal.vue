<template>
  <el-dialog
      title="邀请情侣"
      v-model="visible"
      width="400px"
      @close="resetForm"
  >
    <el-form :model="inviteForm" :rules="inviteRules" ref="inviteFormRef" label-width="80px">
      <el-form-item label="对方用户名" prop="inviteeUsername">
        <el-input v-model="inviteForm.inviteeUsername" placeholder="请输入对方的用户名"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleInvite">发送邀请</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { inviteCouple } from '@/api/couple'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'invite-success'])

const visible = ref(props.modelValue)
const inviteFormRef = ref(null)
const inviteForm = ref({
  inviteeUsername: ''
})

const inviteRules = ref({
  inviteeUsername: [
    { required: true, message: '请输入对方用户名', trigger: 'blur' }
  ]
})

// 监听弹窗显示状态
watch(
    () => props.modelValue,
    (val) => {
      visible.value = val
    }
)

// 重置表单
const resetForm = () => {
  inviteFormRef.value.resetFields()
  inviteForm.value = {
    inviteeUsername: ''
  }
}

// 发送邀请
const handleInvite = async () => {
  try {
    await inviteFormRef.value.validate()
    await inviteCouple(inviteForm.value)
    ElMessage.success('邀请发送成功')
    visible.value = false
    emit('invite-success')
  } catch (error) {
    console.error('发送邀请失败:', error)
  }
}

// 同步弹窗状态
watch(
    () => visible.value,
    (val) => {
      emit('update:modelValue', val)
    }
)
</script>