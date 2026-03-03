<template>
  <div class="login-container">
    <el-card header="情侣空间登录" shadow="hover" class="login-card">
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
          class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item class="login-btn-group">
          <el-button type="primary" @click="handleLogin" class="login-btn">登录</el-button>
          <el-button type="text" @click="goToRegister">还没有账号？去注册</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userLogin } from '../api/user'

const router = useRouter()
const formRef = ref(null)
const form = ref({
  username: '',
  password: ''
})

// 表单验证规则
const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

// 登录逻辑
const handleLogin = async () => {
  try {
    await formRef.value.validate()
    const res = await userLogin(form.value)
    ElMessage.success('登录成功！')
    localStorage.setItem('couple_token', res.data.token)
    router.push('/home')
  } catch (err) {
    ElMessage.error(err || '登录失败，请检查用户名或密码')
  }
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}
.login-card {
  width: 450px;
}
.login-form {
  margin-top: 20px;
}
.login-btn-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.login-btn {
  width: 120px;
}
</style>