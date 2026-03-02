# ScaleBox 销售助手 - 部署文档

本文档说明如何在不同环境下构建、配置与运行 ScaleBox 销售助手的前端与后端，以及数据库与外部依赖的准备工作。

---

## 1. 部署架构概览

- **前端**：Expo 应用，可构建为 Web 静态资源（Metro `output: "static"`）或 iOS/Android 原生包（EAS Build / 本地构建）。  
- **后端**：Node.js 单体服务，入口为 `server/_core/index.ts`，生产使用 `dist/index.js`（esbuild 打包）。  
- **持久化**：无数据库；知识库使用本地目录 `.storage/`（JSON 元数据 + 文件）。  
- **外部依赖**：仅 LLM 必配（`LLM_API_URL` / `LLM_API_KEY`）；语音/图像为可选。

当前仓库内**无** Dockerfile、docker-compose 或 Kubernetes 清单；若需容器化或 K8s 部署，需自行添加。

---

## 2. 环境与依赖

### 2.1 运行环境

- **Node.js**：建议 18+（与 package.json 中 pnpm/TS 等兼容）。  
- **包管理**：pnpm 9.x（`packageManager: "pnpm@9.12.0"`）。  
- 无需 MySQL；知识库数据存于项目目录 `.storage/`。

### 2.2 安装依赖

```bash
pnpm install
```

---

## 3. 环境变量配置

### 3.1 服务端变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `PORT` | HTTP 监听端口 | `3000` |
| `LLM_API_URL` | LLM API 基地址（OpenAI 兼容） | 未设置时默认 `https://api.openai.com` |
| `LLM_API_KEY` | LLM API Key（必填，否则 AI 生成报错） | - |
| `VOICE_API_URL` / `VOICE_API_KEY` | 语音转写（可选） | - |
| `IMAGE_API_URL` / `IMAGE_API_KEY` | 图像生成（可选） | - |
| `NODE_ENV` | `production` 时部分行为不同 | - |

### 3.2 前端 / Expo 构建时变量

| 变量 | 说明 |
|------|------|
| `EXPO_PUBLIC_API_BASE_URL` | 后端 API 基地址（用户浏览器/App 可访问） |

说明：

- **Web**：`EXPO_PUBLIC_API_BASE_URL` 需与用户访问的 API 一致（含协议、域名、端口）。若前端与 API 同域不同端口，可配合 `constants/oauth.ts` 中 `getApiBaseUrl()` 的 hostname 替换逻辑（8081 → 3000）使用。  
- **Native**：必须配置为设备可访问的 API 地址（如公网域名或内网 IP+端口）。

---

## 4. 本地存储

知识库数据与上传文件存放在项目目录 `.storage/` 下（已加入 `.gitignore`），无需数据库或迁移。首次上传文档时会自动创建目录。

---

## 5. 后端构建与运行

### 5.1 开发模式

```bash
pnpm dev:server
```

使用 `tsx watch server/_core/index.ts`，修改后自动重启；默认 `NODE_ENV=development`，端口由 `PORT` 或 3000 起探测。

### 5.2 生产构建

```bash
pnpm build
```

使用 esbuild 将 `server/_core/index.ts` 打包为 ESM，输出到 `dist/index.js`，node_modules 以 external 方式不打包。

### 5.3 生产运行

```bash
NODE_ENV=production node dist/index.js
```

或使用项目脚本：

```bash
pnpm start
```

需在运行前设置好所有服务端环境变量；服务监听 `PORT`（默认 3000），提供：

- `GET /api/health` — 健康检查  
- `GET /api/auth/me`、`POST /api/auth/logout` — 无认证桩接口（返回 null / success）  
- `POST /api/trpc/*` — tRPC 接口  

建议使用进程管理器（如 systemd、PM2）或容器保证常驻与重启。

---

## 6. 前端构建与运行

### 6.1 本地开发（Web）

同时启动后端与 Metro（Expo Web）：

```bash
pnpm dev
```

后端默认 3000，前端默认 8081（`EXPO_PORT` 可改）。浏览器访问 Metro 提供的 Web 地址；需保证 `EXPO_PUBLIC_API_BASE_URL` 或 getApiBaseUrl() 解析出的地址可访问后端。

