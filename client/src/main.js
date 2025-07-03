import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router'; 
// 使用 @ 别名来导入 CSS 文件
import '@/assets/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');