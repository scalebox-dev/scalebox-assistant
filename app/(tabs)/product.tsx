import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const PILLARS = [
  {
    icon: "lock.fill",
    title: "安全 (Secure)",
    color: "#6C47FF",
    desc: "API 密钥认证、基于角色的访问控制（Admin/Root/Non-root）、不可变审计追踪，生产级安全从底层构建。",
  },
  {
    icon: "bolt.fill",
    title: "即时 (Instant)",
    color: "#00D4AA",
    desc: "毫秒级沙盒启动，预配置模板即开即用。从请求到生产力，以毫秒计，而非分钟。",
  },
  {
    icon: "chart.bar.fill",
    title: "可扩展 (Scalable)",
    color: "#F59E0B",
    desc: "双引擎架构（用量分析 + 计费计算），水平扩展，事件溯源基础支持无限增长。",
  },
  {
    icon: "star.fill",
    title: "透明 (Transparent)",
    color: "#22C55E",
    desc: "按秒计费，秒级精度。实时成本监控和告警，无隐藏费用，完全可见的用量和成本。",
  },
  {
    icon: "sparkles",
    title: "现代 (Modern)",
    color: "#EF4444",
    desc: "开发者优先的 CLI 工具和 API，AI 就绪基础设施模式，事件溯源架构（非传统数据库）。",
  },
];

const PRICING_PLANS = [
  {
    name: "Hobby",
    price: "免费",
    priceEn: "Free",
    color: "#6B7280",
    highlight: false,
    features: [
      "20 并发沙盒",
      "8 CPU 核心/沙盒",
      "8GB RAM/沙盒",
      "2GB 存储/沙盒",
      "1 小时运行时长",
      "30 天沙盒持久化",
    ],
    cta: "免费开始",
  },
  {
    name: "Pro",
    price: "$99.99",
    priceEn: "/月",
    color: "#6C47FF",
    highlight: true,
    features: [
      "100 并发沙盒",
      "8 CPU 核心/沙盒",
      "16GB RAM/沙盒",
      "8GB 存储/沙盒",
      "1 天运行时长",
      "30 天沙盒持久化",
    ],
    cta: "开始试用",
  },
  {
    name: "Ultimate",
    price: "$199.99",
    priceEn: "/月",
    color: "#00D4AA",
    highlight: false,
    features: [
      "400 并发沙盒",
      "16 CPU 核心/沙盒",
      "16GB RAM/沙盒",
      "16GB 存储/沙盒",
      "2 天运行时长",
      "30 天沙盒持久化",
    ],
    cta: "联系销售",
  },
];

const USE_CASES = [
  { icon: "wand.and.stars", title: "AI 开发", desc: "即时 ML/AI 工作负载环境，预配置依赖项", color: "#6C47FF" },
  { icon: "bolt.fill", title: "快速原型", desc: "预配置模板，毫秒级部署，快速迭代", color: "#00D4AA" },
  { icon: "person.2.fill", title: "团队协作", desc: "共享环境，实时更新，基于角色的访问控制", color: "#F59E0B" },
  { icon: "gear", title: "CI/CD 集成", desc: "自动化环境配置，透明按秒计费", color: "#EF4444" },
];

