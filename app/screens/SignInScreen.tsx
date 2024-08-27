import { Screen } from "app/components"
import BlockButton from "app/components/BlockButton"
import Navbar from "app/components/Navbar"
import { ColorsState } from "app/stores/system"
import { s } from "app/utils/size"
import { View } from "react-native"
import { useRecoilValue } from "recoil"
import { useRef } from "react"
import { StackScreenProps } from "@react-navigation/stack"
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import toast from "app/utils/toast"
import { restore } from "app/utils/account"
import { App } from "types/app"
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal"
type Props = StackScreenProps<App.StackParamList, 'SignInScreen'>;
export const SignInScreen = ({ navigation }: Props) => {
  const $colors = useRecoilValue(ColorsState)
  const confirmModalRef = useRef<ConfirmModalType>(null);

  return <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={$colors.background}>
    <View style={{ flex: 1 }}>
      <Navbar title="登录" />
      <View style={{ flex: 1, backgroundColor: $colors.background }}>
        <View style={{
          width: s(343),
          height: s(48),
          marginHorizontal: s(16),
        }}>
          <BlockButton onPress={() => {
            navigation.navigate('UnlockScreen')
          }} label="登录本地账户" type="primary" />
        </View>
        <View style={{
          width: s(343),
          height: s(48),
          marginHorizontal: s(16),
          marginTop: s(10),
        }}>
          <BlockButton onPress={async () => {
            confirmModalRef.current?.open({
              title: "是否导入备份文件？",
              content: "导入后将覆盖已有的本地数据，导入后应用将重启。",
              onCancel: () => { },
              onSubmit: async () => {
                const result = await DocumentPicker.getDocumentAsync({
                  copyToCacheDirectory: true
                })
                if (result.assets) {
                  const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                    encoding: FileSystem.EncodingType.UTF8
                  })
                  if (restore(content)) {
                    toast("导入成功!");
                    setTimeout(() => {
                      navigation.navigate("UnlockScreen");
                    }, 1000);
                  }
                }
              }
            })

          }} label="导入备份文件" />
        </View>
      </View>
    </View>
    <ConfirmModal ref={confirmModalRef} />
  </Screen>
}
