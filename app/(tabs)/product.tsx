import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = "overview" | "tech" | "compare" | "customers" | "calculator";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "产品概览" },
  { id: "tech", label: "技术特性" },
  { id: "compare", label: "竞品对比" },
  { id: "customers", label: "目标客户" },
  { id: "calculator", label: "🧭 计算器" },
];

// ─── Data ─────────────────────────────────────────────────────────────────────
const TECH_FEATURES = [
  {
    icon: "bolt.fill",
    title: "快速启动与高性能",
    color: "#00D4AA",
    points: [
      "毫秒级冷启动：500ms-1s，技术优化目标 200ms 以内",
      "按需水平扩展：支持成千上万个独立沙箱并发运行",
      "非常适合大规模 Agent 并发应用场景",
    ],
  },
  {
    icon: "chevron.left.forwardslash.chevron.right",
    title: "Code Interpreter SDK",
    color: "#6C47FF",
    points: [
      "Python 和 Node.js 多语言 SDK，几行代码集成代码解释器",
      "实时流式传输代码输出（stdout、stderr、图表渲染）",
      "原生支持数据可视化自动处理",
    ],
  },
  {
    icon: "externaldrive.fill",
    title: "高度可定制沙箱模板",
    color: "#F59E0B",
    points: [
      "Dockerfile 支持：标准方式定义沙箱环境",
      "业务模板定制：生 PPT、生视频图片、数字人等原子能力",
      "环境持久化：支持长达 30 天活跃会话，支持暂停/恢复",
    ],
  },
  {
    icon: "lock.fill",
    title: "完整系统访问权限",
    color: "#22C55E",
    points: [
      "文件系统操控：读写、上传、下载、修改文件",
      "允许 AI 爬取网页、调用外部 API 或下载数据集",
      "Agent 训练、沙盒模拟、轨迹合成（TNR）、代码运行",
    ],
  },
  {
    icon: "globe",
    title: "Browser & Computer Use",
    color: "#EF4444",
    points: [
      "Browser Use：沙箱内可运行 Playwright 进行浏览器自动化",
      "Computer Use：AI 通过控制屏幕、鼠标和键盘使用桌面软件",
      "不仅限于命令行，支持完整 GUI 操作",
    ],
  },
  {
    icon: "cpu",
    title: "微虚拟机 (microVM) 架构",
    color: "#8B5CF6",
    points: [
      "基于 microVM 的完整 Linux 环境，硬件级安全隔离",
      "兼容 E2B API 接口，迁移成本极低",
      "即便代码恶意或崩溃，也不影响宿主机",
    ],
  },
];

const COMPARE_ITEMS = [
  {
    dimension: "启动速度",
    scalebox: "500ms-1s（目标 200ms）",
    e2b: "~150ms",
    winner: "e2b" as const,
    note: "ScaleBox 可通过预热池策略（5-10%）弥补差距",
  },
  {
    dimension: "GPU 支持",
    scalebox: "✓ 支持 GPU 调用",
    e2b: "✗ 暂不支持",
    winner: "scalebox" as const,
    note: "需要本地小型模型推理时 ScaleBox 更优",
  },
  {
    dimension: "复杂网络配置",
    scalebox: "✓ 完整支持",
    e2b: "✗ 受限",
    winner: "scalebox" as const,
    note: "复杂企业网络环境 ScaleBox 更稳妥",
  },
  {
    dimension: "长会话稳定性",
    scalebox: "✓ 高负载 I/O 更稳定",
    e2b: "△ 一般",
    winner: "scalebox" as const,
    note: "长时间运行场景 ScaleBox 优势明显",
  },
  {
    dimension: "快照恢复速度",
    scalebox: "△ 大规模并发下较慢",
    e2b: "✓ 快速快照",
    winner: "e2b" as const,
    note: "后续架构优化可缩小差距",
  },
  {
    dimension: "环境定制化",
    scalebox: "✓ Dockerfile + 业务模板",
    e2b: "△ 有限",
    winner: "scalebox" as const,
    note: "生 PPT、视频、数字人等原子能力模板",
  },
  {
    dimension: "Computer Use",
    scalebox: "✓ 完整桌面控制",
    e2b: "△ 有限",
    winner: "scalebox" as const,
    note: "支持屏幕、鼠标、键盘完整 GUI 操作",
  },
  {
    dimension: "Agent 训练支持",
    scalebox: "✓ 轨迹合成、人工干预",
    e2b: "✗ 不支持",
    winner: "scalebox" as const,
    note: "支持强化学习轨迹编辑和人工干预",
  },
];

