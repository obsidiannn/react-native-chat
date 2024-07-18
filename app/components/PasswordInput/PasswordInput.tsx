import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size"
import { Image } from "expo-image";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native"
import { useRecoilValue } from "recoil";

export interface PasswordInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}
export interface PasswordInputRef {
    focus: () => void;
}
export const PasswordInput = forwardRef((props: PasswordInputProps,ref) => {
    const $colors = useRecoilValue(ColorsState);
    const [passwordHidden, setPasswordHidden] = useState(true);
    const inputRef = useRef<TextInput>(null);
    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        }
    }))
    return <View style={{
        height: s(48),
        borderRadius: s(12),
        flex: 1,
        justifyContent: 'center',
        width: "100%",
        backgroundColor: $colors.secondaryBackground,
        paddingHorizontal: s(16),
        flexDirection: "row",
        alignItems: "center",
    }}>
        <Image style={{
            width: s(24),
            height: s(24),
        }} source={require('./lock-light.webp')} />
        <TextInput value={props.value} ref={inputRef} secureTextEntry={passwordHidden} style={{
            fontSize: 14,
            color: $colors.secondaryText,
            flex: 1
        }} onChangeText={props.onChangeText} placeholder={props.placeholder} />
        <Pressable onPress={() => setPasswordHidden(!passwordHidden)}>
            <Image style={{
                width: s(24),
                height: s(24),
            }} source={passwordHidden ? require('./close-eye.webp') : require('./eye.webp')} />
        </Pressable>
    </View>
})