### 6.2 仅启动 Web 前端

```bash
pnpm dev:metro
```

适用于后端已在其他终端或远程运行的情况。

### 6.3 Web 静态构建

Expo 配置中 `web.output: "static"`，可生成静态资源用于托管：

```bash
npx expo export --platform web
```

输出目录一般为 `dist/` 或项目配置的 web 输出路径，可部署到任意静态托管（Nginx、CDN、对象存储等）。部署后需确保：

- 静态资源与 API 的跨域/CORS 配置正确；  
- 前端请求的 API 基地址（`EXPO_PUBLIC_API_BASE_URL` 或 getApiBaseUrl 逻辑）指向真实后端。

### 6.4 iOS / Android 构建

- **EAS Build（推荐）**：在项目根目录配置 `eas.json` 后执行 `eas build --platform ios` 或 `--platform android`。构建时在 EAS 中配置上述 `EXPO_PUBLIC_*` 环境变量。  
- **本地构建**：可参考 Expo 文档使用 `expo run:ios` / `expo run:android`，需安装 Xcode / Android Studio 及对应环境。

Native 构建前请确认：

- `app.config.ts` 中 scheme、bundleId/package 与深度链接一致（当前无 OAuth）；  
- `EXPO_PUBLIC_API_BASE_URL` 为设备可访问的后端地址。

---

## 7. 生产部署建议

### 7.1 后端

1. **进程管理**：使用 PM2 或 systemd 运行 `node dist/index.js`，设置 `NODE_ENV=production` 和所有必需环境变量。  
2. **反向代理**：使用 Nginx 或云负载均衡将 HTTPS 终结到后端（如 `proxy_pass http://127.0.0.1:3000`），并配置正确的 Host/Forwarded 头。  
3. **健康检查**：对 `GET /api/health` 做探活，返回 200 且 `ok: true` 即视为正常。  
4. **日志与监控**：将 stdout/stderr 接入日志系统；按需监控端口、内存与 tRPC 错误率。

### 7.2 前端 Web

1. 使用 `npx expo export --platform web` 生成静态资源。  
2. 将输出目录部署到 CDN 或 Web 服务器，配置 SPA 回退（如 Nginx `try_files` 指向 `index.html`）。  
3. 通过构建时或运行时注入 `EXPO_PUBLIC_API_BASE_URL` 等变量，确保与后端域名一致且支持 CORS。

### 7.3 本地存储

1. 生产环境可将 `.storage/` 挂载为持久卷，或定期备份该目录。  
2. 不在版本库中提交 `LLM_API_KEY` 等密钥；使用环境变量或密钥管理。

---

## 8. 可选：容器化示例

仓库当前无 Dockerfile，以下为最小示例，可按需调整。

### 8.1 后端 Dockerfile 示例

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

构建与运行前需在宿主机或编排系统中注入 `LLM_API_KEY` 等环境变量；无需数据库迁移。

### 8.2 前端 Web 构建示例

前端可单独构建为静态资源，用 Nginx 镜像托管：

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
ARG EXPO_PUBLIC_API_BASE_URL
ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL
RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# 可选：自定义 nginx.conf 做 SPA 回退与 API 代理
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 9. 故障排查

| 现象 | 可能原因 | 处理建议 |
|------|----------|----------|
| 后端启动报错 | 依赖缺失或端口占用 | 检查 `pnpm install`、`PORT` |
| 前端请求 API 404 / 跨域 | `EXPO_PUBLIC_API_BASE_URL` 错误或 CORS 未放行 | 核对 URL、后端 CORS 配置 |
| 知识库上传失败 | `.storage` 目录无写权限 | 检查进程用户与目录权限 |
| AI 生成无响应 | LLM 未配置或超时 | 设置 `LLM_API_KEY`（及可选 `LLM_API_URL`），查看服务端日志 |

---

## 10. 相关文档

- [架构文档](ARCHITECTURE.md)  
- [后端开发指南](server/README.md)  
- [产品设计](design.md)
