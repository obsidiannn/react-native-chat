import { Text, TouchableOpacity, View } from "react-native"
import { useRef, useState } from "react"
import { TextInput } from "react-native-gesture-handler"
import { s } from "app/utils/size"
import { IconFont } from "app/components/IconFont/IconFont"
import { MessageType } from "../chat-ui"


export interface SearchProps {
    onSearch: (val: string, searchType: MessageType.Any['type']) => Promise<void>
    color: IColors
}

export const SearchInput = (props: SearchProps) => {
    const [label, setLabel] = useState<string>('')
    const [show, setShow] = useState<boolean>(true)
    const textInputRef = useRef<TextInput>(null)

    const renderSearchInput = () => {
        if (label && label !== '') {
            return <TouchableOpacity
                onPress={() => {
                    props.onSearch && props.onSearch(label, 'text')
                    setShow(false)
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: s(42),
                }}>
                <Text style={{
                    fontSize: s(14),
                    color: '#00A423'
                }}>
                    搜索“{label}”
                </Text>
            </TouchableOpacity>
        }
        return <TouchableOpacity
            onPress={() => {
                props.onSearch && props.onSearch(label, 'image')
            }}
            style={{
                display: 'flex',
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                borderColor: props.color.border,
                borderWidth: s(0.5),
                padding: s(8),
                borderRadius: s(24),
                marginTop: s(12)
            }}>
            <Text>图片搜索</Text>
        </TouchableOpacity>
    }
    return <View style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    }}>

        <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: props.color.secondaryBackground,
            borderRadius: s(24),
            paddingHorizontal: s(8)
        }}>
            <IconFont name="search" size={32} color={props.color.secondaryText} />
            <TextInput

                ref={textInputRef}
                activeCursor="auto"
                value={label}
                cursorColor={props.color.text}
                style={{
                    flex: 1,
                    color: props.color.text,
                    borderRadius: s(24),
                    fontSize: s(12),
                    height: s(42),
                }}
                onChangeText={(v) => {
                    setLabel(v)
                    setShow(true)
                }} >

            </TextInput>

            {
                label !== '' ? <TouchableOpacity
                    onPress={() => {
                        setLabel('')
                        setShow(true)
                    }}
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: s(4),
                        borderRadius: s(24),
                        backgroundColor: props.color.background
                    }}>
                    <IconFont name="close" size={16} color={props.color.text} />
                </TouchableOpacity> : null
            }
        </View>
        {
            show && renderSearchInput()
        }
    </View>
}
