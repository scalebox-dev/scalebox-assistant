export type PromptCategory =
  | "customer_research"
  | "scalebox_pitch"
  | "email_templates"
  | "role_play"
  | "architecture"
  | "pricing_roi";

export interface PromptTemplate {
  id: string;
  category: PromptCategory;
  title: string;
  description: string;
  template: string;
  variables: string[];
}

export const CATEGORY_INFO: Record<
  PromptCategory,
  { label: string; description: string; color: string; icon: string }
> = {
  customer_research: {
    label: "客户调研",
    description: "深入了解目标客户的需求、痛点和购买动机",
    color: "#6C47FF",
    icon: "person.2.fill",
  },
  scalebox_pitch: {
    label: "产品介绍",
    description: "针对不同场景的 ScaleBox 产品价值主张",
    color: "#00D4AA",
    icon: "bolt.fill",
  },
  email_templates: {
    label: "邮件模板",
    description: "专业销售邮件，提升回复率和转化率",
    color: "#F59E0B",
    icon: "envelope.fill",
  },
  role_play: {
    label: "角色扮演",
    description: "模拟销售对话，处理异议和促成成交",
    color: "#EF4444",
    icon: "text.bubble.fill",
  },
  architecture: {
    label: "技术方案",
    description: "ScaleBox 技术架构和集成方案说明",
    color: "#22C55E",
    icon: "cpu",
  },
  pricing_roi: {
    label: "定价与 ROI",
    description: "定价策略、ROI 计算和成本对比分析",
    color: "#8B5CF6",
    icon: "chart.bar.fill",
  },
};

