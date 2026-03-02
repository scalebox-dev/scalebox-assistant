# ScaleBox 销售助手 - 架构文档

## 1. 项目概述

**ScaleBox 销售助手**（ScaleBox Sales Agent）是一款面向 ScaleBox（www.scalebox.dev）销售团队的移动端销售助手应用。应用结合 AI 能力与知识库，为销售提供提示词模板、客户调研、邮件生成、产品推介等功能，支持 Web 与 iOS/Android 多端。

- **产品定位**：AI 驱动的销售工具，提升获客与成单效率  
- **技术形态**：Expo (React Native) 前端 + Node.js (Express + tRPC) 后端，单体仓库  
- **数据与集成**：无数据库（知识库用本地 JSON + 文件）、无认证、本地文件存储；LLM 使用通用 API（如 OpenAI 兼容）

---

## 2. 技术栈总览

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端** | TypeScript, React 19, Expo 54, Expo Router | 跨端（Web / iOS / Android） |
| **前端 UI** | NativeWind (Tailwind), React Navigation, React Query | 主题、路由、服务端状态 |
| **API 客户端** | tRPC v11 + React Query, superjson | 类型安全、批处理、序列化 |
| **后端** | Node.js, Express, tRPC v11 | HTTP 服务、tRPC 适配器 |
| **持久化** | 本地文件（.storage/） | 知识库元数据 JSON + 上传文件 |
| **认证** | 无 | 已移除 |
| **存储** | 本地磁盘（server/storage.ts） | 知识库文件，通过 /api/files 提供访问 |
| **AI/能力** | 通用 API（LLM_API_URL/KEY 等） | 对话（必配）、语音/图像（可选） |
| **构建** | esbuild（服务端）, Metro（前端）, pnpm | 单仓库脚本 |

---

## 3. 系统架构图（逻辑）

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     Client (Expo)                        │
                    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
                    │  │   Tabs      │  │  OAuth      │  │  ThemeProvider  │  │
                    │  │ Home/Library│  │  Callback   │  │  SafeArea       │  │
                    │  │ Generate/   │  │  Deep Link  │  │  Manus Runtime  │  │
                    │  │ Knowledge/  │  │             │  │                 │  │
                    │  │ Product     │  │             │  │                 │  │
                    │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
                    │         │                │                   │           │
                    │         └────────────────┼───────────────────┘           │
                    │                          ▼                               │
                    │  ┌─────────────────────────────────────────────────────┐│
                    │  │  lib/trpc (createTRPCClient) + useAuth + hooks       ││
                    │  │  getApiBaseUrl() → EXPO_PUBLIC_API_BASE_URL / 3000   ││
                    │  └──────────────────────────┬──────────────────────────┘│
                    └─────────────────────────────┼──────────────────────────┘
                                                   │ HTTPS
                                                   ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │              Backend (Express, server/_core/index.ts)    │
                    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
                    │  │ /api/health │  │ OAuth Routes │  │ /api/trpc       │   │
                    │  │             │  │ (callback)  │  │ (tRPC middleware)│   │
                    │  └─────────────┘  └──────┬──────┘  └────────┬────────┘   │
                    │                          │                  │             │
                    │  ┌───────────────────────┴──────────────────┴─────────┐ │
                    │  │  createContext (cookie/token) → ctx.user             │ │
                    │  │  appRouter: auth | ai | knowledge | system           │ │
                    │  └──┬──────────────┬──────────────┬────────────────────┘ │
                    │     │              │              │                       │
                    │     ▼              ▼              ▼                       │
                    │  server/db.ts   server/storage   _core/llm, voice, image  │
                    └─────┬──────────────┬──────────────┬──────────────────────┘
                          │              │              │
              ┌───────────┘              │              └───────────┐
              ▼                          ▼                          ▼
    ┌─────────────────┐      ┌─────────────────────┐    ┌─────────────────────┐
    │  MySQL          │      │  Manus Forge         │    │  Manus Forge         │
    │  (Drizzle)      │      │  v1/storage/upload   │    │  LLM / Whisper /     │
    │  users,         │      │  downloadUrl         │    │  ImageGen API        │
    │  knowledge_docs │      │  (S3-style)          │    │                      │
    └─────────────────┘      └─────────────────────┘    └─────────────────────┘
