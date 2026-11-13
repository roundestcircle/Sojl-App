/**
 * Design tokens: the only place raw colour, font-size and spacing values live.
 * Components use these names instead of literals so the look stays consistent.
 */

const PRIMARY = "#145600";

export const colors = {
  /** Dark green used for buttons, borders, headers and accents. */
  primary: PRIMARY,
  /** Primary at low opacity: result boxes, selected list rows. */
  primaryTint: PRIMARY + "14",
  /** Primary at medium opacity: unselected chip borders, dividers on green rows. */
  primaryBorder: PRIMARY + "55",
  /** Input placeholder text. */
  placeholder: PRIMARY + "66",
  /** Secondary text on primary-coloured controls (e.g. chip subtitles). */
  primaryMuted: PRIMARY + "99",

  white: "#fff",
  link: "#007AFF",
  /** Headings and input values. */
  text: "#222",
  /** Body text. */
  textBody: "#333",
  /** Labels and descriptions. */
  textSecondary: "#555",
  /** Hints, empty states, captions. */
  textMuted: "#888",
  /** Disabled icons. */
  disabled: "#c4c4c4",

  /** Input borders. */
  border: "#ccc",
  /** Section and header dividers. */
  divider: "#ddd",
  /** Dividers between list rows. */
  dividerLight: "#eee",
  /** Input background. */
  inputBackground: "#fafafa",
  /** Read-only inputs, section headers, info panels. */
  surfaceMuted: "#f3f3f3",

  danger: "#c0392b",
  dangerText: "#b3261e",
  dangerTint: "rgba(253, 236, 234, 0.95)",
  warning: "#e0a020",
  warningText: "#8a4b00",
  /** Highlight for a row the user is standing at. */
  successTint: "#dff0d8",
  /** Translucent result panel drawn over the camera photo. */
  successOverlay: "rgba(220, 240, 210, 0.93)",
  /** Background of cancel buttons. */
  neutral: "#888",
  /** Backdrop behind dialogs. */
  overlay: "rgba(0, 0, 0, 0.45)",

  /** Status badges: nothing entered / started / complete. */
  statusEmpty: "#6c757d",
  statusStarted: "#e0a020",
  statusDone: PRIMARY,
};

/** Font sizes. Pick the nearest step instead of introducing a new value. */
export const fontSize = {
  /** Badges, version label. */
  xs: 11,
  /** Field labels, hints, captions. */
  sm: 13,
  /** Body text, compact buttons. */
  md: 15,
  /** Inputs, dialog text. */
  base: 16,
  /** Row titles, large buttons. */
  lg: 18,
  /** Dialog and page headings. */
  xl: 24,
  /** Result values. */
  xxl: 32,
};

/** Spacing steps for padding, margins and gaps. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  /** Horizontal gutter of every screen. */
  screen: 16,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
};
