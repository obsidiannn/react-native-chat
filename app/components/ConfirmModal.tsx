import { forwardRef, ReactNode, useImperativeHandle, useState } from "react";
import { ColorValue, Modal, Text, View, ViewStyle } from "react-native";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { Button } from "app/components";
export interface ConfirmModalOption {
    title: string;
    content: string;
    onSubmit?: () => void;
    onCancel?: () => void;
}
export interface ConfirmModalType {
    open: (option: ConfirmModalOption) => void;
}
export interface ConfirmModalType {
  open: (option: ConfirmModalOption) => void,
  close: () => void
}
const Card = (props: {
  rounded?: boolean,
  backgroundColor?: ColorValue,
  children: ReactNode,
  style?: ViewStyle
}) => {
  const $colors = useRecoilValue(ColorsState);
  return <View style={[
    {
      width: "100%",
      backgroundColor: props.backgroundColor ?? $colors.background,
      marginBottom: s(10),
      padding: s(16),
    },
    props.rounded && {
      borderRadius: s(20)
    },
    props.style
  ]}>
    {props.children}
  </View>
}
export const ConfirmModal = forwardRef((_, ref) => {
  const [visible, setVisible] = useState(false);
  const $colors = useRecoilValue(ColorsState);
  const [option,setOption]=useState<ConfirmModalOption>({
    title: "",
    content: "",
    onSubmit: () => { },
    onCancel: () => { }
  })
  useImperativeHandle(ref, () => ({
    open: (option: ConfirmModalOption) => {
        setVisible(true);
        setOption(option)
    },
    close: async () => setVisible(false)
  }));
  return (
    <Modal transparent={true} style={{ flex: 1}} visible={visible} animationType="slide" >
      <View style={{
        flex: 1,
        backgroundColor: "#000000cc",
        alignItems:"center",
        paddingHorizontal:s(16),
        justifyContent:"center"
      }}>
        <Card rounded>
          <View style={{
            marginVertical: s(16)
          }}>
            <Text style={{
              fontSize:s(16),
              color: $colors.text,
              fontWeight:"500",
              textAlign:"center"
            }}>{option.title}</Text>
          </View>
          <Text style={{
            fontSize: s(14),
            color: $colors.secondaryText,
            marginHorizontal:s(15)
          }}>{option.content}</Text>
          <View>
            <Button onPress={async () => {
                option.onSubmit?.();
                setVisible(false);
            }} containerStyle={{
              marginTop: s(15)
            }} rounded fullRounded size="large" label="确认"/>
            <Button onPress={() => setVisible(false)} containerStyle={{
              marginVertical: s(15)
            }} rounded fullRounded type="secondary" size="large" label="取消"/>
          </View>
        </Card>
      </View>
    </Modal>
  )
})
