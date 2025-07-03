<template>
  <div class="farmland-detail" v-if="farmland">
    <h2>农田详情: {{ farmland.name }}</h2>
    <div class="info-grid">
      <p><strong>位置:</strong> {{ farmland.location }}</p>
      <p><strong>面积:</strong> {{ farmland.area }} 亩</p>
      <p><strong>作物:</strong> {{ farmland.crop }}</p>
      <p><strong>灌溉阈值:</strong> {{ farmland.irrigationThreshold }}%</p>
    </div>
    
    <div class="monitor-section">
      <h3>实时数据监控</h3>
      <RealTimeChart :farmland-id="farmlandId" />
    </div>

    <div class="history-section">
      <h3>历史灌溉记录</h3>
      <p>历史数据功能正在开发中...</p>
    </div>
  </div>
  <div v-else>
    <p>正在加载农田数据...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api.js';
import RealTimeChart from '@/components/RealTimeChart.vue';

const route = useRoute();
const farmlandId = route.params.id; // 从URL中获取农田ID
const farmland = ref(null);

onMounted(async () => {
  try {
    const response = await apiClient.get(`/api/farmlands/${farmlandId}`);
    farmland.value = response.data;
  } catch (error) {
    console.error("加载农田详情失败:", error);
  }
});
</script>

<style scoped>
.farmland-detail { padding: 2rem; max-width: 900px; margin: auto; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
.monitor-section, .history-section { margin-top: 2rem; }
</style>