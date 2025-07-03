// 文件位置: client/src/components/FarmlandCard.vue
<template>
  <div class="card">
    <h4>{{ farmland.name }}</h4>
    <p><strong>位置:</strong> {{ farmland.location }}</p>
    <p><strong>面积:</strong> {{ farmland.area || '未设置' }} 亩</p>
    <p><strong>作物:</strong> {{ farmland.crop || '未设置' }}</p>
    <button @click="viewDetails">查看详情</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const props = defineProps({
  farmland: { type: Object, required: true }
});

const viewDetails = () => {
  // 点击后跳转到该农田的详情/监控页面
  router.push(`/farmland/${props.farmland._id}`);
};
</script>

<style scoped>
/* ... 样式可以保持不变，或按需美化 ... */
.card p { margin: 8px 0; }
button {
  margin-top: 10px;
  width: 100%;
  padding: 8px;
  border: none;
  background-color: #17a2b8;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
button:hover { background-color: #138496; }
</style>