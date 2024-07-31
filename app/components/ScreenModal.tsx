import Navbar from "app/components/Navbar";
import { ColorsState } from "app/stores/system";
import { forwardRef, useImperativeHandle, useState } from "react"
import { Modal, View, ViewStyle } from "react-native"
import { Gesture, GestureDetector, GestureStateChangeEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
export interface ScreenModalType {
    open: () => void;
    close: () => void;
}
export const ScreenModal = forwardRef((props: {
    style?: ViewStyle;
    children?: React.ReactNode;
}, ref) => {
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const onSwipeEnd = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        if (event.translationX > 0) {
            setVisible(false)
        }
    };
    const gesture = Gesture.Pan().onEnd((event) => runOnJS(onSwipeEnd)(event));
    useImperativeHandle(ref, () => ({
        open: async () => setVisible(true),
        close: async () => setVisible(false)
    }));
    return (
        <Modal transparent={false} style={{ flex: 1 }} visible={visible} animationType="slide" >
            <GestureDetector gesture={gesture}>
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
            </GestureDetector>
        </Modal>
    )
})