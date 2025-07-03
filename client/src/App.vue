<template>
  <div id="app-layout">
    <header v-if="authStore.isAuthenticated">
      <h1>Smart Irrigation System</h1>
      <nav>
        <router-link to="/dashboard">Dashboard</router-link>
        <button @click="authStore.logout()">Logout</button>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}
nav a {
  margin-right: 1rem;
}
</style>