import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { SavedItem, useFavorites } from "@/hooks/use-favorites";
import { CATEGORY_INFO } from "@/lib/prompts-data";

export default function FavoritesScreen() {
  const colors = useColors();
  const { favorites, history, removeFavorite, clearHistory } = useFavorites();

  const handleCopy = async (content: string) => {
    await Clipboard.setStringAsync(content);
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("已复制", "内容已复制到剪贴板");
  };

  const handleRemoveFavorite = (id: string) => {
    Alert.alert("删除收藏", "确定要删除这条收藏吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: () => removeFavorite(id),
      },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert("清空历史", "确定要清空所有使用历史吗？", [
      { text: "取消", style: "cancel" },
      { text: "清空", style: "destructive", onPress: clearHistory },
    ]);
  };

  const renderItem = ({ item, isHistory }: { item: SavedItem; isHistory?: boolean }) => {
    const catInfo = CATEGORY_INFO[item.category as keyof typeof CATEGORY_INFO];
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.catBadge, { backgroundColor: catInfo?.color + "20" || "#6C47FF20" }]}>
            <Text style={[styles.catBadgeText, { color: catInfo?.color || "#6C47FF" }]}>
              {catInfo?.label || item.category}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.muted }]}>
            {new Date(item.savedAt).toLocaleDateString("zh-CN")}
          </Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={[styles.cardContent, { color: colors.muted }]} numberOfLines={3}>
          {item.content}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border }]}
            onPress={() => handleCopy(item.content)}
          >
            <IconSymbol name="doc.on.clipboard" size={16} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>复制</Text>
          </TouchableOpacity>
          {!isHistory && (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.border }]}
              onPress={() => handleRemoveFavorite(item.id)}
            >
              <IconSymbol name="trash" size={16} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>删除</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>收藏与历史</Text>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View>
            {/* Favorites */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  我的收藏 ({favorites.length})
                </Text>
              </View>
              {favorites.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <IconSymbol name="heart" size={32} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.muted }]}>暂无收藏</Text>
                  <Text style={[styles.emptyHint, { color: colors.muted }]}>
                    在提示词库中点击心形图标即可收藏
                  </Text>
                </View>
              ) : (
                favorites.map((item) => (
                  <View key={item.id} style={{ marginBottom: 10 }}>
                    {renderItem({ item, isHistory: false })}
                  </View>
                ))
              )}
            </View>

            {/* History */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  使用历史 ({history.length})
                </Text>
                {history.length > 0 && (
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={[styles.clearBtn, { color: "#EF4444" }]}>清空</Text>
                  </TouchableOpacity>
                )}
              </View>
              {history.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <IconSymbol name="clock" size={32} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.muted }]}>暂无使用历史</Text>
                </View>
              ) : (
                history.map((item) => (
                  <View key={item.id} style={{ marginBottom: 10 }}>
                    {renderItem({ item, isHistory: true })}
                  </View>
                ))
              )}
            </View>
            <View style={{ height: 30 }} />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
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
  },
  clearBtn: {
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardContent: {
    fontSize: 13,
    lineHeight: 19,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    borderRadius: 14,
    padding: 32,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyHint: {
    fontSize: 13,
    textAlign: "center",
  },
});
