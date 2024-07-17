import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size"
import { Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import { useRecoilValue } from "recoil";

export interface BlockButtonProps {
    onPress?: () => void;
    label: string;
    type?: "primary" | "secondary";
    disabled?: boolean;
}
export default (props: BlockButtonProps) => {
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const $primaryContainer: ViewStyle = {
        backgroundColor: $colors.primary,
        borderRadius: s(12),
    }
    const $primaryText: TextStyle = {
        color: "white"
    }
    const $secondaryContainer: ViewStyle = {
        backgroundColor: $colors.background,
        borderColor: $colors.border,
        borderWidth: 1,
    }
    const $secondaryText: TextStyle = {
        color: $theme == "dark" ? "white": $colors.primary
    }
    const { label, type="primary",disabled=false } = props;
    return <TouchableOpacity disabled={disabled} onPress={props.onPress} style={[$container, type == "primary" ? $primaryContainer :$secondaryContainer]}>
        <Text style={[
            $text,
            type == "primary" ? $primaryText :$secondaryText
        ]}>{label}</Text>
    </TouchableOpacity>
}
const $container: ViewStyle = {
    height: s(48),
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(12),
}
const $text: TextStyle = {
    fontWeight: "400",
    fontSize: 15
}