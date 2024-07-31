
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { forwardRef, ReactNode, useImperativeHandle, useState } from "react";
import { ColorValue, Modal, Platform, Text, View, ViewStyle } from "react-native";
import { useRecoilValue } from "recoil";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { dump } from "app/utils/account";
import toast from "app/utils/toast";
import dayjs from "dayjs";
import { Button } from "app/components";
export interface BackupPriKeyModalType {
  open: () => void,
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
export const BackupPriKeyModal = forwardRef((_, ref) => {
  const [visible, setVisible] = useState(false);
  const $colors = useRecoilValue(ColorsState);
  useImperativeHandle(ref, () => ({
    open: async () => setVisible(true),
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
            }}>备份私钥</Text>
          </View>
          <Text style={{
            fontSize: s(14),
            color: $colors.secondaryText,
            marginHorizontal:s(15)
          }}>备份私钥。</Text>
          <View>
            <Button onPress={async () => {
              if (Platform.OS == "android") {
                const fileName = FileSystem.documentDirectory + `bobo_backup_${dayjs().format("YYYYmmdhms")}.txt`;
                await FileSystem.writeAsStringAsync(fileName, dump(), { encoding: FileSystem.EncodingType.UTF8 })
                if(!Sharing.isAvailableAsync()){
                    toast("不能分享")
                }else{
                    Sharing.shareAsync(fileName)
                }
            } else {
                const fileName = FileSystem.cacheDirectory + `bobo_backup_${dayjs().format("YYYYmmdhms")}.txt`;
                await FileSystem.writeAsStringAsync(fileName, dump(), { encoding: FileSystem.EncodingType.UTF8 })
                if(!Sharing.isAvailableAsync()){
                    toast("不能分享")
                }else{
                    Sharing.shareAsync(fileName)
                }
            }
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