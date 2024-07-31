import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from "react"
import { ColorValue, Linking, Platform, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
export interface UpgradeModalType {
  open: () => void,
  close: () => void
}
const Card = (props: {
  rounded?: boolean,
  backgroundColor?: ColorValue,
  children: ReactNode,
  style?: ViewStyle
}) => {
  const $colors = useRecoilValue(ColorsState);
  return <View style={[
    {
      width: "100%",
      backgroundColor: props.backgroundColor ?? $colors.background,
      marginBottom: s(10),
      padding: s(16),
    },
    props.rounded && {
      borderRadius: s(20)
    },
    props.style
  ]}>
    {props.children}
  </View>
}
const Button = (props: {
  label: string,
  backgroundColor?: ColorValue,
  fullWidth?: boolean,
  size?: "small",
  rounded?: boolean,
  containerStyle?: ViewStyle,
  textStyle?: TextStyle,
  onPress?: () => void,
}) => {
  const $colors = useRecoilValue(ColorsState);
  const $theme = useRecoilValue(ThemeState);
  const { fullWidth = false, rounded = true, size = "small", label, containerStyle, textStyle } = props;
  const $container: Record<string, ViewStyle> = {
    "small": {
      borderRadius: rounded ? s(7) : 0,
      paddingHorizontal: s(13),
      paddingVertical: s(8)
    }
  }
  const $label: Record<string, TextStyle> = {
    "small": {
      fontSize: s(14),
      fontWeight: "400",
    }
  }
  return <TouchableOpacity onPress={props.onPress} style={[
    {
      backgroundColor: props.backgroundColor ?? $colors.primary,
    },
    $container[size],
    fullWidth && {
      width: "100%",
    },
    containerStyle,
  ]}>
    <Text style={[
      {
        color: "white"
      },
      $label[size],
      textStyle,
    ]}>{label}</Text>
  </TouchableOpacity>
}
const VersionListItem = (props: {
  item: {
    version: string;
    androidDownloadUrl: string;
    iosDownloadUrl: string;
    description: string;
  }
}) => {
  const $colors = useRecoilValue(ColorsState);
  const { item } = props;
  return <Card rounded>
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: s(5),
      alignItems: "center",
    }}>
      <Text style={{
        fontSize: s(16),
        fontWeight: "600",
        color: $colors.text
      }}>{item.version}</Text>
      <Button onPress={() => {
        Linking.openURL(Platform.OS === "ios" ? item.iosDownloadUrl : item.androidDownloadUrl)
      }} label="下载" />
    </View>
    <View style={{
      width: "100%",
      height: s(1),
      backgroundColor: "#F3F4F6",
      marginVertical: s(10)
    }}></View>
    <View>
      <Text style={{
        fontSize: s(15),
        fontWeight: "400",
        color: $colors.secondaryText
      }}>{item.description}</Text>
    </View>
  </Card>
}
export const UpgradeModal = forwardRef((_, ref) => {
  const screenModalRef = useRef<ScreenModalType>(null);
  const insets = useSafeAreaInsets();
  useImperativeHandle(ref, () => ({
    open: async () => screenModalRef.current?.open(),
    close: async () => screenModalRef.current?.close()
  }));
  const [items, setItems] = useState<string[]>(["1", "2"]);
  return (
    <ScreenModal ref={screenModalRef} >
      <View style={{
        flex: 1,
        width: s(375),
        paddingHorizontal: s(16),
        paddingTop: s(20)
      }}>
        <ScrollView style={{
          flex: 1,
        }}>
          {items.map((item) => {
            return <VersionListItem key={item} item={{
              version: "0.2.9",
              iosDownloadUrl: "https://baidu.com",
              androidDownloadUrl: "https://baidu.com",
              description: "更新内容"
            }} />
          })}
        </ScrollView>
      </View>
    </ScreenModal>
  )
})