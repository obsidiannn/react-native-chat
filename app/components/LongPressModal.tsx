
import { Pressable, Modal, StyleSheet, Text, Animated, View, Dimensions } from "react-native"
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { MessageType } from "./chat-ui";
import { scale } from "app/utils/size";

export interface LongPressModalType {
    open: (params: {
        message: MessageType.Any
    }) => void;
}

export default forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false)

    const screenHeight = Dimensions.get('window').height
    const slideAnim = new Animated.Value(screenHeight)

    const openModal = () => {
        setVisible(true)
        // Animated.timing(slideAnim, {
        //     toValue: screenHeight / 2,
        //     duration: 300,
        //     useNativeDriver: false
        // }).start()
    }

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: false
        }).start(() => { setVisible(false) })
    }


    useImperativeHandle(ref, () => ({
        open: (params: {
            message: MessageType.Any
        }) => {
            console.log('open');
            openModal()

        }
    }));


    return <Modal visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
        onStartShouldSetResponder={() => {
            closeModal()
            return true;
        }}
        style={{
            display: 'flex',
            flexDirection: 'column'

        }}
    >
        <Pressable style={{ height: '50%' }} onPress={closeModal}>

        </Pressable>
        <View style={{
            height: '50%',
            backgroundColor: 'pink',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <View>
                <Text>刪除</Text>
            </View>
        </View>
    </Modal>
})


const styles = StyleSheet.create({
    main_style: {
        height: '50%',
        width: '100%',
        backgroundColor: '#FF4B4B',
        borderRadius: scale(8)
    },
    line_button_style: {
        padding: scale(8)
    }
})
