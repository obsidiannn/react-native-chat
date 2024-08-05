import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Text, TextStyle, View, ViewStyle } from "react-native";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { Button, Card } from "app/components";
export interface ConfirmModalOption {
  title: string;
  content: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export interface ConfirmModalType {
  open: (option: ConfirmModalOption) => void,
  close: () => void
}
export const ConfirmModal = forwardRef((_, ref) => {
  const [visible, setVisible] = useState(false);
  const $colors = useRecoilValue(ColorsState);
  const [option, setOption] = useState<ConfirmModalOption>({
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
    <Modal transparent={true} style={{ flex: 1 }} visible={visible} animationType="slide" >
      <View style={$container}>
        <Card rounded>
          <View style={$titleContainer}>
            <Text style={[$title,{color: $colors.text}]}>{option.title}</Text>
          </View>
          <Text style={[$content,{color: $colors.secondaryText}]}>{option.content}</Text>
          <View>
            <Button onPress={async () => {
              option.onSubmit?.();
              setVisible(false);
            }} containerStyle={{
              marginTop: s(15)
            }} rounded fullRounded size="large" label="确认" />
            <Button onPress={() => setVisible(false)} containerStyle={{
              marginVertical: s(15)
            }} rounded fullRounded type="secondary" size="large" label="取消" />
          </View>
        </Card>
      </View>
    </Modal>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#000000cc",
  alignItems: "center",
  paddingHorizontal: s(16),
  justifyContent: "center"
}
const $titleContainer: ViewStyle = {
  marginVertical: s(16)
}
const $title: TextStyle = {
  fontSize: s(16),
  fontWeight: "500",
  textAlign: "center"
}
const $content: TextStyle = {
  fontSize: s(14),
  marginHorizontal: s(15)
}