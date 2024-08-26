import { ThemeState } from "app/stores/system"
import { s } from "app/utils/size"
import { Text, View } from "react-native"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { useRef, useState } from "react";
import { PasswordInput } from "app/components/PasswordInput/PasswordInput"
import { Wallet } from "app/utils/wallet"
import { AuthUser, AuthWallet } from "app/stores/auth"
import { readPriKey, restore, setNow } from "app/utils/account"
import { Init as DBInit } from "app/utils/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import { App } from "types/app"
import { LocalUserService } from "app/services/LocalUserService"
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal"
import toast from "app/utils/toast"
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Button } from "app/components"
import { ScreenX } from "app/components/ScreenX"
import { $colors } from "app/Colors";
type Props = NativeStackScreenProps<App.StackParamList, 'UnlockScreen'>;
export const UnlockScreen = ({ navigation }: Props) => {
  const $theme = useRecoilValue(ThemeState)
  // 密码 与 确认密码
  const [password, setPassword] = useState('');
  const setAuthWallet = useSetRecoilState(AuthWallet)
  const setAuthUser = useSetRecoilState(AuthUser)
  const confirmModalRef = useRef<ConfirmModalType>(null);
  return <ScreenX theme={$theme} title="解锁账户">
    <View style={{
      paddingHorizontal: s(16),
      marginTop: s(20),
      paddingTop: s(25),
    }}>
      <Text style={{
        color: $theme == "dark" ? $colors.slate200 : $colors.slate700,
        fontSize: 16,
        fontWeight: "400"
      }}>输入安全密码</Text>
    </View>
    <View style={{
      width: s(343),
      alignItems: 'center',
      marginTop: s(20),
      height: s(48),
      marginHorizontal: s(16),
    }}>
      <PasswordInput theme={$theme} value={password} onChangeText={(v) => setPassword(v)} placeholder="请输入密码" />
    </View>
    <View style={{
      width: s(343),
      alignItems: 'center',
      marginTop: s(20),
      height: s(48),
      marginHorizontal: s(16),
      paddingHorizontal: s(16),
    }}>
      <Text style={{
        fontSize: 14,
        color: $colors.slate400,
      }}>请输入安全密码，安全密码将用户保护你在本地的私钥</Text>
    </View>
    <View style={{
      paddingHorizontal: s(16),
      marginTop: s(10),
    }}>
      <Button theme={$theme} size="large" fullWidth fullRounded onPress={async () => {
        if (!password) {
          alert("密码不能为空");
          return;
        }
        if (password.length < 8) {
          alert("密码不能低于8位");
          return;
        }
        const priKey = readPriKey(password)
        global.wallet = new Wallet(priKey);
        setNow(priKey);
        await DBInit(global.wallet.getAddress());
        const user = await LocalUserService.findByAddr(global.wallet.getAddress())
        console.log("本地用户", user);
        if (user) {
          setAuthUser(user);
        }
        setAuthWallet(global.wallet);
        navigation.replace('TabStack');
      }} label="登录" type="primary" />
      <Button theme={$theme} containerStyle={{ marginTop: s(20)}} fullRounded type="secondary" size="large" fullWidth onPress={async () => {
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
    <ConfirmModal theme={$theme} ref={confirmModalRef} />
  </ScreenX>
}