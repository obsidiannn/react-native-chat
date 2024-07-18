import { Screen } from "app/components"
import { ColorsState } from "app/stores/system"

import { Text,View } from "react-native"
import { useRecoilValue } from "recoil"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackParamList } from "app/navigators"
type Props = StackScreenProps<AppStackParamList, 'PlazaScreen'>;
export const PlazaScreen = ({ navigation }: Props) => {
  const $colors = useRecoilValue(ColorsState);
  return <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={$colors.background}>
    <View>
        <Text>plaza</Text>
    </View>
  </Screen>
}
