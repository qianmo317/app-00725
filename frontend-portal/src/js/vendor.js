// ==========================================
// 第三方库统一导入
// ==========================================

// 导入 layui
import "layui";

// 导入 echarts
import * as echarts from "echarts";
window.echarts = echarts;

// 导入 sortablejs
import Sortable from "sortablejs";
window.Sortable = Sortable;

// 导出供其他模块使用
export { echarts, Sortable };
