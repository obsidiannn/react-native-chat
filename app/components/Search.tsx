import { TouchableOpacity, View } from "react-native"
import { Icon } from "./Icon/Icon"
import { useState } from "react"
import { TextInput } from "react-native-gesture-handler"
import { s } from "app/utils/size"

export interface SearchProps {
    onSearch: (val: string) => Promise<void>
    color: IColors
    theme: string
}

export const Search = (props: SearchProps) => {
    const [visible, setVisible] = useState(false)
    const [label, setLabel] = useState<string>('')
    return <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    }}>
        {visible ? <TextInput value={label}
            cursorColor={props.color.text}
            style={{
                width: s(120),
                color: props.color.text,
                backgroundColor: props.color.background,
                fontSize: s(12),
                marginRight: s(12),
                borderRadius: s(8),
                height: s(32)
            }}
            onChangeText={(v) => {
                setLabel(v)
            }} /> : null}

        <TouchableOpacity
            onPress={async () => {
                if (visible) {
                    await props.onSearch(label)
                }
                setVisible(!visible)
            }}
            style={{
                backgroundColor: props.color.background,
                padding: s(8),
                borderRadius: s(8),
            }}>
            <Icon name={props.theme === 'dark'?'searchDark':'searchLight'} />
        </TouchableOpacity>
    </View>
}
