import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "book.fill": "menu-book",
  "wand.and.stars": "auto-awesome",
  "info.circle.fill": "info",
  "heart.fill": "favorite",
  "heart": "favorite-border",
  // Actions
  "paperplane.fill": "send",
  "doc.on.clipboard": "content-copy",
  "square.and.arrow.up": "share",
  "magnifyingglass": "search",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "checkmark.circle.fill": "check-circle",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "plus": "add",
  "minus": "remove",
  "trash": "delete",
  "pencil": "edit",
  // Categories
  "cpu": "memory",
  "bolt.fill": "bolt",
  "envelope.fill": "email",
  "person.2.fill": "group",
  "chart.bar.fill": "bar-chart",
  "sparkles": "auto-awesome",
  "star.fill": "star",
  "star": "star-border",
  "clock": "schedule",
  "clock.fill": "schedule",
  "tag.fill": "label",
  // Product
  "globe": "language",
  "lock.fill": "lock",
  "shield.fill": "security",
  "server.rack": "dns",
  "externaldrive.fill": "storage",
  "network": "hub",
  "arrow.up.right.square": "open-in-new",
  // Misc
  "chevron.left.forwardslash.chevron.right": "code",
  "ellipsis": "more-horiz",
  "ellipsis.circle": "more-horiz",
  "gear": "settings",
  "questionmark.circle": "help",
  "exclamationmark.triangle.fill": "warning",
  "checkmark": "check",
  "arrow.clockwise": "refresh",
  "doc.text.fill": "description",
  "text.bubble.fill": "chat",
  "lightbulb.fill": "lightbulb",
  "flame.fill": "local-fire-department",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
