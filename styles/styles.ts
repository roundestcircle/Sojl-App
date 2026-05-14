import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const styles = StyleSheet.create({
  // Base container - centered flex layout for screens with normal vertical flow
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },

  // Simple wrapper for full-screen components (just flex and padding, no centering)
  containerfull: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  footnote: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
    gap: 4,
  },

  text: {
    fontSize: 16,
    color: "#333",
  },

  maintext: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },

  button: {
    width: "100%",
    padding: 18,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: "#fff",
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  navButton: {
    width: "100%",
    padding: 18,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: "#fff",
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  navButtonLabel: {
    flex: 1,
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },

  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center" as const,
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600" as const,
  },

  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },

  cameraContainer: {
    flex: 1,
  },

  labelContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 64,
    fontWeight: "600",
    letterSpacing: -2,
    color: "#000",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    maxWidth: 400,
    borderColor: colors.primary,
    borderWidth: 3,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },

  modalText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 20,
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxChecked: {
    backgroundColor: colors.primary,
  },

  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },

  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  resetButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderWidth: 5,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  resetButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // ─── Shared form & list styles ──────────────────────────────────────────────

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#fafafa",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.primary,
    marginBottom: 4,
  },

  fieldLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 2,
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 16,
  },

  list: {
    gap: 10,
    paddingVertical: 16,
    flexGrow: 1,
  },

  rowSub: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  rowTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  readonlyInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
  },

  section: {
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },

  formRow: {
    flexDirection: "row",
    gap: 12,
  },

  halfField: {
    flex: 1,
    gap: 4,
  },

  erweiterteHint: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },

  listRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },

  listRowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },

  chevron: {
    fontSize: 28,
    color: colors.primary,
    marginLeft: 8,
    includeFontPadding: false,
  },

  exportBtn: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 2,
    borderLeftColor: colors.primary + "44",
    alignSelf: "stretch",
  },

  exportText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },

  modalButtons: {
    gap: 10,
    marginTop: 8,
  },

  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  bottomBar: {
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
});
