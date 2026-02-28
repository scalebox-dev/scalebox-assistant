import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useFavorites } from "@/hooks/use-favorites";
import {
  CATEGORY_INFO,
  PROMPTS,
  PromptTemplate,
  fillTemplate,
} from "@/lib/prompts-data";
import { trpc } from "@/lib/trpc";

export default function GenerateScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ promptId?: string; prefillCompany?: string; prefillContact?: string }>();
  const { addFavorite, addToHistory } = useFavorites();

  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const generateMutation = trpc.ai.generate.useMutation();

  useEffect(() => {
    if (params.promptId) {
      const prompt = PROMPTS.find((p) => p.id === params.promptId);
      if (prompt) {
        setSelectedPrompt(prompt);
        // Pre-fill variables from customer context
        const prefilled: Record<string, string> = {};
        if (params.prefillCompany) {
          for (const v of prompt.variables) {
            if (v.includes("公司") || v.includes("company") || v.includes("客户")) {
              prefilled[v] = params.prefillCompany;
            }
          }
        }
        if (params.prefillContact) {
          for (const v of prompt.variables) {
            if (v.includes("联系人") || v.includes("contact") || v.includes("姓名")) {
              prefilled[v] = params.prefillContact;
            }
          }
        }
        setVariables(prefilled);
        setGeneratedContent("");
      }
    }
  }, [params.promptId, params.prefillCompany, params.prefillContact]);

  const filteredPrompts = searchQuery
    ? PROMPTS.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : PROMPTS;

  const handleGenerate = async () => {
    if (!selectedPrompt) {
      Alert.alert("请先选择提示词模板");
      return;
    }

    const filledTemplate = fillTemplate(selectedPrompt.template, variables);
    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const systemPrompt = `你是 ScaleBox 智能体沙盒的专业销售顾问。ScaleBox 是 AI 时代的超轻量级基础设施平台，提供毫秒级启动的沙盒环境、按秒计费、10K+ 活跃用户、99.9% 正常运行时间和 12 个全球区域。

核心产品特性：
- 即时沙盒：毫秒级启动，预配置模板
- 按秒计费：透明定价，无隐藏费用
- 安全可靠：API 密钥认证、RBAC、不可变审计追踪
- 可扩展：双引擎架构，水平扩展
- AI 就绪：专为 AI/ML 工作负载优化

定价方案：
- Hobby（免费）：20 并发沙盒，8 CPU，8GB RAM
- Pro（$99.99/月）：100 并发沙盒，8 CPU，16GB RAM
- Ultimate（$199.99/月）：400 并发沙盒，16 CPU，16GB RAM

请根据用户的销售场景需求，生成专业、有说服力的销售内容。用中文回复，内容要具体、实用、有针对性。`;

      const result = await generateMutation.mutateAsync({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: filledTemplate },
        ],
      });

      const content = result.content || "生成失败，请重试";
      setGeneratedContent(content);

      await addToHistory({
        promptId: selectedPrompt.id,
        title: selectedPrompt.title,
        category: selectedPrompt.category,
        content,
      });

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      const filledContent = fillTemplate(selectedPrompt.template, variables);
      setGeneratedContent(filledContent);
      Alert.alert("提示", "AI 生成暂时不可用，已显示填充后的提示词模板，您可以直接复制使用。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedContent) return;
    await Clipboard.setStringAsync(generatedContent);
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("已复制", "内容已复制到剪贴板");
  };
  const handleShare = async () => {
    if (!generatedContent) return;
    const title = selectedPrompt?.title ?? "ScaleBox 销售内容";
    const shareText = `💡 ${title}

${generatedContent}

——
🚀 ScaleBox 智能体沙盒基础设施
🔗 www.scalebox.dev`;
    try {
      if (Platform.OS === "web") {
        await Clipboard.setStringAsync(shareText);
        Alert.alert("已复制", "分享内容已复制，可直接粘贴分享");
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          const FileSystem = await import("expo-file-system/legacy");
          const fileUri = FileSystem.cacheDirectory + `scalebox_generated_${Date.now()}.txt`;
          await FileSystem.writeAsStringAsync(fileUri, shareText, { encoding: FileSystem.EncodingType.UTF8 });
          await Sharing.shareAsync(fileUri, { mimeType: "text/plain", dialogTitle: `分享：${title}` });
        } else {
          await Clipboard.setStringAsync(shareText);
          Alert.alert("已复制", "分享内容已复制到剪贴板");
        }
      }
      if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      await Clipboard.setStringAsync(shareText);
      Alert.alert("已复制", "分享内容已复制到剪贴板");
    }
  };

  const handleSaveFavorite = async () => {
    if (!selectedPrompt || !generatedContent) return;
    await addFavorite({
      promptId: selectedPrompt.id,
      title: selectedPrompt.title,
      category: selectedPrompt.category,
      content: generatedContent,
    });
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("已收藏", "内容已保存到收藏夹");
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>AI 生成</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>智能销售内容生成器</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Prompt Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>选择提示词模板</Text>
            <TouchableOpacity
              style={[
                styles.promptSelector,
                { backgroundColor: colors.surface, borderColor: selectedPrompt ? colors.primary : colors.border },
              ]}
              onPress={() => setShowPromptPicker(!showPromptPicker)}
              activeOpacity={0.75}
            >
              {selectedPrompt ? (
                <View style={styles.selectedPromptInfo}>
                  <View
                    style={[
                      styles.selectedCatDot,
                      { backgroundColor: CATEGORY_INFO[selectedPrompt.category].color },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.selectedPromptTitle, { color: colors.foreground }]}>
                      {selectedPrompt.title}
                    </Text>
                    <Text style={[styles.selectedPromptCat, { color: colors.muted }]}>
                      {CATEGORY_INFO[selectedPrompt.category].label}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.placeholderText, { color: colors.muted }]}>点击选择提示词模板...</Text>
              )}
              <IconSymbol
                name={showPromptPicker ? "chevron.up" : "chevron.down"}
                size={18}
                color={colors.muted}
              />
            </TouchableOpacity>

            {/* Prompt Picker Dropdown */}
            {showPromptPicker && (
              <View
                style={[
                  styles.pickerDropdown,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={[styles.pickerSearch, { borderBottomColor: colors.border }]}>
                  <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
                  <TextInput
                    style={[styles.pickerSearchInput, { color: colors.foreground }]}
                    placeholder="搜索模板..."
                    placeholderTextColor={colors.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <ScrollView style={{ maxHeight: 280 }} nestedScrollEnabled>
                  {filteredPrompts.map((prompt) => {
                    const catInfo = CATEGORY_INFO[prompt.category];
                    return (
                      <TouchableOpacity
                        key={prompt.id}
                        style={[
                          styles.pickerItem,
                          { borderBottomColor: colors.border },
                          selectedPrompt?.id === prompt.id && { backgroundColor: colors.primary + "10" },
                        ]}
                        onPress={() => {
                          setSelectedPrompt(prompt);
                          setVariables({});
                          setGeneratedContent("");
                          setShowPromptPicker(false);
                          setSearchQuery("");
                        }}
                      >
                        <View style={[styles.pickerItemDot, { backgroundColor: catInfo.color }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.pickerItemTitle, { color: colors.foreground }]}>
                            {prompt.title}
                          </Text>
                          <Text style={[styles.pickerItemCat, { color: colors.muted }]}>{catInfo.label}</Text>
                        </View>
                        {selectedPrompt?.id === prompt.id && (
                          <IconSymbol name="checkmark" size={16} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Variables */}
          {selectedPrompt && selectedPrompt.variables.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>填写变量</Text>
              {selectedPrompt.variables.map((variable) => (
                <View key={variable} style={styles.variableInput}>
                  <Text style={[styles.variableLabel, { color: colors.muted }]}>[{variable}]</Text>
                  <TextInput
                    style={[
                      styles.variableField,
                      { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
                    ]}
                    placeholder={`输入 ${variable}...`}
                    placeholderTextColor={colors.muted}
                    value={variables[variable] || ""}
                    onChangeText={(text) => setVariables((prev) => ({ ...prev, [variable]: text }))}
                    returnKeyType="next"
                  />
                </View>
              ))}
            </View>
          )}

          {/* Template Preview */}
          {selectedPrompt && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>提示词预览</Text>
              <View
                style={[
                  styles.templatePreview,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.templatePreviewText, { color: colors.foreground }]}>
                  {fillTemplate(selectedPrompt.template, variables)}
                </Text>
              </View>
            </View>
          )}

          {/* Generate Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.generateBtn,
                { backgroundColor: selectedPrompt ? colors.primary : colors.border },
              ]}
              onPress={handleGenerate}
              disabled={!selectedPrompt || isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <IconSymbol name="wand.and.stars" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.generateBtnText}>
                {isGenerating ? "正在生成..." : "AI 智能生成"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Generated Content */}
          {generatedContent ? (
            <View style={styles.section}>
              <View style={styles.resultHeader}>
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>生成结果</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={[styles.resultActionBtn, { borderColor: colors.border }]}
                    onPress={handleSaveFavorite}
                  >
                    <IconSymbol name="heart" size={16} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.resultActionBtn, { borderColor: colors.border }]}
                    onPress={handleCopy}
                  >
                    <IconSymbol name="doc.on.clipboard" size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.resultActionBtn, { borderColor: colors.border }]}
                    onPress={handleShare}
                  >
                    <IconSymbol name="square.and.arrow.up" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={[
                  styles.resultBox,
                  { backgroundColor: colors.surface, borderColor: colors.primary + "40" },
                ]}
              >
                <Text style={[styles.resultText, { color: colors.foreground }]}>{generatedContent}</Text>
              </View>
              <View style={styles.bottomActions}>
                <TouchableOpacity
                  style={[styles.copyFullBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, flex: 1 }]}
                  onPress={handleCopy}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="doc.on.clipboard" size={18} color={colors.primary} />
                  <Text style={[styles.copyFullBtnText, { color: colors.primary }]}>复制</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.copyFullBtn, { backgroundColor: colors.primary, flex: 1 }]}
                  onPress={handleShare}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="square.and.arrow.up" size={18} color="#FFFFFF" />
                  <Text style={styles.copyFullBtnText}>分享</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  promptSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  selectedPromptInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectedCatDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectedPromptTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  selectedPromptCat: {
    fontSize: 12,
    marginTop: 2,
  },
  placeholderText: {
    flex: 1,
    fontSize: 15,
  },
  pickerDropdown: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerSearch: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    gap: 8,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    gap: 10,
  },
  pickerItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pickerItemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  pickerItemCat: {
    fontSize: 12,
    marginTop: 2,
  },
  variableInput: {
    marginBottom: 12,
  },
  variableLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  variableField: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  templatePreview: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  templatePreviewText: {
    fontSize: 13,
    lineHeight: 20,
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  generateBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultActions: {
    flexDirection: "row",
    gap: 8,
  },
  resultActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resultBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomActions: {
    flexDirection: "row",
    gap: 10,
  },
  copyFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  copyFullBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
