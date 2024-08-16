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
    const [visible, setVisible] = useState<boolean>(false)
    const textInputRef = useRef<TextInput>(null)
    return <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: props.color.background,
        borderRadius: s(8),
        paddingHorizontal: s(8)
    }}>
        {visible ? <TextInput
            ref={textInputRef}
            activeCursor="auto"
            value={label}
            cursorColor={props.color.text}
            style={{
                width: '100%',
                color: props.color.text,
                backgroundColor: props.color.background,
                fontSize: s(12),
                height: s(42),
            }}
            onChangeText={(v) => {
                setLabel(v)
                if (!v || v.length <= 0) {
                    setVisible(false)
                }
                props.onSearch && props.onSearch(v)
            }} >

        </TextInput>
            : <TouchableOpacity
                onPress={() => {
                    setVisible(true)
                    textInputRef.current?.focus()
                }}
                style={{
                    alignSelf: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: s(42),
                }}>
                <IconFont name="search" size={24} color={props.color.text} />
                <Text> Search</Text>
            </TouchableOpacity>}

    </View>
}
