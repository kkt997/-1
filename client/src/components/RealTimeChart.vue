<template>
  <div>
    <h4>实时传感器数据</h4>
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent // 为导出图片等功能，可以加上工具箱
} from 'echarts/components';
import VChart from 'vue-echarts';
import apiClient from '@/services/api.js'; // 确保从 api.js 导入

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
]);

const props = defineProps({
  farmlandId: {
    type: String,
    required: true
  }
});

let intervalId = null;

// 使用 reactive 来创建响应式的 ECharts 配置对象
const chartOption = reactive({
  tooltip: {
    trigger: 'axis' // 鼠标悬浮时显示该点的所有数据
  },
  legend: {
    data:['温度', '湿度'] // 图例名称，需要和 series.name 对应
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] // X轴数据（时间），初始化为空数组
  },
  yAxis: [ // 定义两个Y轴
    {
      type: 'value',
      name: '温度 (°C)',
      position: 'left', // 左侧Y轴
      axisLabel: {
        formatter: '{value} °C'
      }
    },
    {
      type: 'value',
      name: '湿度 (%)',
      position: 'right', // 右侧Y轴
      axisLabel: {
        formatter: '{value} %'
      }
    }
  ],
  series: [ // 定义两条线
    {
      name: '温度',
      type: 'line',
      yAxisIndex: 0, // 使用第一个Y轴（温度轴）
      data: [] // 温度数据，初始化为空数组
    },
    {
      name: '湿度',
      type: 'line',
      yAxisIndex: 1, // 使用第二个Y轴（湿度轴）
      data: [] // 湿度数据，初始化为空数组
    }
  ]
});

// 获取新数据的函数
const fetchData = async () => {
  try {
    const response = await apiClient.get(`/api/data/farmland/${props.farmlandId}/latest`);
    const newDataPoint = response.data;

    if (newDataPoint) {
      const time = new Date(newDataPoint.timestamp).toLocaleTimeString();
      
      // 为了让图表平滑滚动，保持一个固定的数据点数量（例如20个）
      if (chartOption.xAxis.data.length >= 20) {
        chartOption.xAxis.data.shift(); // 移除最早的时间点
        chartOption.series[0].data.shift(); // 移除最早的温度数据
        chartOption.series[1].data.shift(); // 移除最早的湿度数据
      }

      // 添加新的数据点
      chartOption.xAxis.data.push(time);
      chartOption.series[0].data.push(newDataPoint.temperature);
      chartOption.series[1].data.push(newDataPoint.humidity);
    }
  } catch (error) {
    console.error("获取最新数据失败:", error);
    if (intervalId) clearInterval(intervalId); // 如果出错则停止轮询
  }
};

// 在组件挂载时，立即获取一次数据，然后设置定时器每10秒获取一次
onMounted(() => {
  fetchData();
  intervalId = setInterval(fetchData, 10000);
});

// 在组件卸载时，清除定时器，避免内存泄漏
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.chart {
  height: 300px;
}
</style>