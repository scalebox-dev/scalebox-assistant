## ScaleBox 销售助手 - 前后端一体生产镜像（单端口 3000）
# 说明：
# - dist/ 提供后端 API (/api/...)
# - web-build/ 提供前端静态页面（由 Express 在同一端口托管）
#
# 使用步骤：
# 1) 在项目根目录先导出前端静态文件：
#      npx expo export --platform web --output-dir web-build
# 2) 构建镜像:
#      docker build -t scalebox-assistant .
# 3) 运行容器:
#      docker run -p 3000:3000 -e LLM_API_KEY=sk-xxx scalebox-assistant
# 4) 访问:
#      前端: http://localhost:3000
#      后端: http://localhost:3000/api/...

FROM node:20-alpine AS build

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json* .npmrc* ./
RUN npm install

# 拷贝后端及共享代码
COPY server ./server
COPY shared ./shared
COPY drizzle ./drizzle
COPY scripts ./scripts
COPY app.config.ts tsconfig.json ./

# 构建后端（esbuild 输出到 dist/）
RUN npm run build

# 精简为生产依赖
RUN npm prune --production

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# 拷贝本机事先构建好的前端静态文件（web-build 目录需在构建前生成）
COPY web-build ./web-build

EXPOSE 3000

CMD ["node", "dist/index.js"]