const CUSTOMER_SEGMENTS = [
  {
    icon: "wand.and.stars",
    title: "AI 智能体公司",
    color: "#6C47FF",
    desc: "构建 AI Agent、AI 浏览器、模型服务的企业。所有 SaaS 都在转型为智能体，所有 App 都在植入 AI。",
    examples: ["AI Agent 平台", "AI 浏览器产品", "大模型应用公司"],
  },
  {
    icon: "person.2.fill",
    title: "行业 ISV / 垂直 Agent",
    color: "#00D4AA",
    desc: "各垂直行业正在构建专属 Agent 的企业，都需要沙盒作为 AI 基础设施。",
    examples: ["电商自动化 Agent", "医疗智能体", "金融智能体"],
  },
  {
    icon: "network",
    title: "企业 & 互联网公司",
    color: "#F59E0B",
    desc: "构建面向客户的 Agent 托管 + 模型服务的企业，需要沙盒提供安全隔离的执行环境。",
    examples: ["企业 AI 平台", "互联网大厂 AI 部门", "云服务提供商"],
  },
  {
    icon: "gear",
    title: "开发者 & 独立开发者",
    color: "#EF4444",
    desc: "直接访问 scalebox.dev 注册，赠送 $100 代金券测试。文档详细，按并发三种订阅方式。",
    examples: ["个人开发者", "小型 AI 创业团队", "研究机构"],
  },
];

const PRICING_PLANS = [
  {
    name: "Hobby",
    price: "免费",
    priceUnit: "",
    color: "#6B7280",
    highlight: false,
    features: ["20 并发沙盒", "8 CPU 核心/沙盒", "8GB RAM/沙盒", "2GB 存储/沙盒", "1 小时运行时长", "30 天持久化"],
    cta: "免费开始",
  },
  {
    name: "Pro",
    price: "$99.99",
    priceUnit: "/月",
    color: "#6C47FF",
    highlight: true,
    features: ["100 并发沙盒", "8 CPU 核心/沙盒", "16GB RAM/沙盒", "8GB 存储/沙盒", "1 天运行时长", "30 天持久化"],
    cta: "开始试用",
  },
  {
    name: "Ultimate",
    price: "$199.99",
    priceUnit: "/月",
    color: "#00D4AA",
    highlight: false,
    features: ["400 并发沙盒", "16 CPU 核心/沙盒", "16GB RAM/沙盒", "16GB 存储/沙盒", "2 天运行时长", "30 天持久化"],
    cta: "联系销售",
  },
];

// ─── Calculator Plans ─────────────────────────────────────────────────────────
const CALC_PLANS = [
  {
    name: "Hobby",
    color: "#6B7280",
    monthlyBase: 0,
    maxConcurrent: 20,
    cpuPerSandbox: 8,
    ramPerSandbox: 8,
    storagePerSandbox: 2,
    usageRates: { cpu: 0.000225, ram: 0.0000125, storage: 0.000003 },
  },
  {
    name: "Pro",
    color: "#6C47FF",
    monthlyBase: 99.99,
    maxConcurrent: 100,
    cpuPerSandbox: 8,
    ramPerSandbox: 16,
    storagePerSandbox: 8,
    usageRates: { cpu: 0.000225, ram: 0.0000125, storage: 0.000003 },
  },
  {
    name: "Ultimate",
    color: "#00D4AA",
    monthlyBase: 199.99,
    maxConcurrent: 400,
    cpuPerSandbox: 16,
    ramPerSandbox: 16,
    storagePerSandbox: 16,
    usageRates: { cpu: 0.000225, ram: 0.0000125, storage: 0.000003 },
  },
];

