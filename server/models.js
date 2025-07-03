// 文件位置: server/models.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// 新增：设备模型
const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true, default: '默认设备' },
  // 设备类型：'humidity_sensor' (湿度传感器), 'pump' (水泵/执行器)
  type: { type: String, enum: ['humidity_sensor', 'pump'], required: true },
  // 设备状态：'online' (在线), 'offline' (离线), 'active' (工作中)
  status: { type: String, default: 'offline' },
  // 该设备属于哪个农田
  farmland: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmland', required: true }
});

const FarmlandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  area: { type: Number, default: 0 }, // 新增：面积
  crop: { type: String, default: '未知作物' }, // 新增：种植作物
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
  // 新增：灌溉阈值，例如湿度低于 30% 就需要灌溉
  irrigationThreshold: { type: Number, default: 30 }
});

// 新增：传感器数据模型
const SensorDataSchema = new mongoose.Schema({
  farmland: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmland', required: true },
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  temperature: { type: Number },
  humidity: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

// 新增：灌溉记录模型
const IrrigationRecordSchema = new mongoose.Schema({
  farmland: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmland', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  durationInSeconds: { type: Number, default: 0 },
  waterVolume: { type: Number, default: 0 }, // 灌溉水量（虚拟单位）
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' }
});

const User = mongoose.model('User', UserSchema);
const Device = mongoose.model('Device', DeviceSchema);
const Farmland = mongoose.model('Farmland', FarmlandSchema);
const SensorData = mongoose.model('SensorData', SensorDataSchema);
const IrrigationRecord = mongoose.model('IrrigationRecord', IrrigationRecordSchema);

module.exports = { User, Device, Farmland, SensorData, IrrigationRecord };