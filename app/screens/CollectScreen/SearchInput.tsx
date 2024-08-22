import { TouchableOpacity, View } from "react-native"
import { useRef, useState } from "react"
import { TextInput } from "react-native-gesture-handler"
import { s } from "app/utils/size"
import { IconFont } from "app/components/IconFont/IconFont"
import { Text } from "react-native"


export interface SearchProps {
    onSearch: (val: string) => Promise<void>
    color: IColors
}

export const SearchInput = (props: SearchProps) => {
    const [label, setLabel] = useState<string>('')
    const textInputRef = useRef<TextInput>(null)
    return <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: props.color.background,
        borderRadius: s(24),
        paddingHorizontal: s(8)
    }}>
        <TextInput
            ref={textInputRef}
            activeCursor="auto"
            value={label}
            cursorColor={props.color.text}
            style={{
                flex: 1,
                color: props.color.text,
                backgroundColor: props.color.background,
                borderRadius: s(24),
                fontSize: s(12),
                height: s(42),
            }}
            onChangeText={(v) => {
                setLabel(v)
            }} >

        </TextInput>
        <TouchableOpacity
            onPress={() => {
                props.onSearch && props.onSearch(label)
            }}
            style={{
                alignSelf: 'center',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                height: s(42),
            }}>
            <IconFont name="search" size={32} color={props.color.secondaryText} />
        </TouchableOpacity>

    </View>
}
