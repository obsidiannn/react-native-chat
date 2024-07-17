import { Screen } from "app/components"
import BlockButton from "app/components/BlockButton"
import Navbar from "app/components/Navbar"
import { ColorsState } from "app/stores/system"
import { s } from "app/utils/size"
import { TextInput, View } from "react-native"
import { useRecoilValue } from "recoil"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackParamList } from "app/navigators"
type Props = StackScreenProps<AppStackParamList, 'SignUpScreen'>;
export const SignUpScreen = ({ navigation }: Props) => {
  const $colors = useRecoilValue(ColorsState);
  return <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={$colors.background}>
    <View style={{ flex: 1 }}>
      <Navbar title="注册" />
      <View style={{ flex: 1, backgroundColor: $colors.background }}>
        <View style={{
          width: s(375),
        }}>
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
          }} label="创建账户" type="primary" />
        </View>
      </View>
    </View>
  </Screen>
}
