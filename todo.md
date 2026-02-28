# ScaleBox Sales Agent - TODO

- [x] Configure brand colors (purple/violet + teal) in theme.config.js
- [x] Update app name and branding in app.config.ts
- [x] Create prompt data library with 25 ScaleBox-adapted prompts across 6 categories
- [x] Build Home/Dashboard screen with category cards and stats
- [x] Build Prompt Library screen with category tabs and search
- [x] Build AI Generator screen with variable inputs and generation
- [x] Build Favorites screen with saved prompts and history
- [x] Build ScaleBox Product Info screen with pricing and features
- [x] Set up tab bar with 4 tabs (Home, Library, Generate, Product)
- [x] Add icon mappings for all tab icons
- [x] Implement copy-to-clipboard for prompts
- [x] Implement favorites/save functionality with AsyncStorage
- [x] Implement search functionality in library
- [x] Connect AI Generator to backend LLM (server/routers.ts ai.generate)
- [x] Generate app icon and configure branding
- [x] Final polish and animations

## v1.1 新增内容（来自第二份附件）
- [x] 产品信息页：新增技术特性详解（microVM、Code Interpreter SDK、Browser/Computer Use）
- [x] 产品信息页：新增竞品对比模块（ScaleBox vs E2B 优劣势分析）
- [x] 产品信息页：新增目标客户分类（AI 智能体、行业 ISV、企业客户）
- [x] 提示词库：新增竞品对比类提示词（ScaleBox vs E2B）
- [x] 提示词库：新增 AI 智能体场景提示词（Code Interpreter、Browser Use、Agent 训练）
- [x] 提示词库：新增注册引导和试用转化提示词（$100 代金券）

## v1.2 新增功能
- [x] 客户跟进 CRM：新增“客户”Tab（第5个 Tab）
- [x] 客户跟进 CRM：客户列表页（显示公司名、联系人、阶段标签、最近更新时间）
- [x] 客户跟进 CRM：新增/编辑客户表单（公司名、联系人、职位、联系方式、当前阶段、备注）
- [x] 客户跟进 CRM：阶段管理（初接触/演示/报价/成交/流失）并支持拖拽或点击切换
- [x] 客户跟进 CRM：客户详情页（基本信息 + 跟进记录时间线）
- [x] 客户跟进 CRM：本地 AsyncStorage 持久化
- [x] 提示词分享：在提示词详情/生成结果页新增“复制”按鈕（复制完整提示词内容）
- [x] 提示词分享：新增系统分享按鈕（调用 expo-sharing 分享到微信/邮件等）
- [x] 提示词分享：分享时自动附带 ScaleBox 官网链接 www.scalebox.dev

## v1.3 新增功能
- [x] 并发计算器：产品信息页新增「计算器」Tab
- [x] 并发计算器：输入并发沙盒数量和月使用小时数
- [x] 并发计算器：自动计算并对比 Hobby/Pro/Ultimate 三档费用
- [x] 并发计算器：显示节省金额和推荐方案高亮
- [x] 并发计算器：展示 ROI 分析（与自建基础设施对比）
- [x] 客户关联提示词：客户详情页新增「推荐提示词」区块
- [x] 客户关联提示词：根据客户行业自动筛选匹配的提示词
- [x] 客户关联提示词：一键跳转 AI 生成器并预填客户公司名等信息

## v1.4 新增功能
- [x] 客户搜索：客户列表页顶部添加搜索框
- [x] 客户搜索：支持按公司名、联系人姓名、行业实时过滤
- [x] 客户搜索：搜索无结果时显示空状态提示
- [x] 客户搜索：搜索框支持清除按鈕
