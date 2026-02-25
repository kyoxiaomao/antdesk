# Deskant 桌面桌宠

基于 Electron + React 的桌面桌宠项目。窗口透明置顶、默认鼠标穿透，进入交互区时临时接管鼠标，从而保证不遮挡底部应用同时可点击控制中心与桌宠本体。

## 功能概览
- 透明无边框覆盖层窗口，系统托盘支持显示/隐藏与退出
- 桌宠“小蚁”在底部巡逻移动、触边掉头、悬停放大与呼吸动画
- 控制中心菜单：状态面板、速度调节、重置位置、退出应用
- IPC 最小闭环：退出、获取状态、重置窗口位置、切换鼠标穿透

## 项目结构
```
deskant/
├── public/
│   └── assets/                # 静态资源（桌宠图/动图）
├── src/
│   ├── main/                   # Electron 主进程
│   │   ├── main.js             # 窗口/托盘/IPC/穿透控制
│   │   └── preload.js          # 安全隔离与 API 暴露
│   └── renderer/               # React 渲染进程
│       ├── components/
│       │   ├── Ant.jsx         # 桌宠移动与交互
│       │   ├── ControlButton.jsx # 控制中心按钮与菜单开关
│       │   ├── MenuPanel.jsx   # 控制中心菜单
│       │   └── StatusPanel.jsx # 状态面板弹窗
│       ├── styles/
│       │   └── GlobalStyle.js  # 透明全局样式
│       ├── App.jsx             # 应用根组件与交互区管理
│       ├── env.js              # Electron API 访问
│       ├── global.d.ts         # window.deskant 类型声明
│       └── main.jsx            # React 入口
├── index.html                  # Vite 入口 HTML
├── vite.config.mjs             # Vite 配置
├── package.json                # 脚本与依赖
└── readme.md
```

## 核心代码说明

### 1) 透明覆盖层与默认穿透
- [main.js](file:///d:/deskant/src/main/main.js)
  - 使用 `screen.getPrimaryDisplay().workArea` 生成覆盖整个工作区的窗口 bounds。
  - 创建窗口后调用 `setIgnoreMouseEvents(true, { forward: true })`，默认鼠标穿透到底部应用。
  - `setIgnoreMouseEvents(false)` 用于进入交互区时临时接管鼠标。

### 2) IPC 与安全隔离
- [preload.js](file:///d:/deskant/src/main/preload.js)
  - 使用 `contextBridge.exposeInMainWorld` 暴露最小 API：
    - `quitApp()` 退出应用
    - `getStatus()` 获取运行状态
    - `resetWindowPosition()` 重置窗口位置/尺寸
    - `setIgnoreMouseEvents(ignore)` 切换鼠标穿透
- [global.d.ts](file:///d:/deskant/src/renderer/global.d.ts)
  - 为 `window.deskant` 提供类型声明，便于渲染层调用。

### 3) 交互区探测与穿透切换
- [App.jsx](file:///d:/deskant/src/renderer/App.jsx)
  - 监听 `mousemove` 并通过 `elementFromPoint` 判断是否命中交互区。
  - 交互区用 `data-interactive` 标记（桌宠、控制中心、菜单）。
  - 命中交互区时 `setIgnoreMouseEvents(false)`，离开后自动恢复穿透。
  - 控制中心菜单或状态面板打开时，强制保持接管，避免无法点击。

### 4) 桌宠移动与交互
- [Ant.jsx](file:///d:/deskant/src/renderer/components/Ant.jsx)
  - 使用 `requestAnimationFrame` 按速度更新 `x` 坐标。
  - 触边反向、方向翻转、悬停放大、闲置呼吸动画。
  - 点击触发抖动小动画。

### 5) 控制中心菜单与状态面板
- [ControlButton.jsx](file:///d:/deskant/src/renderer/components/ControlButton.jsx)
  - 点击按钮切换菜单 open 状态，点击外部关闭。
  - 打开状态面板时保持交互接管。
- [MenuPanel.jsx](file:///d:/deskant/src/renderer/components/MenuPanel.jsx)
  - 速度滑条、重置、退出等操作。
- [StatusPanel.jsx](file:///d:/deskant/src/renderer/components/StatusPanel.jsx)
  - 调用 `getStatus` 并展示 Electron/Node/平台信息。

## 运行与构建

安装依赖：
```powershell
cd d:\deskant
npm install
```

开发启动：
```powershell
npm run dev
```

构建渲染层：
```powershell
npm run build
```

打包（可选）：
```powershell
npm run dist
```

## 交互说明
- 默认鼠标穿透，不遮挡底部应用
- 鼠标移入桌宠或控制中心时自动接管，可点击按钮/菜单
- 菜单点击打开，点击外部关闭

## 资源替换
- 将新的 PNG/GIF 放入 `public/assets/`
- 在 [Ant.jsx](file:///d:/deskant/src/renderer/components/Ant.jsx) 中替换资源路径