// Self-hosted cost estimate: ~$0.05/sandbox-hour (server + ops + maintenance)
const SELF_HOSTED_COST_PER_SANDBOX_HOUR = 0.05;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ProductScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  // Calculator state
  const [concurrentSandboxes, setConcurrentSandboxes] = useState(50);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerMonth, setDaysPerMonth] = useState(22);

  const calcResults = CALC_PLANS.map((plan) => {
    const totalHours = hoursPerDay * daysPerMonth;
    const cpuCost = plan.usageRates.cpu * plan.cpuPerSandbox * concurrentSandboxes * totalHours;
    const ramCost = plan.usageRates.ram * plan.ramPerSandbox * 1024 * concurrentSandboxes * totalHours;
    const storageCost = plan.usageRates.storage * plan.storagePerSandbox * 1024 * concurrentSandboxes * totalHours;
    const usageCost = cpuCost + ramCost + storageCost;
    const total = plan.monthlyBase + usageCost;
    const selfHosted = SELF_HOSTED_COST_PER_SANDBOX_HOUR * concurrentSandboxes * totalHours;
    const savings = selfHosted - total;
    const savingsPct = selfHosted > 0 ? Math.round((savings / selfHosted) * 100) : 0;
    const feasible = concurrentSandboxes <= plan.maxConcurrent;
    return { ...plan, usageCost, total, selfHosted, savings, savingsPct, feasible };
  });

  const bestPlan = calcResults.filter((r) => r.feasible).sort((a, b) => a.total - b.total)[0];

  const openWebsite = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await WebBrowser.openBrowserAsync("https://www.scalebox.dev");
  };

  const openPricing = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await WebBrowser.openBrowserAsync("https://www.scalebox.dev/pricing");
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={[styles.headerLogo, { backgroundColor: colors.primary + "20" }]}>
            <Text style={styles.headerEmoji}>⚡</Text>
          </View>
          <View>
            <Text style={[styles.headerBrand, { color: colors.primary }]}>SCALEBOX</Text>
            <Text style={[styles.headerSub, { color: colors.muted }]}>AI 时代超轻量级沙盒基础设施</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.visitBtn, { backgroundColor: colors.primary }]}
          onPress={openWebsite}
          activeOpacity={0.8}
        >
          <Text style={styles.visitBtnText}>访问官网</Text>
          <IconSymbol name="arrow.up.right.square" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabItem,
                  isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabLabel, { color: isActive ? colors.primary : colors.muted }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <View>
            {/* Core Positioning */}
            <View style={[styles.positionCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.positionTitle, { color: colors.primary }]}>核心定位</Text>
              <Text style={[styles.positionText, { color: colors.foreground }]}>
                AI 专属的虚拟计算机。不同于传统代码执行器，ScaleBox 提供基于 <Text style={{ fontWeight: "800" }}>微虚拟机 (microVM)</Text> 的完整 Linux 环境，兼容 E2B API 接口，让 AI 在安全隔离环境中执行各种任务。
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              {[
                { value: "10K+", label: "活跃用户", color: colors.primary },
                { value: "50K+", label: "已创建沙盒", color: "#00D4AA" },
                { value: "99.9%", label: "正常运行时间", color: "#22C55E" },
                { value: "12", label: "全球区域", color: "#F59E0B" },
              ].map((s) => (
                <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Key Benefits */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>客户核心价值</Text>
              {[
                { icon: "💰", text: "省却数百万/年的持续开发投入" },
                { icon: "⚙️", text: "节省 95% 以上的运维成本" },
                { icon: "📈", text: "资源按需调用，按秒计费无浪费" },
                { icon: "🔒", text: "硬件级安全隔离，生产级合规" },
                { icon: "🚀", text: "毫秒级启动，AI 对话无感等待" },
              ].map((b) => (
                <View key={b.text} style={[styles.benefitRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={styles.benefitIcon}>{b.icon}</Text>
                  <Text style={[styles.benefitText, { color: colors.foreground }]}>{b.text}</Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>定价方案</Text>
              <View style={[styles.freeTrialBanner, { backgroundColor: "#22C55E" + "15", borderColor: "#22C55E" + "40" }]}>
                <Text style={styles.freeTrialEmoji}>🎁</Text>
                <Text style={[styles.freeTrialText, { color: colors.foreground }]}>
                  注册即赠 <Text style={{ color: "#22C55E", fontWeight: "800" }}>$100 代金券</Text>，立即免费测试
                </Text>
              </View>
              {PRICING_PLANS.map((plan) => (
                <View
                  key={plan.name}
                  style={[
                    styles.pricingCard,
                    { backgroundColor: colors.surface, borderColor: plan.highlight ? plan.color : colors.border },
                    plan.highlight && { borderWidth: 2 },
                  ]}
                >
                  {plan.highlight && (
                    <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                      <Text style={styles.popularText}>最受欢迎</Text>
                    </View>
                  )}
                  <View style={styles.planHeader}>
                    <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                    <View style={styles.planPriceRow}>
                      <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                      <Text style={[styles.planUnit, { color: colors.muted }]}>{plan.priceUnit}</Text>
                    </View>
                  </View>
                  {plan.features.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <IconSymbol name="checkmark.circle.fill" size={15} color={plan.color} />
                      <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[styles.planBtn, plan.highlight ? { backgroundColor: plan.color } : { borderWidth: 1, borderColor: plan.color }]}
                    onPress={openPricing}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.planBtnText, { color: plan.highlight ? "#FFF" : plan.color }]}>{plan.cta}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={[styles.enterpriseNote, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <IconSymbol name="person.2.fill" size={18} color={colors.primary} />
                <Text style={[styles.enterpriseText, { color: colors.muted }]}>
                  并发超过 400 后，可探讨<Text style={{ color: colors.primary, fontWeight: "700" }}>私有订阅方案</Text>，满足个性化业务需求
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Tech Tab ── */}
        {activeTab === "tech" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>六大技术特性</Text>
            {TECH_FEATURES.map((feat) => (
              <View key={feat.title} style={[styles.techCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.techCardHeader}>
                  <View style={[styles.techIcon, { backgroundColor: feat.color + "20" }]}>
                    <IconSymbol name={feat.icon as any} size={20} color={feat.color} />
                  </View>
                  <Text style={[styles.techTitle, { color: colors.foreground }]}>{feat.title}</Text>
                </View>
                {feat.points.map((pt, i) => (
                  <View key={i} style={styles.techPoint}>
                    <View style={[styles.techDot, { backgroundColor: feat.color }]} />
                    <Text style={[styles.techPointText, { color: colors.muted }]}>{pt}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Agent-specific features */}
            <View style={[styles.agentCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.agentCardTitle, { color: colors.primary }]}>🤖 Agent 专属能力</Text>
              {[
                "核心步骤可设定人工参与确认后执行，确保 Agent 执行确定性",
                "Agent 多任务并发执行，支持任意执行轨迹结果编辑",
                "人工干预强化学习（RLHF），持续优化 Agent 行为",
                "轨迹合成（TNR）支持模型训练数据生成",
              ].map((item, i) => (
                <View key={i} style={styles.agentPoint}>
                  <Text style={[styles.agentPointBullet, { color: colors.primary }]}>→</Text>
                  <Text style={[styles.agentPointText, { color: colors.foreground }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Compare Tab ── */}
        {activeTab === "compare" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>ScaleBox vs E2B</Text>

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}>
                <Text style={[styles.summaryCardTitle, { color: colors.primary }]}>ScaleBox 更优</Text>
                <Text style={[styles.summaryCardDesc, { color: colors.foreground }]}>
                  可定制、支持 GPU 或复杂环境的专业 AI 实验室/工作站场景
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.muted + "15", borderColor: colors.border }]}>
                <Text style={[styles.summaryCardTitle, { color: colors.muted }]}>E2B 更优</Text>
                <Text style={[styles.summaryCardDesc, { color: colors.foreground }]}>
                  毫秒响应的轻量代码执行插件场景（可通过预热策略弥补）
                </Text>
              </View>
            </View>

            {/* Comparison Table */}
            <View style={[styles.compareTable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.compareHeader, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.border }]}>
                <Text style={[styles.compareHeaderCell, { color: colors.muted, flex: 2 }]}>维度</Text>
                <Text style={[styles.compareHeaderCell, { color: colors.primary }]}>ScaleBox</Text>
                <Text style={[styles.compareHeaderCell, { color: colors.muted }]}>E2B</Text>
              </View>
              {COMPARE_ITEMS.map((item, idx) => (
                <View
                  key={item.dimension}
                  style={[
                    styles.compareRow,
                    { borderBottomColor: colors.border },
                    idx === COMPARE_ITEMS.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={{ flex: 2 }}>
                    <Text style={[styles.compareDimension, { color: colors.foreground }]}>{item.dimension}</Text>
                    <Text style={[styles.compareNote, { color: colors.muted }]}>{item.note}</Text>
                  </View>
                  <Text
                    style={[
                      styles.compareCell,
                      { color: item.winner === "scalebox" ? "#22C55E" : colors.muted },
                    ]}
                  >
                    {item.scalebox}
                  </Text>
                  <Text
                    style={[
                      styles.compareCell,
                      { color: item.winner === "e2b" ? "#22C55E" : colors.muted },
                    ]}
                  >
                    {item.e2b}
                  </Text>
                </View>
              ))}
            </View>

            {/* Usage-based pricing */}
            <View style={[styles.usageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.usageTitle, { color: colors.foreground }]}>按量计费参考</Text>
              {[
                { resource: "CPU", price: "$0.000014/CPU秒" },
                { resource: "RAM", price: "$0.0000045/GB/秒" },
                { resource: "代理流量", price: "$1.8/GB" },
                { resource: "沙盒存储", price: "免费" },
              ].map((row) => (
                <View key={row.resource} style={[styles.usageRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.usageResource, { color: colors.foreground }]}>{row.resource}</Text>
                  <Text style={[styles.usagePrice, { color: colors.primary }]}>{row.price}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Customers Tab ── */}
        {activeTab === "customers" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>目标客户分类</Text>

            <View style={[styles.marketNote, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "40" }]}>
              <Text style={[styles.marketNoteText, { color: colors.foreground }]}>
                <Text style={{ fontWeight: "800", color: colors.accent }}>所有 SaaS 都在转型为智能体</Text>，所有 App 都在植入 AI 或 Agent 化。各行业构建 Agent 的企业，都需要沙盒作为 AI 基础设施。
              </Text>
            </View>

            {CUSTOMER_SEGMENTS.map((seg) => (
              <View key={seg.title} style={[styles.customerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.customerCardHeader}>
                  <View style={[styles.customerIcon, { backgroundColor: seg.color + "20" }]}>
                    <IconSymbol name={seg.icon as any} size={22} color={seg.color} />
                  </View>
                  <Text style={[styles.customerTitle, { color: colors.foreground }]}>{seg.title}</Text>
                </View>
                <Text style={[styles.customerDesc, { color: colors.muted }]}>{seg.desc}</Text>
                <View style={styles.examplesRow}>
                  {seg.examples.map((ex) => (
                    <View key={ex} style={[styles.exampleChip, { backgroundColor: seg.color + "15" }]}>
                      <Text style={[styles.exampleChipText, { color: seg.color }]}>{ex}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* CTA */}
            <View style={[styles.ctaCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.ctaTitle, { color: colors.foreground }]}>立即开始</Text>
              <Text style={[styles.ctaDesc, { color: colors.muted }]}>
                访问 scalebox.dev 注册账号，赠送 $100 代金券，文档详细，三种订阅方案按需选择。并发超过 400 后可探讨私有化方案。
              </Text>
              <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: colors.primary }]} onPress={openWebsite} activeOpacity={0.8}>
                <Text style={styles.ctaBtnText}>免费注册领 $100</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Calculator Tab ── */}
        {activeTab === "calculator" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>并发计算器</Text>

            {/* Input Card */}
            <View style={[styles.calcCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.calcCardTitle, { color: colors.foreground }]}>输入你的使用场景</Text>

              {/* Concurrent Sandboxes */}
              <View style={styles.calcInputRow}>
                <View style={styles.calcInputLabel}>
                  <Text style={[styles.calcInputTitle, { color: colors.foreground }]}>并发沙盒数</Text>
                  <Text style={[styles.calcInputSub, { color: colors.muted }]}>同时运行的 Agent 数量</Text>
                </View>
                <View style={styles.calcStepper}>
                  <TouchableOpacity
                    style={[styles.stepBtn, { backgroundColor: colors.border }]}
                    onPress={() => setConcurrentSandboxes(Math.max(1, concurrentSandboxes - 10))}
                  >
                    <Text style={[styles.stepBtnText, { color: colors.foreground }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.stepValue, { color: colors.primary }]}>{concurrentSandboxes}</Text>
                  <TouchableOpacity
                    style={[styles.stepBtn, { backgroundColor: colors.border }]}
                    onPress={() => setConcurrentSandboxes(Math.min(400, concurrentSandboxes + 10))}
                  >
                    <Text style={[styles.stepBtnText, { color: colors.foreground }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Hours per day */}
              <View style={[styles.calcInputRow, { borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 12 }]}>
                <View style={styles.calcInputLabel}>
                  <Text style={[styles.calcInputTitle, { color: colors.foreground }]}>每日使用小时</Text>
                  <Text style={[styles.calcInputSub, { color: colors.muted }]}>平均每天运行时长</Text>
                </View>
                <View style={styles.calcStepper}>
                  <TouchableOpacity
                    style={[styles.stepBtn, { backgroundColor: colors.border }]}
                    onPress={() => setHoursPerDay(Math.max(1, hoursPerDay - 1))}
                  >
                    <Text style={[styles.stepBtnText, { color: colors.foreground }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.stepValue, { color: colors.primary }]}>{hoursPerDay}h</Text>
                  <TouchableOpacity
                    style={[styles.stepBtn, { backgroundColor: colors.border }]}
                    onPress={() => setHoursPerDay(Math.min(24, hoursPerDay + 1))}
                  >
                    <Text style={[styles.stepBtnText, { color: colors.foreground }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Days per month */}
              <View style={[styles.calcInputRow, { borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 12 }]}>
                <View style={styles.calcInputLabel}>
                  <Text style={[styles.calcInputTitle, { color: colors.foreground }]}>每月工作天数</Text>
                  <Text style={[styles.calcInputSub, { color: colors.muted }]}>每月预计使用天数</Text>
                </View>
                <View style={styles.calcStepper}>
                  <TouchableOpacity
                    style={[styles.stepBtn, { backgroundColor: colors.border }]}
                    onPress={() => setDaysPerMonth(Math.max(1, daysPerMonth - 1))}
                  >
                    <Text style={[styles.stepBtnText, { color: colors.foreground }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.stepValue, { color: colors.primary }]}>{daysPerMonth}天</Text>
                  <TouchableOpacity
                    style={[styles.stepBtn, { backgroundColor: colors.border }]}
                    onPress={() => setDaysPerMonth(Math.min(31, daysPerMonth + 1))}
                  >
                    <Text style={[styles.stepBtnText, { color: colors.foreground }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Summary */}
              <View style={[styles.calcSummary, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                <Text style={[styles.calcSummaryText, { color: colors.muted }]}>
                  每月总计：<Text style={{ color: colors.primary, fontWeight: "700" }}>{concurrentSandboxes} 沙盒 × {hoursPerDay}h × {daysPerMonth}天 = {(concurrentSandboxes * hoursPerDay * daysPerMonth).toLocaleString()} 沙盒小时</Text>
                </Text>
              </View>
            </View>

            {/* Results */}
            <Text style={[styles.calcResultTitle, { color: colors.muted }]}>方案对比</Text>
            {calcResults.map((result) => {
              const isBest = bestPlan?.name === result.name;
              return (
                <View
                  key={result.name}
                  style={[
                    styles.calcResultCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isBest ? result.color : colors.border,
                      borderWidth: isBest ? 2 : 0.5,
                    },
                  ]}
                >
                  {isBest && (
                    <View style={[styles.calcBestBadge, { backgroundColor: result.color }]}>
                      <Text style={styles.calcBestBadgeText}>★ 推荐方案</Text>
                    </View>
                  )}
                  <View style={styles.calcResultHeader}>
                    <View style={[styles.calcPlanDot, { backgroundColor: result.color }]} />
                    <Text style={[styles.calcPlanName, { color: colors.foreground }]}>{result.name}</Text>
                    <Text style={[styles.calcMaxConcurrent, { color: colors.muted }]}>最多 {result.maxConcurrent} 并发</Text>
                    {!result.feasible && (
                      <View style={[styles.calcOverLimit, { backgroundColor: colors.error + "20" }]}>
                        <Text style={[styles.calcOverLimitText, { color: colors.error }]}>超出限额</Text>
                      </View>
                    )}
                  </View>

                  {result.feasible ? (
                    <>
                      <View style={styles.calcCostRow}>
                        <View style={styles.calcCostItem}>
                          <Text style={[styles.calcCostLabel, { color: colors.muted }]}>月订阅费</Text>
                          <Text style={[styles.calcCostValue, { color: colors.foreground }]}>${result.monthlyBase.toFixed(2)}</Text>
                        </View>
                        <View style={styles.calcCostItem}>
                          <Text style={[styles.calcCostLabel, { color: colors.muted }]}>按量计费</Text>
                          <Text style={[styles.calcCostValue, { color: colors.foreground }]}>${result.usageCost.toFixed(2)}</Text>
                        </View>
                        <View style={styles.calcCostItem}>
                          <Text style={[styles.calcCostLabel, { color: colors.muted }]}>月总费用</Text>
                          <Text style={[styles.calcCostValue, { color: result.color, fontWeight: "800" }]}>${result.total.toFixed(2)}</Text>
                        </View>
                      </View>
                      <View style={[styles.calcRoiRow, { backgroundColor: result.color + "10", borderColor: result.color + "30" }]}>
                        <Text style={[styles.calcRoiLabel, { color: colors.muted }]}>自建基础设施估算</Text>
                        <Text style={[styles.calcRoiValue, { color: result.color }]}>${result.selfHosted.toFixed(0)}/月</Text>
                        <Text style={[styles.calcSavings, { color: result.savings > 0 ? "#22C55E" : colors.error }]}>
                          {result.savings > 0 ? `节省 $${result.savings.toFixed(0)} (${result.savingsPct}%)` : `超出 $${Math.abs(result.savings).toFixed(0)}`}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={[styles.calcOverLimitDesc, { color: colors.muted }]}>
                      当前并发数 ({concurrentSandboxes}) 超过 {result.name} 最大并发限制 ({result.maxConcurrent})，请升级方案或联系销售讨论私有化部署。
                    </Text>
                  )}
                </View>
              );
            })}

            {/* ROI Note */}
            <View style={[styles.calcNote, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.calcNoteTitle, { color: colors.foreground }]}>💡 ROI 说明</Text>
              <Text style={[styles.calcNoteText, { color: colors.muted }]}>
                自建估算基于 $0.05/沙盒小时（包含服务器租赁、运维、开发维护成本）。实际节省还包括：免去开发并发调度系统、安全隔离、弹性扩容等隐性成本。并发超过 400 后可探讨私有化方案。
              </Text>
              <TouchableOpacity
                style={[styles.calcNoteBtn, { backgroundColor: colors.primary }]}
                onPress={openWebsite}
                activeOpacity={0.8}
              >
                <Text style={styles.calcNoteBtnText}>免费注册领 $100 代金券</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerLogo: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerEmoji: { fontSize: 20 },
  headerBrand: { fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  headerSub: { fontSize: 12, marginTop: 1 },
  visitBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  visitBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  tabBar: { borderBottomWidth: 0.5 },
  tabBarContent: { paddingHorizontal: 12 },
  tabItem: { paddingHorizontal: 14, paddingVertical: 12, marginRight: 4 },
  tabLabel: { fontSize: 14, fontWeight: "600" },
  scrollContent: { paddingBottom: 20 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 14 },
  // Overview
  positionCard: { margin: 16, borderRadius: 14, padding: 16, borderWidth: 1, gap: 8 },
  positionTitle: { fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  positionText: { fontSize: 14, lineHeight: 22 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, paddingTop: 4, gap: 10 },
  statCard: { width: "47%", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1 },
  statValue: { fontSize: 24, fontWeight: "900" },
  statLabel: { fontSize: 12, marginTop: 3, textAlign: "center" },
  benefitRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8, gap: 10 },
  benefitIcon: { fontSize: 20 },
  benefitText: { fontSize: 14, fontWeight: "500", flex: 1 },
  freeTrialBanner: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 12, gap: 8 },
  freeTrialEmoji: { fontSize: 20 },
  freeTrialText: { fontSize: 14, flex: 1 },
  pricingCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 10, gap: 8, overflow: "hidden" },
  popularBadge: { position: "absolute", top: 0, right: 0, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 10 },
  popularText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  planHeader: { marginBottom: 4 },
  planName: { fontSize: 17, fontWeight: "800" },
  planPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 4 },
  planPrice: { fontSize: 26, fontWeight: "900" },
  planUnit: { fontSize: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  featureText: { fontSize: 13 },
  planBtn: { borderRadius: 10, paddingVertical: 11, alignItems: "center", marginTop: 4 },
  planBtnText: { fontSize: 14, fontWeight: "700" },
  enterpriseNote: { flexDirection: "row", alignItems: "flex-start", borderRadius: 12, padding: 14, borderWidth: 1, gap: 10, marginTop: 4 },
  enterpriseText: { fontSize: 13, flex: 1, lineHeight: 19 },
  // Tech
  techCard: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10, gap: 10 },
  techCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  techIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  techTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  techPoint: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingLeft: 4 },
  techDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  techPointText: { fontSize: 13, lineHeight: 19, flex: 1 },
  agentCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginTop: 6, gap: 10 },
  agentCardTitle: { fontSize: 15, fontWeight: "800" },
  agentPoint: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  agentPointBullet: { fontSize: 14, fontWeight: "700", marginTop: 1 },
  agentPointText: { fontSize: 13, lineHeight: 19, flex: 1 },
  // Compare
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryCard: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, gap: 6 },
  summaryCardTitle: { fontSize: 13, fontWeight: "800" },
  summaryCardDesc: { fontSize: 12, lineHeight: 17 },
  compareTable: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 14 },
  compareHeader: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 0.5 },
  compareHeaderCell: { flex: 1, fontSize: 12, fontWeight: "700", textAlign: "center" },
  compareRow: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 0.5, alignItems: "flex-start" },
  compareDimension: { fontSize: 13, fontWeight: "700" },
  compareNote: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  compareCell: { flex: 1, fontSize: 12, textAlign: "center", lineHeight: 17 },
  usageCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 0 },
  usageTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  usageRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderTopWidth: 0.5 },
  usageResource: { fontSize: 14, fontWeight: "600" },
  usagePrice: { fontSize: 14, fontWeight: "700" },
  // Customers
  marketNote: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 14 },
  marketNoteText: { fontSize: 14, lineHeight: 21 },
  customerCard: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10, gap: 10 },
  customerCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  customerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  customerTitle: { fontSize: 16, fontWeight: "700" },
  customerDesc: { fontSize: 13, lineHeight: 19 },
  examplesRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  exampleChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  exampleChipText: { fontSize: 12, fontWeight: "600" },
  ctaCard: { borderRadius: 16, padding: 20, borderWidth: 1, gap: 10, marginTop: 6, alignItems: "center" },
  ctaTitle: { fontSize: 20, fontWeight: "800" },
  ctaDesc: { fontSize: 13, lineHeight: 20, textAlign: "center" },
  ctaBtn: { paddingHorizontal: 24, paddingVertical: 13, borderRadius: 12, marginTop: 4 },
  ctaBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  // Calculator
  calcCard: { borderRadius: 16, borderWidth: 0.5, padding: 16, gap: 12, marginBottom: 16 },
  calcCardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  calcInputRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calcInputLabel: { flex: 1, gap: 2 },
  calcInputTitle: { fontSize: 14, fontWeight: "600" },
  calcInputSub: { fontSize: 11 },
  calcStepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  stepBtnText: { fontSize: 18, fontWeight: "700", lineHeight: 22 },
  stepValue: { fontSize: 16, fontWeight: "800", minWidth: 48, textAlign: "center" },
  calcSummary: { borderRadius: 10, padding: 10, borderWidth: 1, marginTop: 4 },
  calcSummaryText: { fontSize: 12, lineHeight: 18 },
  calcResultTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4 },
  calcResultCard: { borderRadius: 14, padding: 14, marginBottom: 10, overflow: "hidden", gap: 10 },
  calcBestBadge: { position: "absolute", top: 0, right: 0, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 10 },
  calcBestBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  calcResultHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  calcPlanDot: { width: 10, height: 10, borderRadius: 5 },
  calcPlanName: { fontSize: 16, fontWeight: "800", flex: 1 },
  calcMaxConcurrent: { fontSize: 12 },
  calcOverLimit: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  calcOverLimitText: { fontSize: 11, fontWeight: "700" },
  calcOverLimitDesc: { fontSize: 13, lineHeight: 19 },
  calcCostRow: { flexDirection: "row", gap: 0 },
  calcCostItem: { flex: 1, alignItems: "center", gap: 3 },
  calcCostLabel: { fontSize: 11 },
  calcCostValue: { fontSize: 15, fontWeight: "700" },
  calcRoiRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, padding: 10, borderWidth: 1, gap: 8 },
  calcRoiLabel: { fontSize: 11, flex: 1 },
  calcRoiValue: { fontSize: 13, fontWeight: "700" },
  calcSavings: { fontSize: 12, fontWeight: "700" },
  calcNote: { borderRadius: 14, borderWidth: 0.5, padding: 16, gap: 10, marginTop: 4 },
  calcNoteTitle: { fontSize: 15, fontWeight: "700" },
  calcNoteText: { fontSize: 13, lineHeight: 20 },
  calcNoteBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  calcNoteBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
});
