import { TextInput, type TextInputProps } from "react-native";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/theme";

/** TextInput with the app's input style and placeholder colour. */
export default function TextField({
  style,
  placeholderTextColor = colors.placeholder,
  ...rest
}: TextInputProps) {
  return (
    <TextInput
      {...rest}
      style={[styles.input, style]}
      placeholderTextColor={placeholderTextColor}
    />
  );
}
