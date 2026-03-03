<template>
  <div class="register-container">
    <el-card header="情侣空间注册" shadow="hover" class="register-card">
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
          class="register-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="选填，输入手机号"></el-input>
        </el-form-item>
        <el-form-item class="register-btn-group">
          <el-button type="primary" @click="handleRegister" class="register-btn">注册</el-button>
          <el-button type="text" @click="goToLogin">已有账号？去登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userRegister } from '../api/user'

const router = useRouter()
const formRef = ref(null)
const form = ref({
  username: '',
  password: '',
  phone: ''
})

// 表单验证规则
const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur', min: 6, message: '密码至少6位' }]
})

// 注册逻辑
const handleRegister = async () => {
  try {
    await formRef.value.validate()
    await userRegister(form.value)
    ElMessage.success('注册成功！请登录')
    router.push('/login')
  } catch (err) {
    ElMessage.error(err || '注册失败，请重试')
  }
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}
.register-card {
  width: 450px;
}
.register-form {
  margin-top: 20px;
}
.register-btn-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.register-btn {
  width: 120px;
}
</style>