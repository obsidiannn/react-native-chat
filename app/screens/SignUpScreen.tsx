import BlockButton from "app/components/BlockButton"
import Navbar from "app/components/Navbar"
import { ColorsState } from "app/stores/system"
import { s } from "app/utils/size"
import { Text, View } from "react-native"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { useState } from "react";
import { AuthService } from "app/services/auth.service";
import { PasswordInput } from "app/components/PasswordInput/PasswordInput"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { generatePrivateKey, Wallet } from "app/utils/wallet"
import { AuthUser, AuthWallet } from "app/stores/auth"
import { setNow, writePriKey } from "app/utils/account"
import { Init as DBInit } from "app/utils/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import { App } from "types/app"
type Props = NativeStackScreenProps<App.StackParamList, 'SignUpScreen'>;
export const SignUpScreen = ({navigation}:Props) => {
  const $colors = useRecoilValue(ColorsState);
  const [loading, setLoading] = useState(false);
  // 密码 与 确认密码
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const setAuthWallet =  useSetRecoilState(AuthWallet)
  const setAuthUser =  useSetRecoilState(AuthUser)
  const insets = useSafeAreaInsets();
  return <View style={{
    flex: 1,
    backgroundColor: $colors.secondaryBackground,
    paddingTop: insets.top,
  }}>
    <Navbar title="注册" />
    <View style={{
      marginTop: s(20),
      flex: 1,
      backgroundColor: "white",
      borderTopStartRadius: s(24),
      borderTopRightRadius: s(24),
    }}>
      <View style={{
        paddingHorizontal: s(16),
        marginTop: s(20),
        paddingTop: s(25),
      }}>
        <Text style={{
          color: $colors.text,
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
        <PasswordInput value={password} onChangeText={(v) => setPassword(v)} placeholder="请输入密码" />
      </View>
      <View style={{
        width: s(343),
        alignItems: 'center',
        marginTop: s(20),
        height: s(48),
        marginHorizontal: s(16),
      }}>
        <PasswordInput value={confirmPassword} onChangeText={v => setConfirmPassword(v)} placeholder="请再次确认密码" />
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
          color: $colors.secondaryText,
        }}>请设置安全密码，安全密码将用户保护你在本地的私钥</Text>
      </View>
      <View style={{
        width: s(343),
        height: s(48),
        marginHorizontal: s(16),
        marginTop: s(200),
      }}>
        <BlockButton loading={loading} onPress={async () => {
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
          console.log("创建账户")
          setLoading(true);

          const priKey = generatePrivateKey();
          global.wallet = new Wallet(priKey);
          await DBInit(global.wallet.getAddress());
          AuthService.signUp().then(async user => {
            console.log("注册用户的信息@@@@@",user);
            const result = await writePriKey(password, priKey);
            if(result){
              console.log("写入成功");
              setAuthWallet(global.wallet);
              setNow(priKey);
              if(global.wallet){
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
  </View>
}