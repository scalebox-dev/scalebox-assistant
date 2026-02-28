import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
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
import { Customer, CustomerStage, STAGE_INFO, useCustomers } from "@/hooks/use-customers";

const STAGE_FILTERS: Array<{ key: CustomerStage | "all"; label: string }> = [
  { key: "all", label: "全部" },
  { key: "initial_contact", label: "初接触" },
  { key: "demo", label: "演示中" },
  { key: "proposal", label: "报价中" },
  { key: "closed_won", label: "已成交" },
  { key: "closed_lost", label: "已流失" },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function CustomerCard({
  customer,
  colors,
  onPress,
  onDelete,
}: {
  customer: Customer;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
  onDelete: () => void;
}) {
  const stageInfo = STAGE_INFO[customer.stage];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
      onLongPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert("删除客户", `确定删除 ${customer.companyName} 吗？`, [
          { text: "取消", style: "cancel" },
          { text: "删除", style: "destructive", onPress: onDelete },
        ]);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.avatar, { backgroundColor: stageInfo.bgColor }]}>
            <Text style={[styles.avatarText, { color: stageInfo.color }]}>
              {customer.companyName.charAt(0)}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.companyName, { color: colors.foreground }]} numberOfLines={1}>
              {customer.companyName}
            </Text>
            <Text style={[styles.contactName, { color: colors.muted }]} numberOfLines={1}>
              {customer.contactName}
              {customer.title ? ` · ${customer.title}` : ""}
            </Text>
          </View>
        </View>
        <View style={[styles.stageBadge, { backgroundColor: stageInfo.bgColor }]}>
          <Text style={[styles.stageText, { color: stageInfo.color }]}>{stageInfo.label}</Text>
        </View>
      </View>

      {customer.notes ? (
        <Text style={[styles.notes, { color: colors.muted }]} numberOfLines={2}>
          {customer.notes}
        </Text>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          {customer.industry ? (
            <View style={[styles.industryTag, { backgroundColor: colors.border }]}>
              <Text style={[styles.industryText, { color: colors.muted }]}>
                {customer.industry}
              </Text>
            </View>
          ) : null}
          {customer.followUps.length > 0 ? (
            <View style={styles.followUpCount}>
              <IconSymbol name="clock" size={11} color={colors.muted} />
              <Text style={[styles.followUpText, { color: colors.muted }]}>
                {customer.followUps.length} 条记录
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.updatedAt, { color: colors.muted }]}>
          {formatDate(customer.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CustomersScreen() {
  const colors = useColors();
  const { customers, loading, deleteCustomer } = useCustomers();
  const [selectedStage, setSelectedStage] = useState<CustomerStage | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const searchFiltered = searchQuery.trim()
    ? customers.filter((c) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          c.companyName.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          (c.industry && c.industry.toLowerCase().includes(q)) ||
          (c.title && c.title.toLowerCase().includes(q))
        );
      })
    : customers;

  const filteredCustomers =
    selectedStage === "all"
      ? searchFiltered
      : searchFiltered.filter((c) => c.stage === selectedStage);

  const stageCounts = STAGE_FILTERS.reduce(
    (acc, f) => {
      acc[f.key] =
        f.key === "all"
          ? customers.length
          : customers.filter((c) => c.stage === f.key).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>客户跟进</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            共 {customers.length} 位客户
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/customer-form" as any);
          }}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
          <Text style={styles.addBtnText}>新增</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="搜索公司名、联系人、行业..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IconSymbol name="xmark.circle.fill" size={16} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stage Filter */}
      <FlatList
        data={STAGE_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        style={styles.filterList}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item }) => {
          const isActive = selectedStage === item.key;
          const stageColor =
            item.key === "all" ? colors.primary : STAGE_INFO[item.key as CustomerStage]?.color ?? colors.primary;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? stageColor + "20" : colors.surface,
                  borderColor: isActive ? stageColor : colors.border,
                },
              ]}
              onPress={() => setSelectedStage(item.key as CustomerStage | "all")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isActive ? stageColor : colors.muted },
                ]}
              >
                {item.label}
              </Text>
              {stageCounts[item.key] > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    { backgroundColor: isActive ? stageColor : colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      { color: isActive ? "#fff" : colors.muted },
                    ]}
                  >
                    {stageCounts[item.key]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Customer List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>加载中...</Text>
        </View>
      ) : filteredCustomers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{searchQuery.trim() ? "🔍" : "👥"}</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {searchQuery.trim()
              ? `未找到「${searchQuery}」相关客户`
              : selectedStage === "all"
                ? "还没有客户"
                : "该阶段暂无客户"}
          </Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {searchQuery.trim()
              ? "尝试搜索公司名、联系人姓名或行业关键词"
              : selectedStage === "all"
                ? "点击右上角「新增」添加第一位客户"
                : "切换其他阶段或新增客户"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CustomerCard
              customer={item}
              colors={colors}
              onPress={() => router.push(`/customer-detail?id=${item.id}` as any)}
              onDelete={() => deleteCustomer(item.id)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterList: {
    maxHeight: 52,
    borderBottomWidth: 0.5,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  listContent: {
    padding: 12,
    gap: 10,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: "600",
  },
  contactName: {
    fontSize: 13,
    marginTop: 2,
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  stageText: {
    fontSize: 12,
    fontWeight: "600",
  },
  notes: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  industryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  industryText: {
    fontSize: 11,
  },
  followUpCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  followUpText: {
    fontSize: 11,
  },
  updatedAt: {
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
