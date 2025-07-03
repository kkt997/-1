import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 导入 Node.js 的 path 模块

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 设置 `@` 别名，使其指向 `src` 目录的绝对路径
      '@': path.resolve(__dirname, './src')
    }
  }
})