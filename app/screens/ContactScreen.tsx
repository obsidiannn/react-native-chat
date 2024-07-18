import { ColorsState, ThemeState } from "app/stores/system"
import {useEffect} from "react";
import { View, Text,StatusBar } from "react-native"
import { useRecoilValue } from "recoil"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackParamList } from "app/navigators"
import { s } from "app/utils/size"
import { useSafeAreaInsets } from "react-native-safe-area-context"
type Props = StackScreenProps<AppStackParamList, 'ContactScreen'>;
export const ContactScreen = ({ navigation }: Props) => {
  const $colors = useRecoilValue(ColorsState);
  const $theme = useRecoilValue(ThemeState);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if ($theme === 'dark') {
      StatusBar.setBarStyle('light-content');
    } else {
      StatusBar.setBarStyle('dark-content');
    }
  }, [])
  return <View style={{
    //paddingTop: insets.top,
    flex: 1,
  }}>
    <View style={{
      flex: 1,
      backgroundColor: '#07101D',
    }}>
      <View style={{
        flex: 1,
        backgroundColor: $colors.background,
        borderBottomLeftRadius: s(12),
        borderBottomRightRadius: s(12),
      }}>
        <View style={{
          height: s(45),  
        }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            backgroundColor: "red",
            alignItems: "center"
          }}>
            <Text>头像</Text>
            <View style={{
              flex: 1,
              flexDirection: 'column',
            }}>
              <Text>扫码</Text>
              <Text>二维码</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  </View>
}