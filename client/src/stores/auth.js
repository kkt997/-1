import { defineStore } from 'pinia';
// 使用 @ 别名来导入 api.js，并确保包含 .js 后缀
import apiClient from '@/services/api.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
  }),
  actions: {
    async login(username, password) {
      const response = await apiClient.post('/auth/login', { username, password });
      this.token = response.data.token;
      localStorage.setItem('token', this.token);
      // 您可以在这里添加获取用户信息的逻辑
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});