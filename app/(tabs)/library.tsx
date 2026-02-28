import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useFavorites } from "@/hooks/use-favorites";
import {
  CATEGORY_INFO,
  PROMPTS,
  PromptCategory,
  PromptTemplate,
  getPromptsByCategory,
  searchPrompts,
} from "@/lib/prompts-data";

const CATEGORIES: PromptCategory[] = [
  "customer_research",
  "scalebox_pitch",
  "email_templates",
  "role_play",
  "architecture",
  "pricing_roi",
  "competitive",
  "agent_scenarios",
];

export default function LibraryScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | "all">(
    (params.category as PromptCategory) || "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { addFavorite, addToHistory, isFavorite } = useFavorites();

  const filteredPrompts = useMemo(() => {
    if (searchQuery.trim()) {
      return searchPrompts(searchQuery);
    }
    if (selectedCategory === "all") return PROMPTS;
    return getPromptsByCategory(selectedCategory);
  }, [selectedCategory, searchQuery]);

  const handleCopyPrompt = useCallback(
    async (prompt: PromptTemplate) => {
      await Clipboard.setStringAsync(prompt.template);
      await addToHistory({
        promptId: prompt.id,
        title: prompt.title,
        category: prompt.category,
        content: prompt.template,
      });
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("已复制", "提示词已复制到剪贴板");
    },
    [addToHistory],
  );

  const handleFavorite = useCallback(
    async (prompt: PromptTemplate) => {
      await addFavorite({
        promptId: prompt.id,
        title: prompt.title,
        category: prompt.category,
        content: prompt.template,
      });
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [addFavorite],
  );

  const handleUseInGenerator = useCallback(
    (prompt: PromptTemplate) => {
      router.push({ pathname: "/(tabs)/generate" as any, params: { promptId: prompt.id } });
    },
    [],
  );

  const renderPrompt = useCallback(
    ({ item }: { item: PromptTemplate }) => {
      const catInfo = CATEGORY_INFO[item.category];
      const favorited = isFavorite(item.id, item.template);
      return (
        <View style={[styles.promptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.promptHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: catInfo.color + "20" }]}>
              <Text style={[styles.categoryBadgeText, { color: catInfo.color }]}>{catInfo.label}</Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={() => handleFavorite(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconSymbol
                name={favorited ? "heart.fill" : "heart"}
                size={20}
                color={favorited ? "#EF4444" : colors.muted}
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.promptTitle, { color: colors.foreground }]}>{item.title}</Text>
          <Text style={[styles.promptDesc, { color: colors.muted }]}>{item.description}</Text>
          <View style={[styles.templateBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={[styles.templateText, { color: colors.foreground }]} numberOfLines={4}>
              {item.template}
            </Text>
          </View>
          {item.variables.length > 0 && (
            <View style={styles.variablesRow}>
              <Text style={[styles.variablesLabel, { color: colors.muted }]}>变量：</Text>
              {item.variables.map((v) => (
                <View key={v} style={[styles.variableChip, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.variableChipText, { color: colors.primary }]}>[{v}]</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.promptActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary, { borderColor: colors.border }]}
              onPress={() => handleCopyPrompt(item)}
              activeOpacity={0.75}
            >
              <IconSymbol name="doc.on.clipboard" size={16} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>复制</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary, { backgroundColor: colors.primary }]}
              onPress={() => handleUseInGenerator(item)}
              activeOpacity={0.75}
            >
              <IconSymbol name="wand.and.stars" size={16} color="#FFFFFF" />
              <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>AI 生成</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [colors, isFavorite, handleCopyPrompt, handleFavorite, handleUseInGenerator],
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>提示词库</Text>
        <Text style={[styles.headerCount, { color: colors.muted }]}>{filteredPrompts.length} 个提示词</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="搜索提示词..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      {!searchQuery && (
        <View style={[styles.tabsWrapper, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <FlatList
            horizontal
            data={["all", ...CATEGORIES] as (PromptCategory | "all")[]}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsList}
            renderItem={({ item }) => {
              const isActive = selectedCategory === item;
              const label = item === "all" ? "全部" : CATEGORY_INFO[item].label;
              const color = item === "all" ? colors.primary : CATEGORY_INFO[item].color;
              return (
                <TouchableOpacity
                  style={[
                    styles.tab,
                    isActive && { backgroundColor: color + "20", borderColor: color },
                    !isActive && { borderColor: colors.border },
                  ]}
                  onPress={() => setSelectedCategory(item)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabText, { color: isActive ? color : colors.muted }]}>{label}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* Prompts List */}
      <FlatList
        data={filteredPrompts}
        keyExtractor={(item) => item.id}
        renderItem={renderPrompt}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>没有找到匹配的提示词</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  headerCount: {
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  tabsWrapper: {
    borderBottomWidth: 0.5,
  },
  tabsList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
  },
  promptCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  promptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  favoriteBtn: {
    padding: 4,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  promptDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  templateBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  templateText: {
    fontSize: 13,
    lineHeight: 20,
  },
  variablesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  variablesLabel: {
    fontSize: 12,
  },
  variableChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  variableChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  promptActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnPrimary: {},
  actionBtnSecondary: {
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});
