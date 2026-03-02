import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeColor(type: string) {
  switch (type) {
    case "pdf": return "#EF4444";
    case "docx": return "#2563EB";
    case "md": return "#8B5CF6";
    default: return "#6B7280";
  }
}

function fileTypeIcon(type: string): any {
  switch (type) {
    case "pdf": return "doc.text.fill";
    case "docx": return "doc.fill";
    case "md": return "doc.text";
    default: return "doc.fill";
  }
}

// ─── component ──────────────────────────────────────────────────────────────

export default function KnowledgeScreen() {
  const colors = useColors();
  const [uploading, setUploading] = useState(false);

  const { data: docs = [], isLoading, refetch } = trpc.knowledge.list.useQuery();
  const uploadMutation = trpc.knowledge.upload.useMutation({
    onSuccess: () => { refetch(); },
  });
  const deleteMutation = trpc.knowledge.delete.useMutation({
    onSuccess: () => { refetch(); },
  });

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "text/plain",
          "text/markdown",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = asset.name ?? "document";
      const fileSize = asset.size ?? 0;

      // Determine file type
      const ext = fileName.split(".").pop()?.toLowerCase() ?? "txt";
      const allowedTypes = ["pdf", "txt", "md", "docx"] as const;
      type AllowedType = typeof allowedTypes[number];
      if (!allowedTypes.includes(ext as AllowedType)) {
        Alert.alert("不支持的文件类型", "请上传 PDF、TXT、MD 或 DOCX 文件");
        return;
      }

      if (fileSize > 20 * 1024 * 1024) {
        Alert.alert("文件过大", "请上传小于 20MB 的文件");
        return;
      }

      setUploading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Read file as base64
      let base64Content = "";
      if (Platform.OS === "web") {
        // Web: use fetch to get blob then convert
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1] ?? "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64Content = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      await uploadMutation.mutateAsync({
        fileName,
        fileType: ext as AllowedType,
        fileSize,
        base64Content,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("上传成功", `「${fileName}」已添加到知识库`);
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("上传失败", err?.message ?? "请稍后重试");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: number, fileName: string) => {
    Alert.alert(
      "删除文档",
      `确认删除「${fileName}」？此操作不可撤销。`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({ id });
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (err: any) {
              Alert.alert("删除失败", err?.message ?? "请稍后重试");
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>知识库</Text>
            <Text style={[styles.headerSub, { color: colors.muted }]}>
              上传产品文档，AI 生成时自动引用最新内容
            </Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: "#6C47FF20" }]}>
            <IconSymbol name="folder.fill" size={26} color="#6C47FF" />
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{docs.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>已上传文档</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: "#22C55E" }]}>
              {docs.length > 0 ? "已启用" : "未配置"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>AI 知识增强</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: "#F59E0B" }]}>20MB</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>单文件上限</Text>
          </View>
        </View>
      </View>

      {/* Upload Button */}
      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={[
            styles.uploadBtn,
            { backgroundColor: uploading ? colors.muted : "#6C47FF", borderColor: "#6C47FF" },
          ]}
          onPress={handlePickFile}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <IconSymbol
            name={uploading ? "arrow.clockwise" : "tray.and.arrow.up.fill"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.uploadBtnText}>
            {uploading ? "上传中..." : "上传文档"}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.uploadHint, { color: colors.muted }]}>
          支持 PDF · TXT · MD · DOCX，最大 20MB
        </Text>
      </View>

      {/* Document List */}
      {isLoading ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon]}>⏳</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>加载中...</Text>
        </View>
      ) : docs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>知识库为空</Text>
          <Text style={[styles.emptyDesc, { color: colors.muted }]}>
            上传产品文档后，AI 生成器将自动引用最新内容，确保销售话术与产品保持同步
          </Text>
        </View>
      ) : (
        <FlatList
          data={docs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const color = fileTypeColor(item.fileType);
            const icon = fileTypeIcon(item.fileType);
            return (
              <View
                style={[
                  styles.docCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {/* File type badge */}
                <View style={[styles.docIcon, { backgroundColor: color + "18" }]}>
                  <IconSymbol name={icon} size={22} color={color} />
                </View>

                {/* Info */}
                <View style={styles.docInfo}>
                  <Text
                    style={[styles.docName, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {item.fileName}
                  </Text>
                  <View style={styles.docMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: color + "18" }]}>
                      <Text style={[styles.typeBadgeText, { color }]}>
                        {item.fileType.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.docSize, { color: colors.muted }]}>
                      {formatBytes(item.fileSize)}
                    </Text>
                    <Text style={[styles.docDate, { color: colors.muted }]}>
                      {new Date(item.uploadedAt).toLocaleDateString("zh-CN")}
                    </Text>
                  </View>
                </View>

                {/* Delete */}
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteBtn,
                    { backgroundColor: pressed ? "#EF444420" : "transparent" },
                  ]}
                  onPress={() => handleDelete(item.id, item.fileName)}
                >
                  <IconSymbol name="trash" size={18} color="#EF4444" />
                </Pressable>
              </View>
            );
          }}
          ListHeaderComponent={
            <Text style={[styles.listHeader, { color: colors.muted }]}>
              共 {docs.length} 份文档 · AI 生成时自动引用
            </Text>
          }
        />
      )}

      {/* Info Banner */}
      {docs.length > 0 && (
        <View style={[styles.infoBanner, { backgroundColor: "#22C55E15", borderColor: "#22C55E30" }]}>
          <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
          <Text style={[styles.infoBannerText, { color: "#22C55E" }]}>
            AI 生成器已启用知识库增强，将优先参考已上传文档
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, lineHeight: 18, marginTop: 4, maxWidth: 240 },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    paddingTop: 14,
    gap: 0,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statNum: { fontSize: 16, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },
  statDivider: { width: 0.5, marginVertical: 4 },
  uploadSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  uploadBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  uploadHint: { fontSize: 12, textAlign: "center" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
    paddingBottom: 60,
  },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },
  listHeader: { fontSize: 13, marginBottom: 4 },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  docInfo: { flex: 1, gap: 6 },
  docName: { fontSize: 14, fontWeight: "600" },
  docMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "700" },
  docSize: { fontSize: 12 },
  docDate: { fontSize: 12 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBannerText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
