import BlockButton from "app/components/BlockButton"
import Navbar from "app/components/Navbar"
import { ColorsState } from "app/stores/system"
import { s } from "app/utils/size"
import { Text, View } from "react-native"
import { useRecoilState, useRecoilValue } from "recoil"
import { useState } from "react";
import { AuthService } from "app/services/auth.service";
import { PasswordInput } from "app/components/PasswordInput/PasswordInput"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { generatePrivateKey, Wallet } from "app/utils/wallet"
import { AuthWallet } from "app/stores/auth-user"
import { setNow, writePriKey } from "app/utils/account"
import { AppStackParamList } from "app/navigators"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
type Props = NativeStackScreenProps<AppStackParamList, 'SignUpScreen'>;
export const SignUpScreen = ({navigation}:Props) => {
  const $colors = useRecoilValue(ColorsState);
  const [loading, setLoading] = useState(false);
  // 密码 与 确认密码
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [,setAuthWallet] =  useRecoilState(AuthWallet)
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
        <BlockButton loading={loading} onPress={() => {
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
          AuthService.signUp().then(async user => {
            console.log(user);
            const result = await writePriKey(password, priKey);
            if(result){
              setAuthWallet(global.wallet);
              // 将user写入缓存
              setNow(priKey);
              navigation.replace('HomeScreen');
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