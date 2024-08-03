
import { Pressable, TouchableOpacity, StyleSheet, Text, View, GestureResponderEvent, Platform } from "react-native"
import { forwardRef, useImperativeHandle, useState } from "react";
import { MessageType } from "./chat-ui";
import { s } from "app/utils/size";
import { Image } from "expo-image";


export interface LongPressModalType {
    open: (params: {
        message: MessageType.Any,
        e: GestureResponderEvent,
    }) => void;
}

export default forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false)
    const [layout, setLayout] = useState<number[]>([])
    const [height,setHeight] = useState<number>(0)
    const openModal = () => {
        setVisible(true)
    }

    const closeModal = () => {
        setVisible(false)
        setLayout([])
    }


    useImperativeHandle(ref, () => ({
        open: (params: {
            message: MessageType.Any,
            e: GestureResponderEvent
        }) => {
            params.e.target.measureInWindow((x, y, w, h) => {
                console.log('layout', x, y, w, h);
                setLayout([x, y, w, h])
            })
            openModal()
        }
    }));

    return <>
        {visible ? (
            <Pressable style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
            }}
                onPress={() => {
                    console.log('close');
                    closeModal()
                }}
            >
                <View
                    onLayout={(e)=>{
                        setHeight(e.nativeEvent.layout.height)
                    }}
                    // onStartShouldSetResponderCapture={(ev) => { return true }}
                    style={{
                        ...styles.modal_container,
                        ...(layout.length > 0 ? {
                            top:  layout[1] - height
                        } : {})
                    }}
                >
                    <TouchableOpacity style={styles.line_button_style}>
                        <Image source={require('assets/icons/copy.svg')} style={styles.icon_btn} />
                        <Text>复制</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.line_button_style}>
                        <Image source={require('assets/icons/share.svg')} style={styles.icon_btn} />
                        <Text>分享</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.line_button_style}>
                        <Image source={require('assets/icons/reference.svg')} style={styles.icon_btn} />
                        <Text>引用</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.line_button_style}>
                        <Image source={require('assets/icons/multi_select.svg')} style={styles.icon_btn} />
                        <Text>多选</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.line_button_style, { marginRight: 0 }]}>
                        <Image source={require('assets/icons/delete.svg')} style={styles.icon_btn} />
                        <Text>删除</Text>
                    </TouchableOpacity>
                </View>

            </Pressable>
        ) : null}

    </>


})


const styles = StyleSheet.create({
    modal_container: {
        backgroundColor: '#ffffff',
        position: 'absolute',

        display: 'flex',
        flexDirection: 'row',
        // alignItems: 'center',
        alignSelf: 'center',
        // justifyContent: 'space-around',
        padding: s(8),
        borderRadius: s(16),
        borderBottomEndRadius: 0,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            },
        }),

    },
    line_button_style: {
        padding: s(8),
        alignItems: 'center',
        marginRight: s(6)
    },
    icon_btn: {
        width: 32, height: 32,
        tintColor: '#4b5563',
    }
})
