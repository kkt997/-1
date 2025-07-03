// FILE: server/service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const { User, Farmland, Device, SensorData, IrrigationRecord } = require('./models.js');
const { jwtSecret } = require('./config'); // 确保您的 config.js 文件导出了 jwtSecret

// --- Auth Service ---
const authService = {
  // 修正：使其接收 username 和 password
  registerUser: async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    // 修正：使用 username 创建用户
    const newUser = new User({ username, password: hashedPassword });
    return await newUser.save();
  },
  // 修正：使其接收 username 和 password
  loginUser: async (username, password) => {
    // 修正：使用 username 查找用户
    const user = await User.findOne({ username });
    if (!user) throw new Error('用户不存在或密码错误');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('用户不存在或密码错误');

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
    return { token, user: { id: user._id, username: user.username } };
  }
};

// --- Farmland Service ---
const farmlandService = {
  create: async (data, ownerId) => new Farmland({...data, owner: ownerId }).save(),
  findByOwner: async (ownerId) => Farmland.find({ owner: ownerId }),
  findById: async (id, ownerId) => Farmland.findOne({ _id: id, owner: ownerId }),
  update: async (id, data, ownerId) => Farmland.findOneAndUpdate({ _id: id, owner: ownerId }, data, { new: true }),
  delete: async (id, ownerId) => Farmland.findOneAndDelete({ _id: id, owner: ownerId })
};

// --- Data Service ---
const dataService = {
    getLatest: async (farmlandId) => SensorData.findOne({ farmland: farmlandId }).sort({ timestamp: -1 }),
    getHistory: async (farmlandId, start, end) => {
        const query = { farmland: farmlandId, timestamp: { $gte: new Date(start), $lte: new Date(end) } };
        return SensorData.find(query).sort({ timestamp: 1 });
    },
    getIrrigationRecords: async (farmlandId) => IrrigationRecord.find({ farmland: farmlandId }).sort({ startTime: -1 })
};

// --- Knowledge Service ---
const knowledgeService = {
    findAll: async (query) => {
        const search = query? { $text: { $search: query } } : {};
        return KnowledgeArticle.find(search).sort({ createdAt: -1 });
    }
};

// // --- Simulation Service ---
// const simulationService = {
//   task: null,
//   start: function() {
//     this.task = cron.schedule('*/5 * * * *', async () => {
//       console.log('Running sensor data simulation...');
//       try {
//         const farmlands = await Farmland.find({});
//         for (const farm of farmlands) {
//           await this._generateNextDataPoint(farm._id);
//         }
//         console.log('Simulation task completed.');
//       } catch (error) {
//         console.error('Error during simulation:', error);
//       }
//     });
//   },
//   _generateNextDataPoint: async function(farmlandId) {
//     const lastData = await SensorData.findOne({ farmland: farmlandId }).sort({ timestamp: -1 });
//     let newTemp, newHumidity;
//     if (lastData) {
//       const hour = new Date().getHours();
//       const tempChange = (hour > 6 && hour < 18)? Math.random() * 0.5 : -Math.random() * 0.5;
//       newTemp = parseFloat((lastData.temperature + tempChange).toFixed(2));
//       const humidityChange = -(Math.random() * 0.2);
//       newHumidity = Math.max(0, parseFloat((lastData.humidity + humidityChange).toFixed(2)));
//     } else {
//       newTemp = 25 + (Math.random() - 0.5) * 2;
//       newHumidity = 50 + (Math.random() - 0.5) * 10;
//     }
//     await new SensorData({ farmland: farmlandId, temperature: newTemp, humidity: newHumidity }).save();
//   }
// };

// 新增：灌溉服务
class IrrigationService {
  /**
   * 检查农田是否需要灌溉
   * @param {string} farmlandId - 农田ID
   */
  async checkAndIrrigate(farmlandId) {
    console.log(`[IrrigationService] 正在检查农田 ${farmlandId} 是否需要灌溉...`);
    const farmland = await Farmland.findById(farmlandId);
    if (!farmland) return;

    // 找到该农田最新的湿度数据
    const latestSensorData = await SensorData.findOne({ farmland: farmlandId, humidity: { $exists: true } }).sort({ timestamp: -1 });
    if (!latestSensorData) {
      console.log(`[IrrigationService] 农田 ${farmland.name} 没有找到传感器数据。`);
      return;
    }
    
    console.log(`[IrrigationService] 农田 ${farmland.name} - 最新湿度: ${latestSensorData.humidity}%, 阈值: ${farmland.irrigationThreshold}%`);

    // 判断湿度是否低于阈值
    if (latestSensorData.humidity < farmland.irrigationThreshold) {
      console.log(`[IrrigationService] 湿度过低！准备为农田 ${farmland.name} 启动灌溉。`);
      // 在实际项目中，这里会给灌溉控制系统发指令
      // 我们用模拟来代替：直接创建一条灌溉记录
      const record = new IrrigationRecord({ farmland: farmlandId });
      await record.save();
      console.log(`[IrrigationService] 已为农田 ${farmland.name} 创建新的灌溉记录。`);
      // 可以在这里添加向用户推送通知的逻辑
    } else {
      console.log(`[IrrigationService] 农田 ${farmland.name} 湿度正常，无需灌溉。`);
    }
  }
}

// 修改：数据模拟服务
class SimulationService {
  start() {
    // 每分钟执行一次模拟
    cron.schedule('*/1 * * * *', async () => {
      console.log('[SimulationService] 开始执行数据模拟...');
      try {
        const farmlands = await Farmland.find({});
        if (farmlands.length === 0) return;

        // 为每个农田模拟数据
        for (const farm of farmlands) {
          // 找到农田的传感器设备
          const sensor = await Device.findOne({ farmland: farm._id, type: 'humidity_sensor' });
          if (sensor) {
            // 模拟生成数据
            const humidity = (Math.random() * 80 + 10).toFixed(2); // 10% - 90%
            const temperature = (Math.random() * 20 + 10).toFixed(2); // 10°C - 30°C
            const sensorData = new SensorData({
              farmland: farm._id,
              device: sensor._id,
              humidity,
              temperature
            });
            await sensorData.save();
            console.log(`[SimulationService] 已为农田 '${farm.name}' 生成模拟数据: 湿度 ${humidity}%, 温度 ${temperature}°C`);

            // *核心逻辑触发*：生成数据后，立刻检查是否需要灌溉
            const irrigationService = new IrrigationService();
            await irrigationService.checkAndIrrigate(farm._id);
          }
        }
        console.log('[SimulationService] 数据模拟完成。');
      } catch (error) {
        console.error('[SimulationService] 模拟过程中发生错误:', error);
      }
    });
  }
}

module.exports = {
  authService,
  farmlandService,
  dataService,
  knowledgeService,
  // simulationService,
  IrrigationService,
  SimulationService
};