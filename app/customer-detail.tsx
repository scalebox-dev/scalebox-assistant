import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CustomerStage, FollowUpRecord, STAGE_INFO, useCustomers } from "@/hooks/use-customers";
import { CATEGORY_INFO, PROMPTS, PromptTemplate } from "@/lib/prompts-data";

// Industry → recommended prompt categories mapping
const INDUSTRY_PROMPT_MAP: Record<string, string[]> = {
  "AI 智能体": ["agent_scenarios", "architecture", "scalebox_pitch"],
  "行业 ISV": ["scalebox_pitch", "pricing_roi", "architecture"],
  "企业客户": ["customer_research", "email_templates", "pricing_roi"],
  "开发者": ["architecture", "agent_scenarios", "competitive"],
  "金融": ["customer_research", "scalebox_pitch", "pricing_roi"],
  "医疗": ["customer_research", "scalebox_pitch", "pricing_roi"],
  "教育": ["customer_research", "scalebox_pitch", "email_templates"],
  "电商": ["customer_research", "scalebox_pitch", "pricing_roi"],
  "制造": ["architecture", "scalebox_pitch", "pricing_roi"],
};

function getRecommendedPrompts(industry: string, stage: CustomerStage): PromptTemplate[] {
  // Stage-based category priority
  const stageCats: Record<CustomerStage, string[]> = {
    initial_contact: ["customer_research", "email_templates"],
    demo: ["scalebox_pitch", "architecture", "role_play"],
    proposal: ["pricing_roi", "competitive", "email_templates"],
    closed_won: ["email_templates"],
    closed_lost: ["role_play", "competitive"],
  };
  // Merge industry + stage categories, deduplicate
  const industryCats = INDUSTRY_PROMPT_MAP[industry] ?? ["scalebox_pitch", "customer_research"];
  const stageCatsForStage = stageCats[stage] ?? [];
  const allCats = [...new Set([...stageCatsForStage, ...industryCats])];
  // Pick up to 2 prompts per category, max 6 total
  const results: PromptTemplate[] = [];
  for (const cat of allCats) {
    const catPrompts = PROMPTS.filter((p) => p.category === cat).slice(0, 2);
    results.push(...catPrompts);
    if (results.length >= 6) break;
  }
  return results.slice(0, 6);
}

const FOLLOW_UP_TYPES: Array<{
  key: FollowUpRecord["type"];
  label: string;
  icon: string;
}> = [
  { key: "call", label: "电话", icon: "📞" },
  { key: "email", label: "邮件", icon: "📧" },
  { key: "meeting", label: "会议", icon: "🤝" },
  { key: "note", label: "备注", icon: "📝" },
];

