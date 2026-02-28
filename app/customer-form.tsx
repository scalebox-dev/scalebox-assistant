import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import { CustomerStage, STAGE_INFO, useCustomers } from "@/hooks/use-customers";

const STAGES: CustomerStage[] = [
  "initial_contact",
  "demo",
  "proposal",
  "closed_won",
  "closed_lost",
];

const INDUSTRIES = [
  "AI/大模型",
  "金融科技",
  "医疗健康",
  "电商零售",
  "教育科技",
  "企业软件",
  "游戏娱乐",
  "其他",
];

export default function CustomerFormScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id?: string }>();
  const { addCustomer, updateCustomer, getCustomerById } = useCustomers();

  const isEdit = !!params.id;
  const existing = params.id ? getCustomerById(params.id) : undefined;

  const [companyName, setCompanyName] = useState(existing?.companyName ?? "");
  const [contactName, setContactName] = useState(existing?.contactName ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [industry, setIndustry] = useState(existing?.industry ?? "");
  const [stage, setStage] = useState<CustomerStage>(existing?.stage ?? "initial_contact");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const handleSave = async () => {
    if (!companyName.trim()) {
      Alert.alert("提示", "请填写公司名称");
      return;
    }
    if (!contactName.trim()) {
      Alert.alert("提示", "请填写联系人姓名");
      return;
    }

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isEdit && params.id) {
      await updateCustomer(params.id, {
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        title: title.trim(),
        phone: phone.trim(),
        email: email.trim(),
        industry,
        stage,
        notes: notes.trim(),
      });
    } else {
      await addCustomer({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        title: title.trim(),
        phone: phone.trim(),
        email: email.trim(),
        industry,
        stage,
        notes: notes.trim(),
      });
    }
    router.back();
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
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {isEdit ? "编辑客户" : "新增客户"}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={[styles.saveBtnText, { color: colors.primary }]}>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 基本信息 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>基本信息</Text>
            <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <FormField
                label="公司名称 *"
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="例：字节跳动"
                colors={colors}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <FormField
                label="联系人 *"
                value={contactName}
                onChangeText={setContactName}
                placeholder="例：张三"
                colors={colors}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <FormField
                label="职位"
                value={title}
                onChangeText={setTitle}
                placeholder="例：CTO"
                colors={colors}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <FormField
                label="电话"
                value={phone}
                onChangeText={setPhone}
                placeholder="例：138xxxxxxxx"
                keyboardType="phone-pad"
                colors={colors}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <FormField
                label="邮箱"
                value={email}
                onChangeText={setEmail}
                placeholder="例：zhang@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                colors={colors}
              />
            </View>
          </View>

          {/* 行业 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>所属行业</Text>
            <View style={styles.industryGrid}>
              {INDUSTRIES.map((ind) => (
                <TouchableOpacity
                  key={ind}
                  style={[
                    styles.industryChip,
                    {
                      backgroundColor: industry === ind ? colors.primary + "20" : colors.surface,
                      borderColor: industry === ind ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setIndustry(industry === ind ? "" : ind)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.industryChipText,
                      { color: industry === ind ? colors.primary : colors.muted },
                    ]}
                  >
                    {ind}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 跟进阶段 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>跟进阶段</Text>
            <View style={styles.stageList}>
              {STAGES.map((s) => {
                const info = STAGE_INFO[s];
                const isSelected = stage === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.stageOption,
                      {
                        backgroundColor: isSelected ? info.bgColor : colors.surface,
                        borderColor: isSelected ? info.color : colors.border,
                      },
                    ]}
                    onPress={() => setStage(s)}
                    activeOpacity={0.7}
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
          </View>

          {/* 备注 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>备注</Text>
            <View
              style={[
                styles.notesCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="记录客户背景、需求、痛点等..."
                placeholderTextColor={colors.muted}
                style={[styles.notesInput, { color: colors.foreground }]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                returnKeyType="default"
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "sentences";
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.fieldInput, { color: colors.foreground }]}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "sentences"}
        returnKeyType="done"
      />
    </View>
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
  backText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  saveBtn: {
    minWidth: 60,
    alignItems: "flex-end",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    width: 80,
    flexShrink: 0,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
  },
  divider: {
    height: 0.5,
    marginLeft: 14,
  },
  industryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  industryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  industryChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  stageList: {
    gap: 8,
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
  stageOptionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  notesCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  notesInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
  },
});
