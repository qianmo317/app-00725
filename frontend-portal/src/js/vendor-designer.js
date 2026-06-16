// ==========================================
// 设计器页面 - 第三方库统一导入
// ==========================================

// 导入 layui
import "layui";

// 导入 grapesjs
import grapesjs from "grapesjs";
import gjsPresetWebpage from "grapesjs-preset-webpage";

window.grapesjs = grapesjs;
window["gjs-preset-webpage"] = gjsPresetWebpage;

// 导出供其他模块使用
export { grapesjs, gjsPresetWebpage };
