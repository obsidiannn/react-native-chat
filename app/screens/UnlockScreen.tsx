import { Screen } from "app/components"
import BlockButton from "app/components/BlockButton"
import Navbar from "app/components/Navbar"
import { ColorsState, ThemeState } from "app/stores/system"
import { s } from "app/utils/size"
import { TextInput, TouchableOpacity, View } from "react-native"
import { useRecoilValue } from "recoil"
import { StackScreenProps } from "@react-navigation/stack"
import { useEffect, useState } from "react"
import { Image } from "expo-image"
import Crypto from "react-native-quick-crypto";
import { AuthService } from "app/services/auth.service"
type Props = StackScreenProps<App.StackParamList, 'UnlockScreen'>;
export const UnlockScreen = ({ navigation }: Props) => {
  const $colors = useRecoilValue(ColorsState);
  const [avatar, setAvatar] = useState('');
  const $theme = useRecoilValue(ThemeState);
  useEffect(()=>{
    const seed = Crypto.randomUUID();
    setAvatar('https://api.dicebear.com/8.x/fun-emoji/svg?seed='+seed);
},[])
  return <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={$colors.background}>
    <View style={{ flex: 1 }}>
      <Navbar title="" />
      <View style={{ flex: 1, backgroundColor: $colors.background }}>
        <View style={{
          width: s(375),
          height: s(64),
          alignItems: 'center',
          marginTop: s(40)
        }}>
          <TouchableOpacity style={{
            width: s(64),
            height: s(64),
            borderRadius: s(32),
            backgroundColor: $colors.primary,
          }} onPress={() => {
            console.log("选择图片")
          }}>
            {avatar ? <Image source={avatar} style={{
              width: s(64),
              height: s(64),
              borderRadius: s(32),
              borderWidth: 1,
              borderColor: '#f0f0f0',
            }} /> : null}
            <Image source={$theme == "dark" ? require('assets/icons/camera-dark.png') : require('assets/icons/camera-light.png')} style={{
              position: 'absolute',
              bottom: s(0),
              right: s(0),
              width: s(22),
              height: s(22),
              borderRadius: s(11),
            }} />
          </TouchableOpacity>
        </View>
        <View style={{
          width: s(343),
          height: s(48),
          marginTop: s(20),
          borderRadius: s(12),
          backgroundColor: "#414C5B",
          marginHorizontal: s(16),
          paddingHorizontal: s(16),
        }}>
          <TextInput style={{
            height: s(48),
            width: "100%",
            color: $colors.text
          }} placeholderTextColor={$colors.secondaryText} placeholder="昵称" />
        </View>
        <View style={{
          width: s(343),
          height: s(48),
          marginHorizontal: s(16),
          marginTop: s(40),
        }}>
          <BlockButton onPress={() => {
            console.log("创建账户")
            AuthService.signUp().then(user => {
              console.log(user);
            }).catch(e => {
              console.log(e)
              global.wallet = null;
            }).finally(() => {
              console.log()
            })
            // 请求服务器
            // 创建成功后保存用户信息
            // 直接跳转到首页
          }} label="创建账户" type="primary" />
        </View>
      </View>
    </View>
  </Screen>
}