const STAGES: CustomerStage[] = [
  "initial_contact",
  "demo",
  "proposal",
  "closed_won",
  "closed_lost",
];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function CustomerDetailScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string }>();
  const { getCustomerById, updateStage, addFollowUp, deleteCustomer } = useCustomers();

  const customer = getCustomerById(params.id);

  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpContent, setFollowUpContent] = useState("");
  const [followUpType, setFollowUpType] = useState<FollowUpRecord["type"]>("note");
  const [showStageModal, setShowStageModal] = useState(false);

  const recommendedPrompts = useMemo(
    () => (customer ? getRecommendedPrompts(customer.industry, customer.stage) : []),
    [customer?.industry, customer?.stage],
  );

  const handleUsePrompt = (prompt: PromptTemplate) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to AI generator with promptId and pre-fill company name
    router.push({
      pathname: "/(tabs)/generate" as any,
      params: {
        promptId: prompt.id,
        prefillCompany: customer?.companyName ?? "",
        prefillContact: customer?.contactName ?? "",
      },
    });
  };

  if (!customer) {
    return (
      <ScreenContainer>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.muted }]}>客户不存在</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.primary }}>返回</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const stageInfo = STAGE_INFO[customer.stage];

  const handleAddFollowUp = async () => {
    if (!followUpContent.trim()) return;
    await addFollowUp(customer.id, { content: followUpContent.trim(), type: followUpType });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFollowUpContent("");
    setShowAddFollowUp(false);
  };

  const handleDelete = () => {
    Alert.alert("删除客户", `确定删除 ${customer.companyName} 吗？此操作不可恢复。`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          await deleteCustomer(customer.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>返回</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {customer.companyName}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push(`/customer-form?id=${customer.id}` as any)}
              style={styles.headerBtn}
            >
              <IconSymbol name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
              <IconSymbol name="trash" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.profileTop}>
              <View style={[styles.avatar, { backgroundColor: stageInfo.bgColor }]}>
                <Text style={[styles.avatarText, { color: stageInfo.color }]}>
                  {customer.companyName.charAt(0)}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.companyName, { color: colors.foreground }]}>
                  {customer.companyName}
                </Text>
                <Text style={[styles.contactInfo, { color: colors.muted }]}>
                  {customer.contactName}
                  {customer.title ? ` · ${customer.title}` : ""}
                </Text>
                {customer.industry ? (
                  <View style={[styles.industryTag, { backgroundColor: colors.border }]}>
                    <Text style={[styles.industryText, { color: colors.muted }]}>
                      {customer.industry}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Contact Details */}
            {(customer.phone || customer.email) && (
              <View style={[styles.contactDetails, { borderTopColor: colors.border }]}>
                {customer.phone ? (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => {
                      Clipboard.setStringAsync(customer.phone);
                      Alert.alert("已复制", "电话号码已复制到剪贴板");
                    }}
                  >
                    <IconSymbol name="phone.fill" size={14} color={colors.muted} />
                    <Text style={[styles.contactText, { color: colors.foreground }]}>
                      {customer.phone}
                    </Text>
                    <IconSymbol name="doc.on.doc" size={12} color={colors.muted} />
                  </TouchableOpacity>
                ) : null}
                {customer.email ? (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => {
                      Clipboard.setStringAsync(customer.email);
                      Alert.alert("已复制", "邮箱已复制到剪贴板");
                    }}
                  >
                    <IconSymbol name="envelope.fill" size={14} color={colors.muted} />
                    <Text style={[styles.contactText, { color: colors.foreground }]}>
                      {customer.email}
                    </Text>
                    <IconSymbol name="doc.on.doc" size={12} color={colors.muted} />
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>

          {/* Stage Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>跟进阶段</Text>
            <TouchableOpacity
              style={[
                styles.stageSelector,
                { backgroundColor: stageInfo.bgColor, borderColor: stageInfo.color },
              ]}
              onPress={() => setShowStageModal(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.stageSelectorText, { color: stageInfo.color }]}>
                {stageInfo.label}
              </Text>
              <IconSymbol name="chevron.right" size={16} color={stageInfo.color} />
            </TouchableOpacity>

            {/* Stage Progress Bar */}
            <View style={styles.stageProgress}>
              {STAGES.filter((s) => s !== "closed_lost").map((s, i) => {
                const info = STAGE_INFO[s];
                const currentOrder = STAGE_INFO[customer.stage].order;
                const isActive = info.order <= currentOrder && customer.stage !== "closed_lost";
                return (
                  <View
                    key={s}
                    style={[
                      styles.progressStep,
                      {
                        backgroundColor: isActive ? info.color : colors.border,
                        flex: 1,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Notes */}
          {customer.notes ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>备注</Text>
              <View style={[styles.notesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.notesText, { color: colors.foreground }]}>
                  {customer.notes}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Follow Up Records */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                跟进记录 ({customer.followUps.length})
              </Text>
              <TouchableOpacity
                style={[styles.addFollowUpBtn, { backgroundColor: colors.primary + "15" }]}
                onPress={() => setShowAddFollowUp(true)}
              >
                <IconSymbol name="plus" size={14} color={colors.primary} />
                <Text style={[styles.addFollowUpText, { color: colors.primary }]}>添加记录</Text>
              </TouchableOpacity>
            </View>

            {showAddFollowUp && (
              <View
                style={[
                  styles.addFollowUpCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {/* Type Selector */}
                <View style={styles.typeRow}>
                  {FOLLOW_UP_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.key}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor:
                            followUpType === t.key ? colors.primary + "20" : colors.border + "60",
                          borderColor:
                            followUpType === t.key ? colors.primary : "transparent",
                        },
                      ]}
                      onPress={() => setFollowUpType(t.key)}
                    >
                      <Text style={styles.typeEmoji}>{t.icon}</Text>
                      <Text
                        style={[
                          styles.typeLabel,
                          { color: followUpType === t.key ? colors.primary : colors.muted },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  value={followUpContent}
                  onChangeText={setFollowUpContent}
                  placeholder="记录跟进内容..."
                  placeholderTextColor={colors.muted}
                  style={[
                    styles.followUpInput,
                    { color: colors.foreground, borderColor: colors.border },
                  ]}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  autoFocus
                />
                <View style={styles.followUpActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddFollowUp(false);
                      setFollowUpContent("");
                    }}
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.muted }]}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddFollowUp}
                    style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.confirmBtnText}>保存记录</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {customer.followUps.length === 0 && !showAddFollowUp ? (
              <View style={[styles.emptyFollowUp, { borderColor: colors.border }]}>
                <Text style={[styles.emptyFollowUpText, { color: colors.muted }]}>
                  暂无跟进记录，点击「添加记录」开始记录
                </Text>
              </View>
            ) : (
              <View style={styles.timeline}>
                {customer.followUps.map((record, index) => {
                  const typeInfo = FOLLOW_UP_TYPES.find((t) => t.key === record.type);
                  return (
                    <View key={record.id} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View
                          style={[
                            styles.timelineDot,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <Text style={styles.timelineDotEmoji}>{typeInfo?.icon ?? "📝"}</Text>
                        </View>
                        {index < customer.followUps.length - 1 && (
                          <View
                            style={[styles.timelineLine, { backgroundColor: colors.border }]}
                          />
                        )}
                      </View>
                      <View
                        style={[
                          styles.timelineContent,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                        ]}
                      >
                        <View style={styles.timelineHeader}>
                          <Text style={[styles.timelineType, { color: colors.primary }]}>
                            {typeInfo?.label ?? "记录"}
                          </Text>
                          <Text style={[styles.timelineDate, { color: colors.muted }]}>
                            {formatDateTime(record.date)}
                          </Text>
                        </View>
                        <Text style={[styles.timelineText, { color: colors.foreground }]}>
                          {record.content}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Recommended Prompts */}
          {recommendedPrompts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>推荐提示词</Text>
              <Text style={[styles.recSubtitle, { color: colors.muted }]}>
                根据客户行业「{customer.industry || "通用"}」和当前阶段「{STAGE_INFO[customer.stage].label}」智能推荐
              </Text>
              {recommendedPrompts.map((prompt) => {
                const catInfo = CATEGORY_INFO[prompt.category];
                return (
                  <TouchableOpacity
                    key={prompt.id}
                    style={[styles.recCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleUsePrompt(prompt)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.recCardLeft}>
                      <View style={[styles.recCatDot, { backgroundColor: catInfo.color + "20" }]}>
                        <IconSymbol name={catInfo.icon as any} size={16} color={catInfo.color} />
                      </View>
                      <View style={styles.recCardInfo}>
                        <Text style={[styles.recCatLabel, { color: catInfo.color }]}>{catInfo.label}</Text>
                        <Text style={[styles.recTitle, { color: colors.foreground }]} numberOfLines={1}>
                          {prompt.title}
                        </Text>
                        <Text style={[styles.recDesc, { color: colors.muted }]} numberOfLines={2}>
                          {prompt.description}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.recUseBtn, { backgroundColor: colors.primary + "15" }]}>
                      <IconSymbol name="wand.and.stars" size={14} color={colors.primary} />
                      <Text style={[styles.recUseBtnText, { color: colors.primary }]}>AI 生成</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Stage Change Modal */}
      <Modal visible={showStageModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStageModal(false)}
        >
          <View
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>切换跟进阶段</Text>
            {STAGES.map((s) => {
              const info = STAGE_INFO[s];
              const isSelected = customer.stage === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.stageOption,
                    {
                      backgroundColor: isSelected ? info.bgColor : "transparent",
                      borderColor: isSelected ? info.color : colors.border,
                    },
                  ]}
                  onPress={async () => {
                    await updateStage(customer.id, s);
                    if (Platform.OS !== "web")
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowStageModal(false);
                  }}
                >
                  <View
                    style={[
                      styles.stageRadio,
                      {
                        borderColor: isSelected ? info.color : colors.border,
                        backgroundColor: isSelected ? info.color : "transparent",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.stageOptionText,
                      { color: isSelected ? info.color : colors.foreground },
                    ]}
                  >
                    {info.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 60,
  },
  backText: { fontSize: 16 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    minWidth: 60,
    justifyContent: "flex-end",
  },
  headerBtn: { padding: 4 },
  scrollContent: { padding: 16, gap: 20 },
  profileCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "700" },
  profileInfo: { flex: 1, gap: 4 },
  companyName: { fontSize: 18, fontWeight: "700" },
  contactInfo: { fontSize: 14 },
  industryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  industryText: { fontSize: 11 },
  contactDetails: {
    borderTopWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: { fontSize: 14, flex: 1 },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  stageSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  stageSelectorText: { fontSize: 16, fontWeight: "600" },
  stageProgress: {
    flexDirection: "row",
    gap: 4,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressStep: { height: 4, borderRadius: 2 },
  notesCard: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 14,
  },
  notesText: { fontSize: 14, lineHeight: 20 },
  addFollowUpBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  addFollowUpText: { fontSize: 13, fontWeight: "500" },
  addFollowUpCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    gap: 10,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeEmoji: { fontSize: 13 },
  typeLabel: { fontSize: 12, fontWeight: "500" },
  followUpInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 72,
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
  },
  followUpActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: { fontSize: 14 },
  confirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  confirmBtnText: { fontSize: 14, color: "#fff", fontWeight: "600" },
  emptyFollowUp: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  emptyFollowUpText: { fontSize: 13, textAlign: "center" },
  timeline: { gap: 0 },
  timelineItem: {
    flexDirection: "row",
    gap: 10,
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: "center",
    width: 32,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotEmoji: { fontSize: 14 },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timelineType: { fontSize: 12, fontWeight: "600" },
  timelineDate: { fontSize: 11 },
  timelineText: { fontSize: 13, lineHeight: 18 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  stageOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  stageRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  stageOptionText: { fontSize: 15, fontWeight: "500" },
  // Recommended Prompts
  recSubtitle: { fontSize: 12, lineHeight: 17, paddingHorizontal: 4, marginTop: -4 },
  recCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  recCardLeft: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  recCatDot: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  recCardInfo: { flex: 1, gap: 2 },
  recCatLabel: { fontSize: 11, fontWeight: "600" },
  recTitle: { fontSize: 13, fontWeight: "700" },
  recDesc: { fontSize: 12, lineHeight: 17 },
  recUseBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, flexShrink: 0 },
  recUseBtnText: { fontSize: 12, fontWeight: "600" },
});