export const PROMPTS: PromptTemplate[] = [
  // ===== 客户调研 =====
  {
    id: "cr_001",
    category: "customer_research",
    title: "目标客户画像分析",
    description: "分析目标客户的技术背景、业务需求和决策流程",
    template:
      "请帮我分析以下目标客户，并生成一份详细的客户画像报告：\n\n公司名称：[公司名称]\n行业：[行业]\n公司规模：[公司规模]\n当前技术栈：[技术栈]\n\n请从以下维度分析：\n1. 可能面临的沙盒/开发环境痛点\n2. 对 ScaleBox 毫秒级启动和按秒计费的潜在价值感知\n3. 决策链路（技术负责人、采购、CTO）\n4. 最佳切入点和销售策略\n5. 可能的竞争对手和差异化优势",
    variables: ["公司名称", "行业", "公司规模", "技术栈"],
  },
  {
    id: "cr_002",
    category: "customer_research",
    title: "痛点挖掘问题清单",
    description: "生成针对性的客户痛点挖掘问题，用于销售拜访",
    template:
      "我将拜访 [公司名称] 的 [职位] [联系人姓名]，他们目前使用 [当前方案] 管理开发环境。\n\n请生成 10 个深度挖掘痛点的问题，重点围绕：\n- 当前环境启动速度和资源浪费\n- 成本透明度和按量计费需求\n- 安全合规和权限管理\n- AI/ML 工作负载的特殊需求\n- 团队协作和环境一致性\n\n问题要开放式、引导性，帮助客户自己意识到 ScaleBox 能解决的问题。",
    variables: ["公司名称", "职位", "联系人姓名", "当前方案"],
  },
  {
    id: "cr_003",
    category: "customer_research",
    title: "竞争对手对比分析",
    description: "与主要竞争对手的详细对比，突出 ScaleBox 优势",
    template:
      "客户 [公司名称] 正在考虑 [竞争对手] 作为沙盒解决方案。\n\n请生成一份详细的对比分析，包括：\n1. ScaleBox vs [竞争对手] 的核心差异\n2. ScaleBox 在以下方面的优势：\n   - 启动速度（毫秒级 vs 分钟级）\n   - 计费模式（按秒 vs 按小时/月）\n   - 安全架构（RBAC、审计追踪）\n   - AI 就绪基础设施\n3. 如何在对话中自然引导客户发现这些差异\n4. 处理客户可能提出的 [竞争对手] 优势的话术",
    variables: ["公司名称", "竞争对手"],
  },
  {
    id: "cr_004",
    category: "customer_research",
    title: "AI 公司客户调研",
    description: "专门针对 AI/ML 公司的调研分析",
    template:
      "目标客户是一家 AI 公司：[公司名称]，主要产品/服务是 [产品描述]，团队规模 [团队规模]。\n\n请分析：\n1. 他们的 AI 开发工作流程中，沙盒环境的使用场景\n2. ScaleBox 对 AI 工作负载的特殊价值（GPU 支持、快速迭代、环境隔离）\n3. 按秒计费对 AI 训练/推理成本的优化潜力\n4. 关键决策者（CTO、ML 工程师 Lead）的关注点\n5. 推荐的演示场景和 POC 方案",
    variables: ["公司名称", "产品描述", "团队规模"],
  },
  {
    id: "cr_005",
    category: "customer_research",
    title: "客户需求摘要报告",
    description: "整理客户会议信息，生成结构化需求摘要",
    template:
      "请根据以下会议信息，生成一份结构化的客户需求摘要报告：\n\n客户：[公司名称]\n会议日期：[日期]\n参与者：[参与者]\n会议要点：[会议要点]\n\n报告应包含：\n1. 客户核心痛点（按优先级排列）\n2. 明确的购买信号\n3. 潜在障碍和顾虑\n4. ScaleBox 对应解决方案映射\n5. 建议的下一步行动\n6. 预估成交时间线",
    variables: ["公司名称", "日期", "参与者", "会议要点"],
  },

  // ===== 产品介绍 =====
  {
    id: "sp_001",
    category: "scalebox_pitch",
    title: "30 秒电梯演讲",
    description: "简洁有力的 ScaleBox 价值主张，适合初次接触",
    template:
      "请为 ScaleBox 生成一段 30 秒的电梯演讲，目标听众是 [目标受众]（[职位]）。\n\nScaleBox 核心价值：毫秒级沙盒启动、按秒计费、10K+ 活跃用户、99.9% 正常运行时间、12 个全球区域。\n\n要求：\n- 用一句话说明 ScaleBox 解决什么问题\n- 突出与传统方案的差异（毫秒 vs 分钟，按秒 vs 按月）\n- 以一个引发兴趣的问题结尾\n- 语言要自然、口语化，避免技术术语",
    variables: ["目标受众", "职位"],
  },
  {
    id: "sp_002",
    category: "scalebox_pitch",
    title: "技术团队演示脚本",
    description: "面向工程师和技术负责人的详细演示脚本",
    template:
      "请生成一份面向 [公司名称] 技术团队的 ScaleBox 产品演示脚本，时长约 [时长] 分钟。\n\n演示对象：[演示对象职位]\n主要关注点：[关注点]\n\n脚本应包含：\n1. 开场白（引发共鸣的痛点描述）\n2. ScaleBox 核心功能演示流程\n   - 毫秒级沙盒创建\n   - 按秒计费仪表板\n   - RBAC 权限管理\n   - API 集成示例\n3. 与现有工作流的集成方案\n4. Q&A 常见问题准备\n5. 下一步行动建议",
    variables: ["公司名称", "时长", "演示对象职位", "关注点"],
  },
  {
    id: "sp_003",
    category: "scalebox_pitch",
    title: "五大支柱价值陈述",
    description: "基于 ScaleBox 五大支柱的完整价值陈述",
    template:
      "请为 [公司名称] 生成一份基于 ScaleBox 五大核心支柱的价值陈述，针对他们的 [主要痛点] 问题。\n\nScaleBox 五大支柱：\n1. 安全（Secure）- API 密钥认证、RBAC、不可变审计追踪\n2. 即时（Instant）- 毫秒级启动、预配置模板\n3. 可扩展（Scalable）- 双引擎架构、水平扩展\n4. 透明（Transparent）- 按秒计费、实时成本监控\n5. 现代（Modern）- 开发者优先、AI 就绪\n\n请将每个支柱与客户的具体业务场景关联，用数据和案例支撑，语言要有说服力。",
    variables: ["公司名称", "主要痛点"],
  },
  {
    id: "sp_004",
    category: "scalebox_pitch",
    title: "高管层商业价值陈述",
    description: "面向 CTO/CEO 的商业价值和战略意义陈述",
    template:
      "请生成一份面向 [公司名称] [高管职位] 的 ScaleBox 商业价值陈述。\n\n公司背景：[公司背景]\n当前挑战：[当前挑战]\n\n陈述应聚焦于：\n1. 基础设施成本优化（按秒计费 vs 传统按月/按小时）\n2. 开发效率提升（毫秒级启动 vs 分钟级等待）\n3. 安全合规风险降低\n4. 团队规模扩展的边际成本\n5. AI 时代基础设施现代化战略\n\n用 CFO/CTO 语言，强调 ROI、TCO 和战略竞争优势。",
    variables: ["公司名称", "高管职位", "公司背景", "当前挑战"],
  },
  {
    id: "sp_005",
    category: "scalebox_pitch",
    title: "行业定制化 Pitch",
    description: "针对特定行业定制的 ScaleBox 价值主张",
    template:
      "请为 [行业] 行业的客户 [公司名称] 生成一份定制化的 ScaleBox pitch。\n\n该行业的特殊需求：[行业特殊需求]\n\n请包含：\n1. 该行业使用沙盒环境的典型场景\n2. ScaleBox 对该行业的特殊价值（合规、安全、效率）\n3. 同行业成功案例或类比\n4. 行业专属的 ROI 计算示例\n5. 推荐的试用场景（POC）",
    variables: ["行业", "公司名称", "行业特殊需求"],
  },

  // ===== 邮件模板 =====
  {
    id: "em_001",
    category: "email_templates",
    title: "冷启动开发邮件",
    description: "首次联系潜在客户的开发邮件",
    template:
      "请生成一封发给 [公司名称] [联系人姓名]（[职位]）的冷启动开发邮件。\n\n背景信息：[背景信息]\n\n邮件要求：\n- 主题行要吸引眼球，避免销售感\n- 开头用个性化内容建立连接\n- 用 1-2 句话说明 ScaleBox 的核心价值\n- 提出一个低门槛的下一步（15 分钟通话或免费试用）\n- 总长度不超过 150 字\n- 语气专业但不生硬",
    variables: ["公司名称", "联系人姓名", "职位", "背景信息"],
  },
  {
    id: "em_002",
    category: "email_templates",
    title: "会议后跟进邮件",
    description: "销售会议后的专业跟进邮件",
    template:
      "请生成一封发给 [联系人姓名] 的会议后跟进邮件。\n\n会议摘要：[会议摘要]\n讨论的痛点：[痛点]\n承诺的下一步：[下一步]\n\n邮件应包含：\n- 感谢和会议亮点回顾\n- 针对讨论痛点的 ScaleBox 解决方案总结\n- 承诺发送的资料或信息\n- 明确的下一步行动和时间节点\n- 专业但温暖的语气",
    variables: ["联系人姓名", "会议摘要", "痛点", "下一步"],
  },
  {
    id: "em_003",
    category: "email_templates",
    title: "试用期转化邮件",
    description: "将免费试用用户转化为付费客户",
    template:
      "请生成一封发给 [联系人姓名] 的试用期转化邮件。\n\n试用情况：[试用情况]\n使用数据：[使用数据]\n\n邮件策略：\n- 肯定他们的试用成果\n- 用具体数据展示价值（节省的时间/成本）\n- 对比 Hobby 免费版和 Pro/Ultimate 的差距\n- 提供限时优惠或专属折扣（如有）\n- 降低决策门槛（月付、随时取消）\n- 提供一键升级链接",
    variables: ["联系人姓名", "试用情况", "使用数据"],
  },
  {
    id: "em_004",
    category: "email_templates",
    title: "异议处理回复邮件",
    description: "针对常见异议的专业回复邮件",
    template:
      "客户 [联系人姓名] 提出了以下异议：[异议内容]\n\n请生成一封专业的异议处理回复邮件，要求：\n1. 先认可客户的顾虑（不要直接反驳）\n2. 用数据和案例化解异议\n3. 重新聚焦 ScaleBox 的核心价值\n4. 提出具体的解决方案或下一步\n5. 语气要自信但不强硬\n\n常见异议参考：价格太贵、现有方案够用、安全顾虑、迁移成本高",
    variables: ["联系人姓名", "异议内容"],
  },
  {
    id: "em_005",
    category: "email_templates",
    title: "季度回顾邮件",
    description: "与现有客户的季度回顾和扩展机会挖掘",
    template:
      "请生成一封发给现有客户 [公司名称] [联系人姓名] 的季度回顾邮件。\n\n客户使用情况：[使用情况]\n当前套餐：[当前套餐]\n\n邮件目标：\n- 回顾过去季度的使用成果和价值\n- 展示 ScaleBox 新功能更新\n- 识别扩展机会（更多团队、更高套餐）\n- 邀请参加用户反馈会议\n- 维护长期合作关系",
    variables: ["公司名称", "联系人姓名", "使用情况", "当前套餐"],
  },
  {
    id: "em_006",
    category: "email_templates",
    title: "案例研究邀请邮件",
    description: "邀请成功客户参与案例研究",
    template:
      "请生成一封邀请 [公司名称] [联系人姓名] 参与 ScaleBox 案例研究的邮件。\n\n客户成果：[客户成果]\n\n邮件要点：\n- 肯定他们使用 ScaleBox 的成果\n- 说明案例研究的价值（品牌曝光、行业影响力）\n- 明确参与方式和时间投入\n- 提供参与激励（折扣、专属支持）\n- 保证内容审核权",
    variables: ["公司名称", "联系人姓名", "客户成果"],
  },

  // ===== 角色扮演 =====
  {
    id: "rp_001",
    category: "role_play",
    title: "价格异议处理",
    description: "模拟客户提出价格异议时的对话处理",
    template:
      "请扮演 ScaleBox 销售顾问，与我进行角色扮演练习。\n\n场景：[公司名称] 的 [职位] 说：\"ScaleBox 的价格比我们现在用的方案贵多了，我们没有预算。\"\n\n请用以下策略回应：\n1. 先理解和认可客户的预算顾虑\n2. 引导客户计算当前方案的真实成本（包括隐性成本）\n3. 展示 ScaleBox 按秒计费的成本优化\n4. 提供 ROI 计算框架\n5. 建议从小规模 POC 开始\n\n然后继续模拟对话，直到达成下一步行动共识。",
    variables: ["公司名称", "职位"],
  },
  {
    id: "rp_002",
    category: "role_play",
    title: "技术评估对话",
    description: "与技术负责人的深度技术评估对话",
    template:
      "请扮演 ScaleBox 技术销售工程师，与 [公司名称] 的 [技术职位] 进行技术评估对话。\n\n客户背景：[技术背景]\n主要关注点：[技术关注点]\n\n对话应涵盖：\n1. ScaleBox 技术架构（双引擎、事件溯源）\n2. 安全机制（API 认证、RBAC、审计追踪）\n3. 与现有 CI/CD 工具链的集成\n4. 性能基准和 SLA 保证\n5. 数据隐私和合规性\n\n用技术语言，展示专业深度，建立技术可信度。",
    variables: ["公司名称", "技术职位", "技术背景", "技术关注点"],
  },
  {
    id: "rp_003",
    category: "role_play",
    title: "竞品比较对话",
    description: "当客户提到竞争对手时的对话处理",
    template:
      "请扮演 ScaleBox 销售顾问，处理以下竞品比较情况：\n\n客户说：\"我们已经在评估 [竞争对手]，他们的方案看起来也不错。\"\n\n请用以下策略：\n1. 肯定客户做了充分调研\n2. 提出 3-5 个关键评估维度（启动速度、计费精度、安全架构）\n3. 引导客户用这些维度自己发现 ScaleBox 的优势\n4. 避免直接攻击竞争对手\n5. 建议并行 POC 测试\n\n继续对话直到客户同意进行 ScaleBox 试用。",
    variables: ["竞争对手"],
  },
  {
    id: "rp_004",
    category: "role_play",
    title: "采购谈判模拟",
    description: "与采购部门的价格谈判模拟",
    template:
      "请扮演 ScaleBox 企业销售代表，与 [公司名称] 采购部门进行合同谈判。\n\n谈判背景：[谈判背景]\n客户预算：[预算范围]\n期望套餐：[期望套餐]\n\n谈判策略：\n1. 了解采购流程和决策时间线\n2. 探索价值而非单纯价格谈判\n3. 提供年付折扣和承诺量折扣\n4. 增加增值服务（专属支持、培训）\n5. 设定底线并坚守\n\n模拟完整谈判过程，直到达成协议或明确下一步。",
    variables: ["公司名称", "谈判背景", "预算范围", "期望套餐"],
  },
  {
    id: "rp_005",
    category: "role_play",
    title: "安全顾虑处理",
    description: "处理客户对数据安全和合规性的顾虑",
    template:
      "请扮演 ScaleBox 安全专家，回应 [公司名称] 安全团队的顾虑。\n\n客户顾虑：[安全顾虑]\n行业合规要求：[合规要求]\n\n请详细说明：\n1. ScaleBox 的安全架构（API 密钥认证、RBAC）\n2. 不可变审计追踪的合规价值\n3. 数据隔离和沙盒安全边界\n4. 与行业标准（SOC2、ISO27001 等）的对齐\n5. 安全评估和渗透测试支持\n\n用专业、有说服力的语言建立安全信任。",
    variables: ["公司名称", "安全顾虑", "合规要求"],
  },

  // ===== 技术方案 =====
  {
    id: "ar_001",
    category: "architecture",
    title: "ScaleBox 架构概述",
    description: "面向技术受众的 ScaleBox 技术架构说明",
    template:
      "请为 [公司名称] 的技术团队生成一份 ScaleBox 技术架构概述文档。\n\n受众技术水平：[技术水平]\n主要关注方向：[关注方向]\n\n文档应包含：\n1. 双引擎架构（用量分析引擎 + 计费计算引擎）\n2. 事件溯源设计原则\n3. 沙盒隔离机制\n4. API 设计和集成接口\n5. 全球 12 区域部署架构\n6. 高可用和故障恢复机制\n\n用清晰的技术语言，可以包含架构图描述。",
    variables: ["公司名称", "技术水平", "关注方向"],
  },
  {
    id: "ar_002",
    category: "architecture",
    title: "CI/CD 集成方案",
    description: "ScaleBox 与主流 CI/CD 工具链的集成方案",
    template:
      "请生成 ScaleBox 与 [CI/CD 工具] 的集成方案文档，面向 [公司名称] 的 DevOps 团队。\n\n当前工作流：[当前工作流]\n\n方案应包含：\n1. 集成架构图描述\n2. API 调用示例（创建沙盒、运行测试、销毁沙盒）\n3. 配置文件示例\n4. 成本优化建议（按秒计费的最佳实践）\n5. 常见问题和解决方案\n6. 迁移步骤和时间估算",
    variables: ["CI/CD 工具", "公司名称", "当前工作流"],
  },
  {
    id: "ar_003",
    category: "architecture",
    title: "AI/ML 工作负载方案",
    description: "针对 AI/ML 场景的 ScaleBox 最佳实践",
    template:
      "请为 [公司名称] 的 AI/ML 团队生成 ScaleBox 使用方案，他们的主要工作负载是 [AI 工作负载描述]。\n\n方案应涵盖：\n1. AI 开发环境快速配置（预装依赖、框架）\n2. 模型训练沙盒的资源配置建议\n3. 实验管理和环境复现\n4. 按秒计费对 GPU 使用成本的优化\n5. 团队协作和实验共享\n6. 与 MLflow/W&B 等工具的集成\n\n包含具体的配置示例和成本估算。",
    variables: ["公司名称", "AI 工作负载描述"],
  },
  {
    id: "ar_004",
    category: "architecture",
    title: "安全合规架构说明",
    description: "面向安全团队的 ScaleBox 安全架构详解",
    template:
      "请为 [公司名称] 的安全团队生成 ScaleBox 安全架构说明文档。\n\n合规要求：[合规要求]\n安全关注点：[安全关注点]\n\n文档应包含：\n1. 认证和授权机制（API 密钥、RBAC 三级权限）\n2. 网络隔离和沙盒安全边界\n3. 不可变审计追踪的实现和价值\n4. 数据加密（传输和静态）\n5. 漏洞管理和安全更新机制\n6. 合规认证状态和路线图\n7. 安全事件响应流程",
    variables: ["公司名称", "合规要求", "安全关注点"],
  },

  // ===== 定价与 ROI =====
  {
    id: "pr_001",
    category: "pricing_roi",
    title: "ROI 计算模型",
    description: "为客户定制化的 ScaleBox ROI 计算",
    template:
      "请为 [公司名称] 生成一份 ScaleBox ROI 计算报告。\n\n客户信息：\n- 开发团队规模：[团队规模] 人\n- 当前沙盒/开发环境方案：[当前方案]\n- 当前月度成本：[当前成本]\n- 平均等待环境时间：[等待时间] 分钟/次\n- 每天环境使用次数：[使用次数] 次\n\n请计算：\n1. 当前方案的真实总成本（含工程师时间成本）\n2. ScaleBox 的预估月度成本\n3. 节省的工程师时间价值\n4. 12 个月 ROI 和回收期\n5. 定性价值（安全、合规、团队效率）",
    variables: ["公司名称", "团队规模", "当前方案", "当前成本", "等待时间", "使用次数"],
  },
  {
    id: "pr_002",
    category: "pricing_roi",
    title: "套餐推荐分析",
    description: "根据客户需求推荐最合适的 ScaleBox 套餐",
    template:
      "请根据以下客户信息，推荐最合适的 ScaleBox 套餐并说明理由。\n\n客户信息：\n- 公司：[公司名称]\n- 并发沙盒需求：[并发需求]\n- 单沙盒资源需求：[资源需求]\n- 月预算：[月预算]\n- 主要使用场景：[使用场景]\n\nScaleBox 套餐：\n- Hobby（免费）：20 并发，8CPU，8GB RAM\n- Pro（$99.99/月）：100 并发，8CPU，16GB RAM\n- Ultimate（$199.99/月）：400 并发，16CPU，16GB RAM\n\n请提供推荐理由、成本对比和升级路径建议。",
    variables: ["公司名称", "并发需求", "资源需求", "月预算", "使用场景"],
  },
  {
    id: "pr_003",
    category: "pricing_roi",
    title: "按量计费成本估算",
    description: "基于实际用量的 ScaleBox 成本详细估算",
    template:
      "请为 [公司名称] 生成 ScaleBox 按量计费的详细成本估算。\n\n预期用量：\n- 月活跃沙盒数：[沙盒数]\n- 平均每沙盒 CPU 使用：[CPU 核数] 核\n- 平均每沙盒 RAM：[RAM] GB\n- 平均沙盒运行时长：[运行时长] 小时/月\n- 代理流量：[流量] GB/月\n\n请基于 ScaleBox 定价（CPU: $0.000014/CPU秒，RAM: $0.0000045/GB/秒，代理: $1.8/GB）计算月度总成本，并与传统按月计费方案对比。",
    variables: ["公司名称", "沙盒数", "CPU 核数", "RAM", "运行时长", "流量"],
  },
  {
    id: "pr_004",
    category: "pricing_roi",
    title: "企业定制报价方案",
    description: "为大型企业客户定制报价和谈判策略",
    template:
      "请为 [公司名称] 生成企业定制报价方案和谈判策略。\n\n客户规模：[公司规模]\n预期用量：[预期用量]\n合同期望：[合同期望]\n预算范围：[预算范围]\n\n方案应包含：\n1. 基础套餐推荐（Ultimate 或定制）\n2. 年付折扣方案（通常 15-20%）\n3. 承诺量折扣阶梯\n4. 增值服务包（专属支持、SLA 升级、培训）\n5. 谈判底线和让步空间\n6. 合同条款建议",
    variables: ["公司名称", "公司规模", "预期用量", "合同期望", "预算范围"],
  },
  {
    id: "pr_005",
    category: "pricing_roi",
    title: "成本对比白皮书",
    description: "ScaleBox vs 自建方案的全面成本对比",
    template:
      "请生成一份 ScaleBox vs 自建沙盒方案的成本对比白皮书，面向 [公司名称] 的决策层。\n\n客户当前方案：[当前方案]\n团队规模：[团队规模]\n\n白皮书应包含：\n1. 自建方案的完整成本分析（硬件、运维、人力、机会成本）\n2. ScaleBox 的全成本（订阅费 + 用量费）\n3. 3 年 TCO 对比\n4. 非量化价值（安全、合规、开发效率）\n5. 迁移成本和时间\n6. 结论和建议\n\n用专业的商业语言，包含图表描述和数据支撑。",
    variables: ["公司名称", "当前方案", "团队规模"],
  },
];

export function getPromptsByCategory(category: PromptCategory): PromptTemplate[] {
  return PROMPTS.filter((p) => p.category === category);
}

export function searchPrompts(query: string): PromptTemplate[] {
  const q = query.toLowerCase();
  return PROMPTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.template.toLowerCase().includes(q),
  );
}

export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    if (value) {
      result = result.replace(new RegExp(`\\[${key}\\]`, "g"), value);
    }
  }
  return result;
}
