<template>
  <div class="auth-container">
    <div v-if="isLoginMode" class="auth-form">
      <h3>登录</h3>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login-username">用户名:</label>
          <input id="login-username" v-model="loginForm.username" type="text" required>
        </div>
        <div class="form-group">
          <label for="login-password">密码:</label>
          <input id="login-password" v-model="loginForm.password" type="password" required>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit">登录</button>
      </form>
      <p class="toggle-link">
        没有账号? <a @click="toggleMode">点击注册</a>
      </p>
    </div>

    <div v-else class="auth-form">
      <h3>注册</h3>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="reg-username">用户名:</label>
          <input id="reg-username" v-model="registerForm.username" type="text" required>
        </div>
        <div class="form-group">
          <label for="reg-password">密码:</label>
          <input id="reg-password" v-model="registerForm.password" type="password" required>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <button type="submit">注册</button>
      </form>
      <p class="toggle-link">
        已有账号? <a @click="toggleMode">返回登录</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import apiClient from '@/services/api.js';

const router = useRouter();
const authStore = useAuthStore();

const isLoginMode = ref(true); // 控制显示登录还是注册表单
const error = ref(null);
const successMessage = ref(null);

const loginForm = reactive({ username: '', password: '' });
const registerForm = reactive({ username: '', password: '' });

const handleLogin = async () => {
  error.value = null;
  try {
    await authStore.login(loginForm.username, loginForm.password);
    router.push('/dashboard'); // 登录成功后跳转到仪表盘
  } catch (err) {
    error.value = err.response?.data?.message || '登录失败，请检查您的用户名和密码。';
  }
};

const handleRegister = async () => {
  error.value = null;
  successMessage.value = null;
  try {
    const response = await apiClient.post('/auth/register', {
      username: registerForm.username,
      password: registerForm.password
    });
    successMessage.value = "注册成功！请返回登录。";
    // 清空表单
    registerForm.username = '';
    registerForm.password = '';
  } catch (err) {
    error.value = err.response?.data?.message || '注册失败，请稍后再试。';
  }
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  error.value = null; // 切换模式时清空错误信息
  successMessage.value = null;
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.auth-form h3 {
  text-align: center;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
button:hover {
  background-color: #218838;
}
.error-message {
  color: red;
  margin-bottom: 1rem;
  text-align: center;
}
.success-message {
  color: green;
  margin-bottom: 1rem;
  text-align: center;
}
.toggle-link {
  text-align: center;
  margin-top: 1rem;
}
.toggle-link a {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}
</style>