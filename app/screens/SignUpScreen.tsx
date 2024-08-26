import { ThemeState } from "app/stores/system"
import { s } from "app/utils/size"
import { Text, View } from "react-native"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { useState } from "react";
import { AuthService } from "app/services/auth.service";
import { PasswordInput } from "app/components/PasswordInput/PasswordInput"
import { generatePrivateKey, Wallet } from "app/utils/wallet"
import { AuthUser, AuthWallet } from "app/stores/auth"
import { setNow, writePriKey } from "app/utils/account"
import { Init as DBInit } from "app/utils/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import { App } from "types/app"
import { $colors } from "app/Colors"
import { Button } from "app/components"
import { ScreenX } from "app/components/ScreenX";
type Props = NativeStackScreenProps<App.StackParamList, 'SignUpScreen'>;


export const SignUpScreen = ({ navigation }: Props) => {
  const $theme = useRecoilValue(ThemeState)
  const [loading, setLoading] = useState(false);
  // 密码 与 确认密码
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const setAuthWallet = useSetRecoilState(AuthWallet)
  const setAuthUser = useSetRecoilState(AuthUser)
  return <ScreenX title="注册" theme={$theme}>
    <View style={{
      flex: 1,
    }}>
      <View style={{
        paddingHorizontal: s(16),
        marginTop: s(20),
        paddingTop: s(25),
      }}>
        <Text style={{
          color: $theme == "dark" ? $colors.slate200 : $colors.black,
          fontSize: 16,
          fontWeight: "400"
        }}>设置安全密码</Text>
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
      }}>
        <PasswordInput theme={$theme} value={confirmPassword} onChangeText={v => setConfirmPassword(v)} placeholder="请再次确认密码" />
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
          color: $theme == "dark" ? $colors.gray400 : $colors.gray400,
        }}>请设置安全密码，安全密码将用户保护你在本地的私钥</Text>
      </View>
      <View style={{
        width: "100%",
        paddingHorizontal: s(16),
        marginTop: s(20),
      }}>
        <Button fullWidth fullRounded theme={$theme} size="large" loading={loading} onPress={async () => {
          if (!password) {
            alert("密码不能为空");
            return;
          }
          if (password.length < 8) {
            alert("密码不能低于8位");
            return;
          }
          if (password !== confirmPassword) {
            alert("两次密码不一致");
            return;
          }
          setLoading(true);

          const priKey = generatePrivateKey();
          global.wallet = new Wallet(priKey);
          await DBInit(global.wallet.getAddress());
          AuthService.signUp().then(async user => {
            const result = await writePriKey(password, priKey);
            if (result) {
              setAuthWallet(global.wallet);
              setNow(priKey);
              if (global.wallet) {
                setAuthUser(user);
              }
              navigation.replace('TabStack');
            }
          }).catch(e => {
            console.log(e)
            global.wallet = null;
          }).finally(() => {
            console.log()
            setLoading(false);
          })
        }} label="创建" type="primary" />
      </View>
    </View>
  </ScreenX>
}