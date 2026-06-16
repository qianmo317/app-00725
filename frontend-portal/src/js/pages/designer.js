// ==========================================
// 低代码设计器 - 页面逻辑
// ==========================================

// 页面状态
const state = {
  editor: null,
  zoom: 100,
  device: "desktop",
};

// 初始化页面
function initPage() {
  console.log("[Designer] 初始化低代码设计器...");

  initGrapesJS();
  bindEvents();

  console.log("[Designer] 初始化完成");
}

// 初始化 GrapesJS 编辑器
function initGrapesJS() {
  state.editor = grapesjs.init({
    container: "#gjs",
    height: "600px",
    width: "100%",
    fromElement: false,
    storageManager: {
      type: "local",
      autosave: true,
      autoload: true,
      stepsBeforeSave: 1,
      id: "gjs-portal-",
    },
    deviceManager: {
      devices: [
        { name: "Desktop", width: "" },
        { name: "Tablet", width: "768px", widthMedia: "992px" },
        { name: "Mobile", width: "320px", widthMedia: "480px" },
      ],
    },
    panels: { defaults: [] },
    styleManager: {
      appendTo: "#styles-container",
      sectors: [
        {
          name: "尺寸",
          open: true,
          buildProps: [
            "width",
            "height",
            "min-width",
            "min-height",
            "max-width",
            "max-height",
            "padding",
            "margin",
          ],
        },
        {
          name: "排版",
          open: false,
          buildProps: [
            "font-family",
            "font-size",
            "font-weight",
            "letter-spacing",
            "color",
            "line-height",
            "text-align",
            "text-decoration",
            "text-shadow",
          ],
        },
        {
          name: "装饰",
          open: false,
          buildProps: [
            "background-color",
            "background",
            "border-radius",
            "border",
            "box-shadow",
          ],
        },
        {
          name: "布局",
          open: false,
          buildProps: [
            "display",
            "flex-direction",
            "justify-content",
            "align-items",
            "flex-wrap",
            "gap",
          ],
        },
        {
          name: "定位",
          open: false,
          buildProps: ["position", "top", "right", "bottom", "left", "z-index"],
        },
      ],
    },
    layerManager: {
      appendTo: "#layers-container",
    },
    blockManager: {
      appendTo: "#blocksContainer",
      blocks: [],
    },
    plugins: ["gjs-preset-webpage"],
    pluginsOpts: {
      "gjs-preset-webpage": {
        blocksBasicOpts: { flexGrid: true },
        navbarOpts: false,
        countdownOpts: false,
        formsOpts: false,
      },
    },
  });

  // 添加自定义组件块
  addCustomBlocks();

  // 设置默认内容
  setDefaultContent();

  // 监听组件选择
  state.editor.on("component:selected", (component) => {
    console.log("[Designer] 选中组件:", component.get("type"));
  });
}

// 添加自定义组件块
function addCustomBlocks() {
  const bm = state.editor.BlockManager;

  // 数据卡片
  bm.add("data-card", {
    label: "数据卡片",
    category: "数据组件",
    content: `
            <div class="data-card" style="background: #fff; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); padding: 20px; margin: 10px;">
                <div class="card-header" style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #333;">卡片标题</h3>
                    <span style="font-size: 12px; color: #999;">更新于刚刚</span>
                </div>
                <div class="card-body">
                    <div class="kpi-value" style="font-size: 36px; font-weight: 700; color: #1E9FFF;">1,234</div>
                    <div class="kpi-label" style="font-size: 14px; color: #666; margin-top: 8px;">指标名称</div>
                </div>
            </div>
        `,
    attributes: { class: "gjs-block-data-card" },
  });

  // 图表占位
  bm.add("chart-placeholder", {
    label: "图表区域",
    category: "数据组件",
    content: `
            <div class="chart-placeholder" style="background: #f5f5f5; border: 2px dashed #ddd; border-radius: 8px; padding: 40px; text-align: center; margin: 10px;">
                <i class="layui-icon layui-icon-chart" style="font-size: 48px; color: #999;"></i>
                <p style="color: #999; margin-top: 16px;">图表区域 - 请在卡片工厂配置</p>
            </div>
        `,
    attributes: { class: "gjs-block-chart" },
  });

  // 表格
  bm.add("data-table", {
    label: "数据表格",
    category: "数据组件",
    content: `
            <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 12px 16px; text-align: left; font-weight: 500; color: #333; border-bottom: 1px solid #e6e6e6;">列1</th>
                        <th style="padding: 12px 16px; text-align: left; font-weight: 500; color: #333; border-bottom: 1px solid #e6e6e6;">列2</th>
                        <th style="padding: 12px 16px; text-align: left; font-weight: 500; color: #333; border-bottom: 1px solid #e6e6e6;">列3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e6e6e6;">数据1</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e6e6e6;">数据2</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e6e6e6;">数据3</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e6e6e6;">数据4</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e6e6e6;">数据5</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #e6e6e6;">数据6</td>
                    </tr>
                </tbody>
            </table>
        `,
    attributes: { class: "gjs-block-table" },
  });

  // 按钮组
  bm.add("button-group", {
    label: "按钮组",
    category: "基础组件",
    content: `
            <div class="button-group" style="display: flex; gap: 8px; margin: 10px;">
                <button style="padding: 8px 20px; background: #1E9FFF; color: #fff; border: none; border-radius: 4px; cursor: pointer;">主要按钮</button>
                <button style="padding: 8px 20px; background: #fff; color: #1E9FFF; border: 1px solid #1E9FFF; border-radius: 4px; cursor: pointer;">次要按钮</button>
                <button style="padding: 8px 20px; background: #f5f5f5; color: #666; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">默认按钮</button>
            </div>
        `,
    attributes: { class: "gjs-block-buttons" },
  });

  // 表单
  bm.add("form-group", {
    label: "表单组",
    category: "表单组件",
    content: `
            <form style="background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); margin: 10px;">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px;">用户名</label>
                    <input type="text" placeholder="请输入用户名" style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px;">密码</label>
                    <input type="password" placeholder="请输入密码" style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                </div>
                <button type="submit" style="width: 100%; padding: 12px; background: #1E9FFF; color: #fff; border: none; border-radius: 4px; font-size: 14px; cursor: pointer;">提交</button>
            </form>
        `,
    attributes: { class: "gjs-block-form" },
  });

  // 导航栏
  bm.add("navbar", {
    label: "导航栏",
    category: "布局组件",
    content: `
            <nav style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; background: #1E9FFF; color: #fff;">
                <div class="logo" style="font-size: 20px; font-weight: 600;">Logo</div>
                <ul style="display: flex; list-style: none; gap: 24px; margin: 0; padding: 0;">
                    <li><a href="#" style="color: #fff; text-decoration: none;">首页</a></li>
                    <li><a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none;">产品</a></li>
                    <li><a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none;">关于</a></li>
                    <li><a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none;">联系</a></li>
                </ul>
            </nav>
        `,
    attributes: { class: "gjs-block-navbar" },
  });
}

// 设置默认内容
function setDefaultContent() {
  const defaultContent = `
        <div style="padding: 24px; min-height: 100%;">
            <header style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 28px; color: #333; margin-bottom: 8px;">欢迎使用低代码设计器</h1>
                <p style="font-size: 14px; color: #666;">拖拽左侧组件到画布，开始构建您的页面</p>
            </header>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); padding: 20px;">
                    <h3 style="font-size: 16px; color: #333; margin-bottom: 12px;">卡片示例 1</h3>
                    <p style="font-size: 14px; color: #666; line-height: 1.6;">这是一个示例卡片，您可以编辑或删除它。</p>
                </div>
                <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); padding: 20px;">
                    <h3 style="font-size: 16px; color: #333; margin-bottom: 12px;">卡片示例 2</h3>
                    <p style="font-size: 14px; color: #666; line-height: 1.6;">这是一个示例卡片，您可以编辑或删除它。</p>
                </div>
                <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); padding: 20px;">
                    <h3 style="font-size: 16px; color: #333; margin-bottom: 12px;">卡片示例 3</h3>
                    <p style="font-size: 14px; color: #666; line-height: 1.6;">这是一个示例卡片，您可以编辑或删除它。</p>
                </div>
            </div>
        </div>
    `;

  // 只在没有保存内容时设置默认内容
  if (!localStorage.getItem("gjs-portal-html")) {
    state.editor.setComponents(defaultContent);
  }
}

// 绑定事件
function bindEvents() {
  // 移动端菜单切换
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const headerNav = document.getElementById("headerNav");

  if (mobileMenuBtn && headerNav) {
    mobileMenuBtn.addEventListener("click", () => {
      headerNav.classList.toggle("show");
      const icon = mobileMenuBtn.querySelector("i");
      if (headerNav.classList.contains("show")) {
        icon.className = "layui-icon layui-icon-close";
      } else {
        icon.className = "layui-icon layui-icon-spread-left";
      }
    });
  }

  // 导航菜单
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      // 关闭移动端菜单
      if (window.innerWidth <= 768 && headerNav) {
        headerNav.classList.remove("show");
        if (mobileMenuBtn) {
          mobileMenuBtn.querySelector("i").className =
            "layui-icon layui-icon-spread-left";
        }
      }

      const page = item.dataset.page;
      const pageMap = {
        home: "../index.html",
        "card-factory": "card-factory.html",
        "app-market": "app-market.html",
        designer: "designer.html",
        map: "map.html",
      };
      if (pageMap[page]) {
        window.location.href = pageMap[page];
      }
    });
  });

  // 撤销
  document.getElementById("undoBtn").addEventListener("click", () => {
    state.editor.UndoManager.undo();
  });

  // 重做
  document.getElementById("redoBtn").addEventListener("click", () => {
    state.editor.UndoManager.redo();
  });

  // 预览
  document.getElementById("previewBtn").addEventListener("click", openPreview);

  // 保存
  document.getElementById("saveBtn").addEventListener("click", saveDesign);

  // 导出
  document.getElementById("exportBtn").addEventListener("click", exportDesign);

  // 设备切换
  document.querySelectorAll(".device-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".device-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const device = btn.dataset.device;
      state.device = device;

      const deviceMap = {
        desktop: "Desktop",
        tablet: "Tablet",
        mobile: "Mobile",
      };

      state.editor.setDevice(deviceMap[device]);
    });
  });

  // 缩放
  document.getElementById("zoomIn").addEventListener("click", () => {
    if (state.zoom < 200) {
      state.zoom += 10;
      updateZoom();
    }
  });

  document.getElementById("zoomOut").addEventListener("click", () => {
    if (state.zoom > 50) {
      state.zoom -= 10;
      updateZoom();
    }
  });

  // 属性面板标签切换
  document.querySelectorAll(".property-panel .tab-item").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".property-panel .tab-item")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".property-panel .tab-content")
        .forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      const tabId = tab.dataset.tab + "Panel";
      document.getElementById(tabId).classList.add("active");
    });
  });

  // 关闭预览弹窗
  document
    .getElementById("closePreviewModal")
    .addEventListener("click", closePreview);
  document.getElementById("previewModal").addEventListener("click", (e) => {
    if (e.target.id === "previewModal") closePreview();
  });
}

// 更新缩放
function updateZoom() {
  document.getElementById("zoomValue").textContent = state.zoom + "%";
  const canvas = state.editor.Canvas.getFrameEl();
  if (canvas) {
    canvas.style.transform = `scale(${state.zoom / 100})`;
    canvas.style.transformOrigin = "top left";
  }
}

// 打开预览
function openPreview() {
  const html = state.editor.getHtml();
  const css = state.editor.getCss();

  const previewContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                ${css}
            </style>
        </head>
        <body>
            ${html}
        </body>
        </html>
    `;

  const iframe = document.getElementById("previewFrame");
  iframe.srcdoc = previewContent;

  document.getElementById("previewModal").style.display = "flex";
}

// 关闭预览
function closePreview() {
  document.getElementById("previewModal").style.display = "none";
}

// 保存设计
function saveDesign() {
  state.editor.store();

  layui.layer.msg("设计已保存", { icon: 1, time: 2000 });
}

// 导出设计
function exportDesign() {
  const html = state.editor.getHtml();
  const css = state.editor.getCss();

  const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>导出页面</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        ${css}
    </style>
</head>
<body>
    ${html}
</body>
</html>
    `.trim();

  // 创建下载
  const blob = new Blob([fullHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "exported-page.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  layui.layer.msg("页面已导出", { icon: 1, time: 2000 });
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  layui.use(["layer"], () => {
    initPage();
  });
});
