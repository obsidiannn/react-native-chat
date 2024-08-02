import Navbar from "app/components/Navbar";
import { ColorsState } from "app/stores/system";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { BackHandler, Modal, Platform, View, ViewStyle } from "react-native"
import { Gesture, GestureDetector, GestureStateChangeEvent, PanGestureHandlerEventPayload, gestureHandlerRootHOC } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
export interface ScreenModalType {
    open: () => void;
    close: () => void;
}
const WithHoc = gestureHandlerRootHOC((props: {
    children?: React.ReactNode;
}) => {
    return <View style={{ flex: 1 }}>{props.children}</View>
});
export const ScreenModal = forwardRef((props: {
    style?: ViewStyle;
    title?: string
    children?: React.ReactNode;
}, ref) => {
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const onSwipeEnd = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        if (event.translationX > 0) {
            console.log("swipe end");
            setVisible(false)
        }
    };
    const gesture = Gesture.Pan().onEnd((event) => runOnJS(onSwipeEnd)(event));
    useImperativeHandle(ref, () => ({
        open: async () => setVisible(true),
        close: async () => setVisible(false)
    }));
    useEffect(() => {
        if (Platform.OS = "android") {
            BackHandler.addEventListener('hardwareBackPress', () => {
                setVisible(false)
                return true
            })
        }
        return () => {
            if (Platform.OS = "android") {
                BackHandler.removeEventListener('hardwareBackPress', () => {
                    setVisible(false)
                    return true
                })
            }
        }
    }, [])
    return <Modal transparent={false} style={{ flex: 1 }} visible={visible} animationType="slide">
        <View style={[
            {
                paddingTop: insets.top,
                flex: 1,
                backgroundColor: $colors.secondaryBackground,
            },
            props.style
        ]}>
            <Navbar onLeftPress={() => setVisible(false)} />
            {props.children}
        </View>
    </Modal>
    // if (Platform.OS == "ios") {
    //     return (
    //         <Modal transparent={false} style={{ flex: 1 }} visible={visible} animationType="slide">
    //             <GestureDetector gesture={gesture}>
    //                 <View style={[
    //                     {
    //                         paddingTop: insets.top,
    //                         flex: 1,
    //                         backgroundColor: $colors.secondaryBackground,
    //                     },
    //                     props.style
    //                 ]}>
    //                     <Navbar onLeftPress={() => setVisible(false)} />
    //                     {props.children}
    //                 </View>
    //             </GestureDetector>
    //         </Modal>
    //     )
    // }
    // return (
    //     <Modal transparent={false} style={{ flex: 1 }} visible={visible} animationType="slide">
    //         <WithHoc>
    //             <GestureDetector gesture={gesture}>
    //                 <View style={[
    //                     {
    //                         paddingTop: insets.top,
    //                         flex: 1,
    //                         backgroundColor: $colors.secondaryBackground,
    //                     },
    //                     props.style
    //                 ]}>
    //                     <Navbar onLeftPress={() => setVisible(false)} />
    //                     <>
    //                         {props.children}
    //                     </>
    //                 </View>
    //             </GestureDetector>
    //         </WithHoc>
    //     </Modal>
    // )

})