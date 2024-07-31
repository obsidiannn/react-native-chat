
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { ColorValue, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";
import { useRecoilValue } from "recoil";
export interface BackupPriKeyModalType {
  open: () => void,
  close: () => void
}
export interface ButtonProps {
  label: string;
  backgroundColor?: ColorValue;
  fullWidth?: boolean;
  size?: "small" | "large";
  type?: "primary" | "secondary";
  rounded?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  fullRounded?: boolean;
}
export const Button = (props: ButtonProps) => {
  const $colors = useRecoilValue(ColorsState);
  const { fullWidth = false, rounded = true, fullRounded = false, size = "small", label, containerStyle, textStyle, type = "primary" } = props;
  const $container: Record<string, ViewStyle> = {
    "small": {
      borderRadius: rounded ? (
        fullRounded ? s(15) : s(7)
      ) : 0,
      paddingHorizontal: s(13),
      height: s(30),
      justifyContent: "center"
    },
    "large": {
      borderRadius: rounded ? (
        fullRounded ? s(24) : s(12)
      ) : 0,
      paddingHorizontal: s(13),
      height: s(48),
      justifyContent: "center"
    }
  }
  const $containerType: Record<string, ViewStyle> = {
    "primary": {
      backgroundColor: props.backgroundColor ?? $colors.primary,
    },
    "secondary": {
      height: Number($container[size].height) - 2,
      borderWidth: s(1),
      borderColor: "#D1D5DB",
      backgroundColor: "white",
    }
  }
  const $label: Record<string, TextStyle> = {
    "small": {
      fontSize: s(12),
      fontWeight: "400",
    },
    "large": {
      fontSize: s(15),
      fontWeight: "400",
    }
  }
  const $labelType: Record<string, TextStyle> = {
    "primary": {
      color: "white",
    },
    "secondary": {
      color: "black"
    }
  }
  return <TouchableOpacity onPress={props.onPress} style={[
    $container[size],
    fullWidth && {
      width: "100%",
    },
    $containerType[type],
    containerStyle,
  ]}>
    <Text style={[
      {
        color: "white",
        textAlign: "center",
      },
      $label[size],
      $labelType[type],
      textStyle,
    ]}>{label}</Text>
  </TouchableOpacity>
}