import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import DashboardView from '../views/DashboardView.vue';
import FarmlandDetailView from '../views/FarmlandDetailView.vue';

const routes = [
  {
    path: '/',
    redirect: '/login' // 应用根路径重定向到登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    // meta字段用于定义路由元信息，这里表示该路由需要认证
    meta: { requiresAuth: true }
  },
  {
    path: '/farmland/:id', // 使用动态路由参数 :id
    name: 'FarmlandDetail',
    component: FarmlandDetailView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置导航守卫
// 在每次路由跳转之前触发
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // 从本地存储获取token

  // 检查目标路由是否需要认证
  if (to.meta.requiresAuth && !token) {
    // 如果需要认证但用户未登录（没有token），则重定向到登录页
    next('/login');
  } else {
    // 否则，允许正常跳转
    next();
  }
});

export default router;