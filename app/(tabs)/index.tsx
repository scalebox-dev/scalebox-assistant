import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useFavorites } from "@/hooks/use-favorites";
import { CATEGORY_INFO, PromptCategory } from "@/lib/prompts-data";

const CATEGORIES: PromptCategory[] = [
  "customer_research",
  "scalebox_pitch",
  "email_templates",
  "role_play",
  "architecture",
  "pricing_roi",
];

export default function HomeScreen() {
  const colors = useColors();
  const { favorites, history } = useFavorites();

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.brandName, { color: colors.primary }]}>ScaleBox</Text>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>销售智能体</Text>
            </View>
            <View style={[styles.logoBox, { backgroundColor: colors.primary + "20" }]}>
              <Text style={styles.logoEmoji}>⚡</Text>
            </View>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            AI 时代超轻量级沙盒基础设施 · 毫秒级启动 · 按秒计费
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="提示词模板" value="50+" color={colors.primary} colors={colors} />
          <StatCard label="已保存收藏" value={String(favorites.length)} color="#00D4AA" colors={colors} />
          <StatCard label="使用历史" value={String(history.length)} color="#F59E0B" colors={colors} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>快速操作</Text>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="wand.and.stars"
              label="AI 生成"
              color="#6C47FF"
              onPress={() => router.push("/(tabs)/generate" as any)}
              colors={colors}
            />
            <QuickActionButton
              icon="book.fill"
              label="浏览提示词"
              color="#00D4AA"
              onPress={() => router.push("/(tabs)/library" as any)}
              colors={colors}
            />
            <QuickActionButton
              icon="heart.fill"
              label="我的收藏"
              color="#EF4444"
              onPress={() => router.push("/favorites" as any)}
              colors={colors}
            />
            <QuickActionButton
              icon="info.circle.fill"
              label="产品信息"
              color="#8B5CF6"
              onPress={() => router.push("/(tabs)/product" as any)}
              colors={colors}
            />
          </View>
        </View>

        {/* Category Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>提示词分类</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const info = CATEGORY_INFO[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: "/(tabs)/library" as any, params: { category: cat } })}
                  activeOpacity={0.75}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: info.color + "20" }]}>
                    <IconSymbol name={info.icon as any} size={22} color={info.color} />
                  </View>
                  <Text style={[styles.categoryLabel, { color: colors.foreground }]}>{info.label}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.muted }]} numberOfLines={2}>
                    {info.description}
                  </Text>
                  <View style={styles.categoryArrow}>
                    <IconSymbol name="chevron.right" size={16} color={colors.muted} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent History */}
        {history.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>最近使用</Text>
              <TouchableOpacity onPress={() => router.push("/favorites" as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>查看全部</Text>
              </TouchableOpacity>
            </View>
            {history.slice(0, 3).map((item) => (
              <View
                key={item.id}
                style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.historyCardHeader}>
                  <Text style={[styles.historyTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.historyTime, { color: colors.muted }]}>
                    {new Date(item.savedAt).toLocaleDateString("zh-CN")}
                  </Text>
                </View>
                <Text style={[styles.historyContent, { color: colors.muted }]} numberOfLines={2}>
                  {item.content}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ScaleBox Tagline */}
        <View style={[styles.taglineCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
          <Text style={[styles.taglineTitle, { color: colors.primary }]}>🚀 ScaleBox 核心优势</Text>
          <Text style={[styles.taglineText, { color: colors.foreground }]}>
            毫秒级启动 · 按秒计费 · 10K+ 活跃用户 · 99.9% 正常运行时间 · 12 个全球区域
          </Text>
          <TouchableOpacity
            style={[styles.taglineBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/product" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.taglineBtnText}>了解更多</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value: string;
  color: string;
  colors: any;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function QuickActionButton({
  icon,
  label,
  color,
  onPress,
  colors,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + "20" }]}>
        <IconSymbol name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  brandName: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 26,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickAction: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    gap: 8,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoryGrid: {
    gap: 10,
  },
  categoryCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  categoryDesc: {
    fontSize: 12,
    flex: 2,
    lineHeight: 16,
  },
  categoryArrow: {
    marginLeft: 4,
  },
  historyCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  historyTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  historyContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  taglineCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 8,
  },
  taglineTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  taglineText: {
    fontSize: 13,
    lineHeight: 20,
  },
  taglineBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  taglineBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
