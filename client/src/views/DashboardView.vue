<template>
  <div class="dashboard">
    <h2>我的农田</h2>

    <div class="add-farmland-form">
      <h3>添加新农田</h3>
      <form @submit.prevent="addFarmland">
        <div class="form-group">
          <label for="farm-name">农田名称:</label>
          <input id="farm-name" v-model="newFarmland.name" type="text" placeholder="例如：北坡一号田" required>
        </div>
        <div class="form-group">
          <label for="farm-location">位置:</label>
          <input id="farm-location" v-model="newFarmland.location" type="text" placeholder="例如：村东头" required>
        </div>
        <button type="submit">确认添加</button>
      </form>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>

    <div class="farmland-list">
      <h3>农田列表</h3>
      <p v-if="isLoading">正在加载农田数据...</p>
      <p v-else-if="farmlands.length === 0">您还没有添加任何农田。</p>
      <div v-else class="cards-container">
        <FarmlandCard 
          v-for="farm in farmlands" 
          :key="farm._id" 
          :farmland="farm"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiClient from '@/services/api.js';
import FarmlandCard from '@/components/FarmlandCard.vue'; // 引入农田卡片组件

// 用于存储从后端获取的农田列表
const farmlands = ref([]);
// 控制加载状态的显示
const isLoading = ref(true);
// 存储错误信息
const error = ref(null);

// 用于绑定“添加新农田”表单的数据
const newFarmland = reactive({
  name: '',
  location: ''
});

// 从后端获取当前用户的所有农田
const fetchFarmlands = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await apiClient.get('/api/farmlands');
    farmlands.value = response.data;
  } catch (err) {
    error.value = '加载农田数据失败，请稍后重试。';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// 提交新农田数据的函数
const addFarmland = async () => {
  try {
    error.value = null;
    // 发送 POST 请求到后端创建新农田
    const response = await apiClient.post('/api/farmlands', newFarmland);
    // 成功后，将新农田添加到现有列表的开头
    farmlands.value.unshift(response.data);
    // 清空表单
    newFarmland.name = '';
    newFarmland.location = '';
  } catch (err) {
    error.value = '添加农田失败，请检查输入或稍后重试。';
    console.error(err);
  }
};

// 在组件挂载（页面加载）时，自动获取一次农田列表
onMounted(fetchFarmlands);
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 900px;
  margin: auto;
}
.add-farmland-form {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
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
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
.farmland-list h3 {
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>