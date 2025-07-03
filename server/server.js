// 文件位置: server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes'); // 确保您的路由文件路径正确
// ✅ 1. 从 service.js 导入 SimulationService“蓝图”
const { SimulationService } = require('./service'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    
    // ✅ 2. 在数据库连接成功后，创建实例并启动模拟服务
    const simulationService = new SimulationService();
    simulationService.start();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });