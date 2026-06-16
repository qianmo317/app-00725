// ==========================================
// 地图服务 - 页面逻辑 (使用 OpenLayers)
// ==========================================

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat, toLonLat } from "ol/proj";
import { Style, Circle, Fill, Stroke, Text } from "ol/style";

// 地图数据
const mapData = {
  points: [
    {
      id: 1,
      name: "北京总部",
      lng: 116.407526,
      lat: 39.90403,
      value: 1200,
      level: "high",
    },
    {
      id: 2,
      name: "上海分公司",
      lng: 121.473701,
      lat: 31.230416,
      value: 800,
      level: "medium",
    },
    {
      id: 3,
      name: "广州分公司",
      lng: 113.264385,
      lat: 23.129112,
      value: 650,
      level: "medium",
    },
    {
      id: 4,
      name: "深圳分公司",
      lng: 114.057868,
      lat: 22.543099,
      value: 720,
      level: "medium",
    },
    {
      id: 5,
      name: "成都分公司",
      lng: 104.065735,
      lat: 30.659462,
      value: 450,
      level: "low",
    },
    {
      id: 6,
      name: "武汉分公司",
      lng: 114.298572,
      lat: 30.584355,
      value: 380,
      level: "low",
    },
  ],
  regions: [
    { name: "华北区", value: 2500, percent: 100 },
    { name: "华东区", value: 3200, percent: 80 },
    { name: "华南区", value: 2800, percent: 70 },
    { name: "西南区", value: 1500, percent: 47 },
    { name: "华中区", value: 1200, percent: 38 },
  ],
};

// 页面状态
const state = {
  map: null,
  vectorLayer: null,
  selectedPoint: null,
  trendChart: null,
  currentStyle: "standard",
};

// 地图图层配置 - 使用国内可访问的瓦片服务
const tileLayers = {
  standard: new TileLayer({
    source: new XYZ({
      url: "https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      maxZoom: 18,
    }),
  }),
  satellite: new TileLayer({
    source: new XYZ({
      url: "https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      maxZoom: 18,
    }),
  }),
  dark: new TileLayer({
    source: new XYZ({
      url: "https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      maxZoom: 18,
    }),
  }),
};

// 初始化页面
function initPage() {
  console.log("[Map] 初始化地图服务...");

  renderLocationList();
  renderRegionStats();
  initMap();
  bindEvents();

  console.log("[Map] 初始化完成");
}

// 渲染位置列表
function renderLocationList() {
  const container = document.getElementById("locationList");

  container.innerHTML = mapData.points
    .map(
      (point) => `
        <div class="location-item" data-id="${point.id}">
            <span class="location-marker ${point.level}"></span>
            <div class="location-info">
                <div class="location-name">${point.name}</div>
                <div class="location-value">业务量: ${point.value}</div>
            </div>
        </div>
    `,
    )
    .join("");

  // 绑定点击事件
  container.querySelectorAll(".location-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = parseInt(item.dataset.id);
      const point = mapData.points.find((p) => p.id === id);
      if (point) {
        selectPoint(point);
        flyToPoint(point);
        container
          .querySelectorAll(".location-item")
          .forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
      }
    });
  });
}

// 渲染区域统计
function renderRegionStats() {
  const container = document.getElementById("regionStats");

  container.innerHTML = mapData.regions
    .map(
      (region) => `
        <div class="region-item">
            <span class="region-name">${region.name}</span>
            <div class="region-bar">
                <div class="bar-fill" style="width: ${region.percent}%"></div>
            </div>
            <span class="region-value">${region.value}</span>
        </div>
    `,
    )
    .join("");
}

// 获取标记点样式
function getPointStyle(point, isSelected = false) {
  const colorMap = {
    high: "#FF5722",
    medium: "#FFB800",
    low: "#5FB878",
  };
  const color = colorMap[point.level] || "#1E9FFF";
  const radius = isSelected
    ? 14
    : point.level === "high"
      ? 12
      : point.level === "medium"
        ? 10
        : 8;

  return new Style({
    image: new Circle({
      radius: radius,
      fill: new Fill({ color: color }),
      stroke: new Stroke({ color: "#fff", width: 2 }),
    }),
    text: new Text({
      text: point.name,
      offsetY: -20,
      font: "12px sans-serif",
      fill: new Fill({ color: "#333" }),
      stroke: new Stroke({ color: "#fff", width: 3 }),
    }),
  });
}

// 初始化地图
function initMap() {
  // 创建标记点要素
  const features = mapData.points.map((point) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([point.lng, point.lat])),
      pointData: point,
    });
    feature.setStyle(getPointStyle(point));
    return feature;
  });

  // 创建矢量图层
  const vectorSource = new VectorSource({ features });
  state.vectorLayer = new VectorLayer({ source: vectorSource });

  // 创建地图
  state.map = new Map({
    target: "map",
    layers: [tileLayers.standard, state.vectorLayer],
    view: new View({
      center: fromLonLat([108.0, 34.0]), // 中国中心
      zoom: 4.5,
      minZoom: 3,
      maxZoom: 18,
    }),
  });

  // 点击事件
  state.map.on("click", (evt) => {
    const feature = state.map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (feature) {
      const point = feature.get("pointData");
      if (point) {
        selectPoint(point);
        updateSelectedFeatureStyle(point.id);
        document.querySelectorAll(".location-item").forEach((item) => {
          item.classList.toggle(
            "active",
            parseInt(item.dataset.id) === point.id,
          );
        });
      }
    }
  });

  // 鼠标悬停样式
  state.map.on("pointermove", (evt) => {
    const hit = state.map.hasFeatureAtPixel(evt.pixel);
    state.map.getTargetElement().style.cursor = hit ? "pointer" : "";
  });
}

// 更新选中要素样式
function updateSelectedFeatureStyle(selectedId) {
  state.vectorLayer
    .getSource()
    .getFeatures()
    .forEach((feature) => {
      const point = feature.get("pointData");
      feature.setStyle(getPointStyle(point, point.id === selectedId));
    });
}

// 飞行到指定点
function flyToPoint(point) {
  state.map.getView().animate({
    center: fromLonLat([point.lng, point.lat]),
    zoom: 8,
    duration: 800,
  });
}

// 选择标记点
function selectPoint(point) {
  state.selectedPoint = point;

  document.querySelector(".info-placeholder").style.display = "none";
  document.getElementById("infoContent").style.display = "block";

  document.getElementById("infoName").textContent = point.name;
  document.getElementById("infoBadge").textContent =
    point.level === "high"
      ? "高业务量"
      : point.level === "medium"
        ? "中业务量"
        : "低业务量";
  document.getElementById("infoBadge").className = `info-badge ${point.level}`;
  document.getElementById("infoValue").textContent = point.value;
  document.getElementById("infoRank").textContent =
    "#" + (mapData.points.findIndex((p) => p.id === point.id) + 1);

  renderTrendChart();
}

// 渲染趋势图
function renderTrendChart() {
  const container = document.getElementById("infoTrendChart");

  if (state.trendChart) {
    state.trendChart.dispose();
  }

  state.trendChart = echarts.init(container);

  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const baseValue = state.selectedPoint?.value || 500;
  const data = days.map(() =>
    Math.floor(baseValue * (0.8 + Math.random() * 0.4)),
  );

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e6e6e6",
      borderWidth: 1,
      textStyle: { color: "#333" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: days,
      axisLine: { lineStyle: { color: "#e6e6e6" } },
      axisLabel: { color: "#999", fontSize: 10 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
      axisLabel: { color: "#999", fontSize: 10 },
    },
    series: [
      {
        data: data,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#1E9FFF", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(30, 159, 255, 0.3)" },
              { offset: 1, color: "rgba(30, 159, 255, 0.05)" },
            ],
          },
        },
        itemStyle: { color: "#1E9FFF" },
      },
    ],
  };

  state.trendChart.setOption(option);
}

// 切换地图样式
function switchMapStyle(style) {
  if (state.currentStyle === style) return;

  // 移除当前底图
  state.map.getLayers().removeAt(0);
  // 添加新底图
  state.map.getLayers().insertAt(0, tileLayers[style]);
  state.currentStyle = style;
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
      icon.className = headerNav.classList.contains("show")
        ? "layui-icon layui-icon-close"
        : "layui-icon layui-icon-spread-left";
    });
  }

  // 导航菜单
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
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
      if (pageMap[page]) window.location.href = pageMap[page];
    });
  });

  // 地图样式切换
  document.querySelectorAll(".style-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".style-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      switchMapStyle(item.dataset.style);
    });
  });

  // 缩放控制
  document.getElementById("zoomIn").addEventListener("click", () => {
    const view = state.map.getView();
    view.animate({ zoom: view.getZoom() + 1, duration: 300 });
  });

  document.getElementById("zoomOut").addEventListener("click", () => {
    const view = state.map.getView();
    view.animate({ zoom: view.getZoom() - 1, duration: 300 });
  });

  document.getElementById("resetView").addEventListener("click", () => {
    state.map.getView().animate({
      center: fromLonLat([108.0, 34.0]),
      zoom: 4.5,
      duration: 500,
    });
  });

  document.getElementById("fullscreen").addEventListener("click", () => {
    const mapContainer = document.querySelector(".map-container");
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      mapContainer.requestFullscreen();
    }
  });

  // 关闭信息面板
  document.getElementById("closeInfoPanel").addEventListener("click", () => {
    document.querySelector(".info-placeholder").style.display = "block";
    document.getElementById("infoContent").style.display = "none";
    state.selectedPoint = null;
    updateSelectedFeatureStyle(null);
    document
      .querySelectorAll(".location-item")
      .forEach((item) => item.classList.remove("active"));
  });

  // 搜索
  document.getElementById("mapSearch").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const keyword = e.target.value.trim();
      if (keyword) {
        const point = mapData.points.find((p) => p.name.includes(keyword));
        if (point) {
          selectPoint(point);
          flyToPoint(point);
          updateSelectedFeatureStyle(point.id);
          document.querySelectorAll(".location-item").forEach((item) => {
            item.classList.toggle(
              "active",
              parseInt(item.dataset.id) === point.id,
            );
          });
          layui.layer.msg(`已定位到: ${point.name}`, { time: 2000 });
        } else {
          layui.layer.msg("未找到相关地点", { time: 2000 });
        }
      }
    }
  });

  // 窗口大小变化
  window.addEventListener("resize", () => {
    state.map?.updateSize();
    state.trendChart?.resize();
  });

  // 图层控制
  document
    .getElementById("layerPoints")
    ?.addEventListener("change", function () {
      state.vectorLayer.setVisible(this.checked);
    });

  document.getElementById("layerHeatmap")?.addEventListener("change", () => {
    layui.layer.msg("热力图功能开发中...", { icon: 0, time: 1500 });
  });

  document.getElementById("layerCluster")?.addEventListener("change", () => {
    layui.layer.msg("聚合显示功能开发中...", { icon: 0, time: 1500 });
  });

  // 信息面板按钮
  document
    .querySelector("#infoContent .info-actions")
    ?.addEventListener("click", (e) => {
      if (e.target.closest("button")) {
        layui.layer.msg("该功能开发中...", { icon: 0, time: 1500 });
      }
    });
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  layui.use(["layer", "form"], () => {
    layui.form.render();
    initPage();
  });
});
