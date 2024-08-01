import { TouchableOpacity, View } from "react-native"
import { Icon } from "./Icon/Icon"
import { useState } from "react"
import { TextInput } from "react-native-gesture-handler"
import { s, scale } from "app/utils/size"

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
                width: scale(120),
                color: props.color.text,
                backgroundColor: props.color.background,
                fontSize: scale(12),
                marginRight: scale(12),
                borderRadius: scale(8),
                height: scale(32)
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
                padding: scale(8),
                borderRadius: scale(8),
            }}>
            <Icon name={props.theme === 'dark'?'searchDark':'searchLight'} />
        </TouchableOpacity>
    </View>
}
