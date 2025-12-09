# 网络连接故障排除指南

## 当前状态

✅ **DNS**: 可以解析 `generativelanguage.googleapis.com`  
❌ **TCP**: 无法连接到 Google 服务器（防火墙/代理阻止）  
❌ **Gemini API**: 由于 TCP 连接失败而无法使用  
✅ **Mock 模式**: 正常工作（备用方案）

## 问题分析

您的系统网络配置阻止了对外出连接到 Google 服务器：
- DNS 正常工作（能解析 IP 地址）
- 但 TCP 端口 443 的连接被拒绝

这通常由以下原因引起：
1. **企业级防火墙** - 阻止未授权的出站连接
2. **代理服务器** - 需要通过代理才能访问外部 API
3. **本地防火墙** - Windows 防火墙或第三方安全软件

## 解决方案

### 方案 1: 使用企业代理（如适用）

如果您在公司网络上，可能需要通过代理访问 Google API。

**步骤：**

1. 打开 `.env` 文件
2. 添加以下行：
```
HTTPS_PROXY=http://proxy.company.com:8080
HTTP_PROXY=http://proxy.company.com:8080
```
3. 将 `proxy.company.com:8080` 替换为您公司的代理地址和端口
4. 重启后端服务器

**如何找到公司代理地址：**
- 在 Windows 设置中：`设置 > 网络和 Internet > 代理 > 手动代理设置`
- 或询问您的 IT 部门

### 方案 2: 调整 Windows 防火墙

如果您有管理员权限：

**步骤：**

1. 打开 Windows Defender 防火墙
2. 点击"允许应用通过防火墙"
3. 找到 Node.js 或您的应用
4. 确保 "出站" 规则已启用

### 方案 3: 继续使用 Mock 模式

如果网络限制无法解决，系统已配置为自动使用 Mock 模式：

- ✅ "问 AI" 功能正常工作
- ✅ 返回预定义的演示响应
- ⚠️ 无法获得真实的 Gemini 回答

**Mock 模式支持的问题：**
- "你好" → 中文问候
- "2+2" 或 "what is 2+2" → 数学答案
- "paris" 或 "capital of france" → 地理问题
- 其他问题 → 返回一般性演示响应

### 方案 4: 完全禁用 SSL 验证（仅用于开发）

**警告：** 这只应在开发环境中使用，生产环境不安全。

在启动后端前，设置环境变量：

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npm run server
```

### 方案 5: 检查诊断信息

访问 `http://localhost:4000/api/diagnose` 查看详细的网络诊断报告。

## 测试网络连接

### 手动测试 DNS 解析

```powershell
# 在 PowerShell 中
[System.Net.Dns]::GetHostAddresses("generativelanguage.googleapis.com")
```

### 手动测试 TCP 连接

```powershell
# 在 PowerShell 中
Test-NetConnection -ComputerName generativelanguage.googleapis.com -Port 443
```

如果返回 `TcpTestSucceeded : True`，则连接成功。

### 验证 API 密钥

确保 `.env` 文件中的 API 密钥有效。您可以在 Google Cloud 控制台中验证密钥。

## 当前实现

### 后端行为

1. **尝试连接到真实 Gemini API** - 使用您的 API 密钥
2. **如果失败** - 自动回退到 Mock 模式
3. **前端始终收到有效响应** - 无论是真实 AI 还是 Demo

### 前端行为

- 用户无法区分真实响应和 Mock 响应
- 如果 `response.isMock === true`，表示使用了 Demo 模式

## 推荐步骤

1. **立即：** 系统已完全可用（Mock 模式）
2. **如果需要真实 AI：** 
   - 检查防火墙设置
   - 如果在公司网络上，配置代理地址
   - 运行诊断端点验证网络连接
3. **长期：** 
   - 生产部署时考虑使用 VPN 或专用网络
   - 或在能访问 Google API 的服务器上运行后端

## 联系支持

如果您在配置代理或排除故障时遇到问题：
- 咨询您的网络管理员/IT 部门
- 检查公司网络政策
- 考虑在允许出站访问的环境中测试