```

---

## 4. 目录与模块结构

### 4.1 根目录概览

```
scalebox-assistant/
├── app/                    # Expo Router 页面（入口、布局、路由）
├── server/                 # 后端：Express、tRPC、DB、存储
├── lib/                    # 前端公共库：tRPC 客户端、主题、工具
├── hooks/                  # React Hooks：useAuth、useFavorites、useCustomers 等
├── components/             # 通用 UI 组件
├── shared/                 # 前后端共享类型与常量
├── constants/              # 前端常量（OAuth、主题等）
├── drizzle/                # 数据库 schema、relations、migrations
├── scripts/                # 脚本：load-env、generate_qr 等
├── tests/                  # Vitest 单测
├── design.md               # 产品设计说明
├── todo.md                 # 功能清单
├── package.json            # 依赖与脚本
├── app.config.ts           # Expo 应用配置
├── drizzle.config.ts       # Drizzle 配置（MySQL）
└── ARCHITECTURE.md / DEPLOYMENT.md  # 架构与部署文档
```

### 4.2 前端核心（app/）

| 路径 | 说明 |
|------|------|
| `app/_layout.tsx` | 根布局：ThemeProvider、SafeArea、tRPC Provider、QueryClient、Stack（headerShown: false） |
| `app/(tabs)/` | 底部 Tab：index(Home)、library、generate、knowledge、customers、product |
| `app/oauth/callback.tsx` | OAuth 回调（Web 重定向 / Native 深度链接） |
| `app/favorites.tsx` | 收藏页 |
| `app/customer-form.tsx` / `customer-detail.tsx` | 客户表单与详情 |
| `app/dev/theme-lab.tsx` | 主题调试 |

路由由 Expo Router 基于文件系统生成；`unstable_settings.anchor: "(tabs)"` 指定 Tab 为锚点。

### 4.3 后端核心（server/）

| 文件/目录 | 说明 |
|-----------|------|
| `server/_core/index.ts` | Express 入口：CORS、JSON 解析、OAuth 路由、`/api/health`、`/api/trpc`、端口探测 |
| `server/_core/context.ts` | tRPC createContext：从 Cookie/Bearer 解析会话，注入 user |
| `server/_core/oauth.ts` | Manus OAuth 路由注册、callback 换 token、写 Cookie、upsertUser |
| `server/_core/trpc.ts` | 初始化 tRPC、publicProcedure / protectedProcedure |
| `server/_core/env.ts` | 服务端环境变量聚合（DATABASE_URL、JWT_SECRET、Forge 等） |
| `server/_core/llm.ts` | invokeLLM（消息、可选 tools/response_format） |
| `server/_core/voiceTranscription.ts` | transcribeAudio（Whisper） |
| `server/_core/imageGeneration.ts` | generateImage |
| `server/_core/notification.ts` | notifyOwner |
| `server/routers.ts` | appRouter：auth、ai、knowledge、system |
| `server/db.ts` | getDb、用户与知识库的 CRUD、getKnowledgeContext |
| `server/storage.ts` | storagePut、storageGet（Forge S3 API） |

### 4.4 数据层（drizzle/）

| 文件 | 说明 |
|------|------|
| `drizzle/schema.ts` | 表定义：users（OAuth 用户）、knowledge_docs（文件名、类型、大小、s3Url、s3Key、extractedText、uploadedBy 等） |
| `drizzle/relations.ts` | 表关系（若有） |
| `drizzle/migrations/` | drizzle-kit 生成的 SQL 迁移 |
| `drizzle.config.ts` | dialect: mysql，schema/out 路径，DATABASE_URL |

---

## 5. 数据流与核心流程

### 5.1 认证

- **Web**：点击登录 → 跳转 Manus OAuth → 回调到 `${API_BASE_URL}/api/oauth/callback` → 服务端写 HTTP-only Cookie → 后续请求带 Cookie，context 解析出 user。  
- **Native**：`startOAuthLogin()` 打开系统浏览器 → 回调为 App 深度链接 `scheme:/oauth/callback` → 客户端用 code 换 token → token 存 SecureStore，请求头带 `Authorization: Bearer <token>`；user 信息可缓存在本地。  
- **getApiBaseUrl()**：优先 `EXPO_PUBLIC_API_BASE_URL`；Web 上可基于 hostname 将 `8081-*` 替换为 `3000-*` 得到 API 地址。

### 5.2 AI 生成（知识库增强）

1. 客户端调用 `trpc.ai.generate.mutate({ messages, useKnowledge })`。  
2. 若 `useKnowledge === true`，服务端调用 `db.getKnowledgeContext(8000)` 取最近知识库摘要。  
3. 将知识库片段注入 system 或首条 system 消息。  
4. `invokeLLM({ messages })` 调用 Forge LLM，返回 content。  
5. 返回 `{ content: string }` 给前端展示（可配合 Streamdown 等渲染 Markdown）。

### 5.3 知识库上传

1. 客户端选择文件，转 base64，调用 `trpc.knowledge.upload.mutate({ fileName, fileType, fileSize, base64Content })`。  
2. 服务端：生成 `knowledge/${timestamp}-${suffix}-${fileName}` 的 s3Key，`storagePut(s3Key, buffer, mime)` 上传到 Forge。  
3. 对 txt/md 从 base64 解码提取文本（PDF/DOCX 仅占位说明）；写入 `knowledge_docs`（fileName、fileType、fileSize、s3Url、s3Key、extractedText、uploadedBy）。  
4. 返回 `{ id, s3Url, fileName }`。  

列表、删除、context 预览均通过 `server/db.ts` 的 listKnowledgeDocs、deleteKnowledgeDoc、getKnowledgeContext 实现。

### 5.4 客户端 → API 寻址

- tRPC 的 `httpBatchLink.url` 为 `${getApiBaseUrl()}/api/trpc`。  
- Web：通常 `EXPO_PUBLIC_API_BASE_URL` 与前端同域不同端口（如 3000），或通过反向代理统一域名。  
- Native：必须配置可访问的 API 基地址（如 Manus 提供的公网 URL）。

---

## 6. API 总览（tRPC）

| 路由 | 类型 | 说明 |
|------|------|------|
| `auth.me` | query | 当前用户（或 null） |
| `auth.logout` | mutation | 清除 Cookie，返回 success |
| `ai.generate` | mutation | messages + useKnowledge → LLM 回复 content |
| `knowledge.list` | query | 知识库文档列表（不含 extractedText） |
| `knowledge.upload` | mutation | fileName, fileType, fileSize, base64Content → id, s3Url, fileName |
| `knowledge.delete` | mutation | id → 删除文档 |
| `knowledge.context` | query | 短摘要（约 2000 字）供预览 |
| `system.*` | - | 如 notifyOwner 等系统能力 |

当前 ai、knowledge 为 publicProcedure；若需按用户隔离，可改为 protectedProcedure 并在前端处理 UNAUTHORIZED。

---

## 7. 环境变量

### 7.1 服务端（server/_core/env.ts 及运行环境）

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | MySQL 连接串（Drizzle 必填） |
| `JWT_SECRET` | 会话签名密钥 |
| `VITE_APP_ID` | Manus OAuth App ID |
| `OAUTH_SERVER_URL` | Manus OAuth 后端 URL |
| `VITE_OAUTH_PORTAL_URL` | 登录门户 URL |
| `OWNER_OPEN_ID` | 所有者 openId（可自动设为 admin） |
| `OWNER_NAME` | 所有者名称 |
| `BUILT_IN_FORGE_API_URL` | Manus Forge API 基地址 |
| `BUILT_IN_FORGE_API_KEY` | Forge API Key（存储/LLM 等） |
| `PORT` | 服务监听端口，默认 3000 |

### 7.2 前端（Expo / 构建时）

| 变量 | 说明 |
|------|------|
| `EXPO_PUBLIC_APP_ID` | 同 VITE_APP_ID，OAuth 用 |
| `EXPO_PUBLIC_API_BASE_URL` | 后端 API 基地址 |
| `EXPO_PUBLIC_OAUTH_PORTAL_URL` | 登录门户 |
| `EXPO_PUBLIC_OAUTH_SERVER_URL` | OAuth 后端（若需） |
| `EXPO_PUBLIC_OWNER_OPEN_ID` / `EXPO_PUBLIC_OWNER_NAME` | 可选展示用 |

`scripts/load-env.js` 在 app.config 前执行，将部分系统变量映射到 `EXPO_PUBLIC_*`，且仅当未设置时才覆盖，便于平台注入优先。

---

## 8. 安全与运维要点

- **认证**：敏感接口应使用 protectedProcedure，并在前端统一处理 UNAUTHORIZED（如跳转登录）。  
- **知识库**：上传限制 20MB；s3Key 带随机后缀防枚举；密钥仅存服务端。  
- **CORS**：当前为反射请求 Origin，credentials: true，适合同域或已知子域。生产可收紧 Allow-Origin。  
- **健康检查**：`GET /api/health` 返回 `{ ok: true, timestamp }`，便于网关/负载均衡探活。

---

## 9. 相关文档

- [产品设计](design.md)  
- [后端开发指南](server/README.md)  
- [部署文档](DEPLOYMENT.md)
