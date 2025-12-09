# 项目启动指南

## 项目概述

这是一个支持 AI 对话功能的 React 网页应用，采用**前后端分离架构**来安全保护 Gemini API 密钥。

## 当前状态

### ✅ 已实现功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 前端应用 | ✅ 运行中 | React + TypeScript on Vite (port 3000) |
| 后端代理 | ✅ 运行中 | Express.js (port 4000) |
| API 密钥保护 | ✅ 安全 | 存储在后端 `.env`，不暴露给浏览器 |
| "问 AI" 功能 | ✅ 可用 | Mock 模式正常工作 |
| 网络诊断 | ✅ 可用 | `GET /api/diagnose` 端点 |

### ⚠️ 已知限制

| 功能 | 原因 | 影响 |
|------|------|------|
| 真实 Gemini API | 防火墙阻止出站连接 | 回退到 Mock 模式 |
| 实时 AI 响应 | 网络限制 | 使用预定义的演示回答 |

## 快速启动

### 1. 安装依赖（首次运行）

```bash
npm install
```

### 2. 启动前端服务器

```bash
npm run dev
```

输出：
```
VITE v6.4.1  ready in XXX ms
  ➜  Local:   http://localhost:3000/
```

### 3. 启动后端服务器（新终端）

```bash
npm run server
```

输出：
```
Backend proxy listening on http://localhost:4000
```

### 4. 打开浏览器

访问 `http://localhost:3000`

## 使用"问 AI"功能

1. 点击页面上的 **"问 AI"** 按钮
2. 输入任何问题，例如：
   - "你好"
   - "2+2 等于多少?"
   - "Paris 是哪个国家的首都?"
3. 点击提交或按 Enter
4. 系统会返回演示回答（当前使用 Mock 模式）

## 架构说明

```
浏览器 (localhost:3000)
    ↓
前端 React 应用
    ↓
CORS 请求到 http://localhost:4000
    ↓
后端 Express 代理
    ↓
Gemini API (generativelanguage.googleapis.com)
    ↓
返回 AI 响应或 Mock 回答（当连接失败时）
```

### 为什么要前后端分离？

✅ **安全性**：API 密钥存在服务器端，浏览器无法访问  
✅ **隐私**：用户请求不会直接暴露给 Google  
✅ **灵活性**：可以添加请求日志、速率限制等功能  
✅ **可靠性**：失败时自动回退到 Mock 模式

## 文件结构

```
.
├── package.json              # 项目配置和脚本
├── .env                      # 环境变量（包含 API 密钥）
├── .gitignore                # Git 排除配置
├── vite.config.ts            # Vite 构建配置
├── tsconfig.json             # TypeScript 配置
├── server/
│   └── index.js              # Express 后端服务器
├── src/
│   ├── App.tsx               # 主 React 组件
│   ├── index.tsx             # 入口文件
│   ├── services/
│   │   └── geminiService.ts  # AI 服务（发送请求到后端）
│   └── components/
│       ├── ChatInterface.tsx  # 对话界面组件
│       ├── SearchBar.tsx      # 搜索栏
│       └── ...
└── NETWORK_TROUBLESHOOTING.md # 网络问题排除指南
```

## 环境变量配置

编辑 `.env` 文件：

```env
# 必需：Gemini API 密钥
GEMINI_API_KEY=your_api_key_here

# 可选：后端端口（默认 4000）
PORT=4000

# 可选：如果需要使用代理
# HTTPS_PROXY=http://proxy.company.com:8080
# HTTP_PROXY=http://proxy.company.com:8080
```

## API 端点

### 1. 生成内容

```
POST /api/gemini/generate
Content-Type: application/json

{
  "prompt": "你好"
}

响应：
{
  "text": "你好！很高兴认识你。...",
  "isMock": true,  // 如果为 true 表示使用了 Demo 模式
  "isReal": false  // 如果为 true 表示是真实 Gemini 响应
}
```

### 2. 对话模式

```
POST /api/gemini/chat
Content-Type: application/json

{
  "history": [
    { "role": "user", "text": "你好" },
    { "role": "model", "text": "你好！..." }
  ]
}
```

### 3. 网络诊断

```
GET /api/diagnose

响应：
{
  "timestamp": "2025-12-09T10:09:34.154Z",
  "hasApiKey": true,
  "nodeVersion": "24.11.1",
  "proxyConfigured": false,
  "networkTests": {
    "dns": { "success": true, "addresses": [...] },
    "tcp": { "success": false, "error": "TCP timeout" },
    "apiCall": { "success": false, "error": "Request timeout" }
  },
  "solutions": [...]
}
```

访问 `http://localhost:4000/api/diagnose` 查看诊断报告。

## 故障排除

### 问题：前端无法连接到后端

**解决方案：**
1. 确认后端运行：`curl http://localhost:4000/`
2. 确认前端 CORS 配置正确
3. 检查防火墙是否阻止 localhost 连接

### 问题：Gemini API 返回错误

**解决方案：**
1. 访问 `http://localhost:4000/api/diagnose` 查看诊断
2. 查看 `NETWORK_TROUBLESHOOTING.md` 了解网络配置
3. 如果是代理问题，配置 `HTTPS_PROXY` 环境变量

### 问题：API 密钥无效

**解决方案：**
1. 在 Google Cloud Console 验证密钥
2. 确保密钥在 `.env` 中正确设置
3. 重启后端服务器

## 部署指南

### 本地开发

```bash
# 终端 1
npm run dev

# 终端 2
npm run server
```

### 生产构建

```bash
# 构建前端
npm run build

# 前端会输出到 dist/ 目录
# 后端可以通过以下方式提供前端文件：

# 修改 server/index.js 添加：
# app.use(express.static('../dist'));
```

## 性能考虑

- 前端使用 Vite，支持快速刷新和热模块更新
- 后端使用 Express，轻量级但适合小型应用
- 建议生产环境使用 PM2 或 Docker 管理进程

## 后续改进建议

- [ ] 添加用户认证
- [ ] 实现对话历史存储（数据库）
- [ ] 添加速率限制防止 API 滥用
- [ ] 改进错误处理和日志记录
- [ ] 添加单元测试和集成测试
- [ ] 配置 SSL/TLS 用于生产环境

## 许可证

项目配置见 `package.json`
