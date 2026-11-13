import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { colors } from "@/styles/colors";

export type TermRowProps = {
  /** Bold label: a horizon symbol or an entry title. */
  term?: string;
  /** Small label above the text, e.g. a Horizontabfolge. */
  caption?: string;
  text: string;
  /** Term left of the text (symbol lists) instead of stacked above it. */
  inline?: boolean;
  image?: ImageSourcePropType;
};

/** One entry row of a Lexikon list (Horizonte, Humusformen, Funktionsweise). */
export default function TermRow({
  term,
  caption,
  text,
  inline = false,
  image,
}: TermRowProps) {
  if (inline) {
    return (
      <View style={[localStyles.row, localStyles.inlineRow]}>
        <Text style={[localStyles.term, localStyles.inlineTerm]}>{term}</Text>
        <Text style={[localStyles.text, localStyles.inlineText]}>{text}</Text>
      </View>
    );
  }

  return (
    <View style={[localStyles.row, localStyles.stackedRow]}>
      {term != null && <Text style={localStyles.term}>{term}</Text>}
      {caption != null && <Text style={localStyles.caption}>{caption}</Text>}
      <Text style={localStyles.text}>{text}</Text>
      {image != null && (
        <Image source={image} style={localStyles.image} resizeMode="contain" />
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  row: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stackedRow: {
    gap: 4,
  },
  term: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  inlineTerm: {
    minWidth: 70,
  },
  caption: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  text: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  inlineText: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 180,
    marginTop: 8,
  },
});
