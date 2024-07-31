import { Screen } from "app/components"
import BlockButton from "app/components/BlockButton"
import Navbar from "app/components/Navbar"
import { ColorsState } from "app/stores/system"
import { s } from "app/utils/size"
import { Text, TextInput, TouchableOpacity, View } from "react-native"
import { useRecoilValue } from "recoil"
import * as Clipboard from 'expo-clipboard';
import { useRef, useState } from "react"
import { StackScreenProps } from "@react-navigation/stack"
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import toast from "app/utils/toast"
import { restore } from "app/utils/account"
import { App } from "types/app"
import ConfirmModal, { ConfirmModalType } from "app/components/ConfirmModal"
type Props = StackScreenProps<App.StackParamList, 'SignInScreen'>;
export const SignInScreen = ({ navigation }: Props) => {
  const $colors = useRecoilValue(ColorsState)
  const [priKey, setPriKey] = useState('');
  const [ready, setReady] = useState(false);
  const confirmModalRef = useRef<ConfirmModalType>(null);
  return <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={$colors.background}>
    <View style={{ flex: 1 }}>
      <Navbar title="登录" />
      <View style={{ flex: 1, backgroundColor: $colors.background }}>
        <View style={{
          width: s(343),
          marginTop: s(40),
          borderRadius: s(22),
          backgroundColor: '#656C7799',
          height: s(270),
          padding: s(16),
          marginHorizontal: s(16),
        }}>
          <TextInput
            onChangeText={(v) => {
              setPriKey(v)
              setReady(/^[0-9a-fA-F]{64}$/.test(v));
            }}
            value={priKey} multiline placeholderTextColor={$colors.secondaryText} placeholder="请输入账户对应的私钥 我们不会保存您的私钥" />
        </View>
        <View style={{
          width: s(343),
          height: s(48),
          marginHorizontal: s(16),
          marginTop: s(30),
          marginBottom: s(71)
        }}>
          <TouchableOpacity onPress={async () => {
            const v = await Clipboard.getStringAsync()
            setReady(/^[0-9a-fA-F]{64}$/.test(v));
            setPriKey(v);
          }} style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center"
          }}>
            <Text style={{
              color: $colors.text,
              fontSize: s(16),
              fontWeight: "400",
              paddingHorizontal: s(38),
              borderRadius: s(20),
              lineHeight: s(40),
              borderWidth: 1,
              height: s(40),
              borderColor: $colors.border,
            }}>粘贴私钥</Text>
          </TouchableOpacity>
        </View>
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
              desc: "是否导入备份文件？",
              title: "导入后将覆盖本地数据",
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
        <View style={{
          width: s(343),
          height: s(48),
          marginHorizontal: s(16),
          marginTop: s(10),
        }}>
          <BlockButton disabled={!ready} label="下一步" type="secondary" />
        </View>
      </View>
    </View>
    <ConfirmModal ref={confirmModalRef} />
  </Screen>
}