export default function ProductScreen() {
  const colors = useColors();

  const openWebsite = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await WebBrowser.openBrowserAsync("https://www.scalebox.dev");
  };

  const openPricing = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await WebBrowser.openBrowserAsync("https://www.scalebox.dev/pricing");
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary + "15" }]}>
          <View style={[styles.heroLogo, { backgroundColor: colors.primary + "25" }]}>
            <Text style={styles.heroEmoji}>⚡</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>ScaleBox</Text>
          <Text style={[styles.heroTagline, { color: colors.primary }]}>
            Ultra-lightweight infrastructure for the AI era
          </Text>
          <Text style={[styles.heroDesc, { color: colors.muted }]}>
            AI 时代的超轻量级基础设施平台。从即时沙盒到透明计费，让您专注于构建，而非管理基础设施。
          </Text>
          <TouchableOpacity
            style={[styles.heroBtn, { backgroundColor: colors.primary }]}
            onPress={openWebsite}
            activeOpacity={0.8}
          >
            <Text style={styles.heroBtnText}>访问 scalebox.dev</Text>
            <IconSymbol name="arrow.up.right.square" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { value: "10K+", label: "活跃用户", color: colors.primary },
            { value: "50K+", label: "已创建沙盒", color: "#00D4AA" },
            { value: "99.9%", label: "正常运行时间", color: "#22C55E" },
            { value: "12", label: "全球区域", color: "#F59E0B" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* 5 Pillars */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>五大核心支柱</Text>
          {PILLARS.map((pillar) => (
            <View
              key={pillar.title}
              style={[styles.pillarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.pillarIcon, { backgroundColor: pillar.color + "20" }]}>
                <IconSymbol name={pillar.icon as any} size={22} color={pillar.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pillarTitle, { color: colors.foreground }]}>{pillar.title}</Text>
                <Text style={[styles.pillarDesc, { color: colors.muted }]}>{pillar.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Use Cases */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>适用场景</Text>
          <View style={styles.useCaseGrid}>
            {USE_CASES.map((uc) => (
              <View
                key={uc.title}
                style={[styles.useCaseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.useCaseIcon, { backgroundColor: uc.color + "20" }]}>
                  <IconSymbol name={uc.icon as any} size={20} color={uc.color} />
                </View>
                <Text style={[styles.useCaseTitle, { color: colors.foreground }]}>{uc.title}</Text>
                <Text style={[styles.useCaseDesc, { color: colors.muted }]}>{uc.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>定价方案</Text>
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
                  <Text style={styles.popularBadgeText}>最受欢迎</Text>
                </View>
              )}
              <View style={styles.pricingHeader}>
                <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                  <Text style={[styles.planPriceUnit, { color: colors.muted }]}>{plan.priceEn}</Text>
                </View>
              </View>
              {plan.features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color={plan.color} />
                  <Text style={[styles.featureText, { color: colors.foreground }]}>{feature}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={[
                  styles.planBtn,
                  plan.highlight
                    ? { backgroundColor: plan.color }
                    : { borderWidth: 1, borderColor: plan.color },
                ]}
                onPress={openPricing}
                activeOpacity={0.8}
              >
                <Text style={[styles.planBtnText, { color: plan.highlight ? "#FFFFFF" : plan.color }]}>
                  {plan.cta}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Usage-Based Pricing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>按量计费</Text>
          <View style={[styles.usageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.usageNote, { color: colors.muted }]}>
              所有用量按秒计费，无最低消费
            </Text>
            {[
              { resource: "CPU", price: "$0.000014/CPU秒", unit: "按秒" },
              { resource: "RAM", price: "$0.0000045/GB/秒", unit: "按秒" },
              { resource: "沙盒存储", price: "免费", unit: "-" },
              { resource: "模板存储", price: "$0.000001/GB/秒", unit: "按秒" },
              { resource: "代理流量", price: "$1.8/GB", unit: "按量" },
            ].map((row) => (
              <View key={row.resource} style={[styles.usageRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.usageResource, { color: colors.foreground }]}>{row.resource}</Text>
                <Text style={[styles.usagePrice, { color: colors.primary }]}>{row.price}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.ctaSection, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
          <Text style={[styles.ctaTitle, { color: colors.foreground }]}>准备好开始了吗？</Text>
          <Text style={[styles.ctaDesc, { color: colors.muted }]}>
            加入数千名已在使用 ScaleBox 更快构建的开发者
          </Text>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={openWebsite}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaBtnText}>免费开始使用</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  hero: {
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  heroLogo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  heroTagline: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  heroDesc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  heroBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    width: "47%",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  pillarCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
  },
  pillarIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pillarTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  pillarDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  useCaseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  useCaseCard: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  useCaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  useCaseTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  useCaseDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  pricingCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
    overflow: "hidden",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  popularBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  pricingHeader: {
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: "800",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    marginTop: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "900",
  },
  planPriceUnit: {
    fontSize: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
  planBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  planBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  usageCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 0,
  },
  usageNote: {
    fontSize: 13,
    marginBottom: 12,
    fontStyle: "italic",
  },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 0.5,
  },
  usageResource: {
    fontSize: 14,
    fontWeight: "600",
  },
  usagePrice: {
    fontSize: 14,
    fontWeight: "700",
  },
  ctaSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  ctaDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  ctaBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  ctaBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
