const { User, Device, Farmland, SensorData, IrrigationRecord } = require('./models.js');
// 1. 从 service.js 导入所有需要的服务“蓝图” (Class)
const { 
  AuthService, 
  FarmlandService, 
  DataService, 
  KnowledgeService, 
  IrrigationService 
} = require('./service.js');

// 2. 根据蓝图，创建出所有可以使用的服务“实例”
const authService = new AuthService();
const farmlandService = new FarmlandService();
const dataService = new DataService();
const knowledgeService = new KnowledgeService();
const irrigationService = new IrrigationService(); // ✅ 创建灌溉服务的实例

// --- Auth Controller (最终修正版) ---
const authController = {
  async register(req, res) {
    console.log('--- 接收到注册请求 ---');
    console.log('请求体 (Body):', req.body);
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
      }
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      
      // ✅ 正确：直接调用 authService 实例上的 registerUser 方法
      const user = await authService.registerUser(username, password);
      
      console.log('步骤3: 用户在数据库中创建成功！');
      res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (error) {
      console.error('致命错误:', error);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      // ✅ 正确：直接调用 authService 实例上的 loginUser 方法
      const data = await authService.loginUser(username, password);
      res.status(200).json(data);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
};

// --- Farmland Controller ---
const farmlandController = {
  create: async (req, res) => {
    try {
      // ✅ 将 ownerId 从 req.userId 传递给服务
      const farmland = await farmlandService.create(req.body, req.userId);
      res.status(201).json(farmland);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const farmlands = await farmlandService.findByOwner(req.userId);
      res.status(200).json(farmlands);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const farmland = await farmlandService.findById(req.params.id, req.userId);
      if (!farmland) return res.status(404).json({ message: 'Farmland not found' });
      res.status(200).json(farmland);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // ✅ 新增：更新农田信息
  update: async (req, res) => {
    try {
      const updatedFarmland = await farmlandService.update(req.params.id, req.body, req.userId);
      if (!updatedFarmland) return res.status(404).json({ message: 'Farmland not found or access denied' });
      res.status(200).json(updatedFarmland);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update farmland', error: error.message });
    }
  },
  // ✅ 新增：删除农田
  delete: async (req, res) => {
    try {
      const deletedFarmland = await farmlandService.delete(req.params.id, req.userId);
      if (!deletedFarmland) return res.status(404).json({ message: 'Farmland not found or access denied' });
      res.status(200).json({ message: 'Farmland deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete farmland', error: error.message });
    }
  }
};

// --- Data Controller ---
const dataController = {
    getLatest: async (req, res) => {
        try {
            // ✅ 注意：这里的 farmlandId 是从路由参数中获取的
            const data = await dataService.getLatest(req.params.farmlandId);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    // ✅ 新增：获取历史灌溉记录
    getIrrigationRecords: async (req, res) => {
        try {
            const records = await dataService.getIrrigationRecords(req.params.farmlandId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get irrigation records', error: error.message });
        }
    }
};

// --- Knowledge Controller ---
const knowledgeController = {
    getAll: async (req, res) => {
        try {
            const articles = await knowledgeService.findAll(req.query.search);
            res.status(200).json(articles);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

// 导出所有控制器
module.exports = {
  authController,
  farmlandController,
  dataController,
  knowledgeController
};