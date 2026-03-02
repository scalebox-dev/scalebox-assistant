import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import type { LlmProvider } from "@/lib/_core/llm-config";
import {
  getStoredLlmConfig,
  setStoredLlmKey,
  setStoredLlmProvider,
  setStoredLlmUrl,
} from "@/lib/_core/llm-config";

export default function SettingsScreen() {
  const colors = useColors();
  const [llmApiUrl, setLlmApiUrl] = useState("");
  const [llmApiKey, setLlmApiKey] = useState("");
  const [provider, setProvider] = useState<LlmProvider>("openai");
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [urlFocused, setUrlFocused] = useState(false);

  const loadStored = useCallback(async () => {
    setLoading(true);
    try {
      const c = await getStoredLlmConfig();
      setLlmApiUrl(c.llmApiUrl);
      setHasKey(c.hasKey);
      setProvider(c.provider);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStored();
  }, [loadStored]);

  const handleSave = async () => {
    const url = llmApiUrl.trim();
    const key = llmApiKey.trim();
    if (!key && !hasKey) {
      Alert.alert("请输入 API Key", "至少需要填写 LLM API Key 才能在本设备使用 AI 生成。");
      return;
    }
    setSaving(true);
    try {
      await setStoredLlmUrl(url);
      await setStoredLlmKey(key);
      await setStoredLlmProvider(provider);
      const next = await getStoredLlmConfig();
      setHasKey(next.hasKey);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "保存成功",
        "API 配置已保存到本设备。仅当前浏览器/设备可使用此 Key，其他人打开页面不会使用你的 Key。",
      );
    } catch (e) {
      Alert.alert("保存失败", e instanceof Error ? e.message : "请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>设置</Text>
              <Text style={[styles.headerSub, { color: colors.muted }]}>
                配置 LLM API 后，仅当前浏览器/设备可使用；他人打开不会使用你的 Key
              </Text>
            </View>
            <View style={[styles.headerIcon, { backgroundColor: "#6C47FF20" }]}>
              <IconSymbol name="gearshape.fill" size={26} color="#6C47FF" />
            </View>
          </View>
          <View style={[styles.statusRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.statusLabel, { color: colors.muted }]}>本设备状态</Text>
            {loading ? (
              <Text style={[styles.statusValue, { color: colors.muted }]}>加载中...</Text>
            ) : (
              <Text style={[styles.statusValue, { color: hasKey ? "#22C55E" : "#F59E0B" }]}>
                {hasKey ? "已配置 API Key" : "未配置"}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.foreground }]}>提供商</Text>
          <Text style={[styles.hint, { color: colors.muted }]}>
            OpenAI 兼容：OpenAI、Azure、国内兼容接口等。Google：Gemini API（Google AI Studio）。Vertex：Vertex AI 的 generateContent 接口。
          </Text>
          <View style={styles.providerRow}>
            <TouchableOpacity
              style={[
                styles.providerBtn,
                { borderColor: colors.border, backgroundColor: provider === "openai" ? "#6C47FF20" : colors.background },
              ]}
              onPress={() => setProvider("openai")}
            >
              <Text style={[styles.providerBtnText, { color: colors.foreground }]}>OpenAI 兼容</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.providerBtn,
                { borderColor: colors.border, backgroundColor: provider === "google" ? "#6C47FF20" : colors.background },
              ]}
              onPress={() => setProvider("google")}
            >
              <Text style={[styles.providerBtnText, { color: colors.foreground }]}>Google Gemini</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.providerBtn,
                { borderColor: colors.border, backgroundColor: provider === "vertex" ? "#6C47FF20" : colors.background },
              ]}
              onPress={() => setProvider("vertex")}
            >
              <Text style={[styles.providerBtnText, { color: colors.foreground }]}>Vertex AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            LLM API 地址（选填，仅 OpenAI 兼容 / Vertex 有效）
          </Text>
          <Text style={[styles.hint, { color: colors.muted }]}>
            OpenAI 兼容：留空则使用默认 https://api.openai.com。Vertex：请填写完整 generateContent 端点，如
            https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground },
              urlFocused && { borderColor: "#6C47FF" },
            ]}
            placeholder="https://api.openai.com"
            placeholderTextColor={colors.muted}
            value={llmApiUrl}
            onChangeText={setLlmApiUrl}
            onFocus={() => setUrlFocused(true)}
            onBlur={() => setUrlFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.foreground }]}>API Key（必填）</Text>
          <Text style={[styles.hint, { color: colors.muted }]}>
            {provider === "google"
              ? "Google AI Studio 的 Gemini API Key（本设备保存，仅你可用）"
              : provider === "vertex"
                ? "Vertex AI 的 API Key（本设备保存，仅你可用）"
                : "OpenAI / 兼容接口的 API Key（本设备保存，仅你可用）"}
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground },
            ]}
            placeholder={hasKey ? "已配置，输入新值可覆盖" : "sk-..."}
            placeholderTextColor={colors.muted}
            value={llmApiKey}
            onChangeText={setLlmApiKey}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saving ? colors.muted : "#6C47FF" }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>保存到本设备</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  headerSub: { fontSize: 13, marginTop: 4, maxWidth: "85%" },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  statusLabel: { fontSize: 13 },
  statusValue: { fontSize: 14, fontWeight: "600" },
  providerRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  providerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: "center",
  },
  providerBtnText: { fontSize: 14, fontWeight: "600" },
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  label: { fontSize: 15, fontWeight: "600" },
  hint: { fontSize: 12, marginTop: 4, marginBottom: 10, lineHeight: 18 },
  input: {
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
