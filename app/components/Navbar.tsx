import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import React from "react";
import { Image, ImageStyle } from "expo-image";
import { goBack } from "app/navigators";
import { s, scale } from "app/utils/size";
import { ColorsState, ThemeState } from "app/stores/system";
import { useRecoilValue } from "recoil";
const Navbar = (props: {
    onLeftPress?: () => void;
    renderRight?: () => React.ReactNode;
    renderLeft?: () => React.ReactNode;
    renderCenter?: () => React.ReactNode;
    title?: string;
    rightStyle?: ViewStyle
}) => {
    const {
        title = '',
        onLeftPress = () => goBack(),
        renderLeft,
        renderCenter,
        renderRight,
        rightStyle
    } = props;
    const $theme = useRecoilValue(ThemeState)
    const $colors = useRecoilValue(ColorsState)
    return <View style={$container}>
        {<View style={$leftContainer}>
            {
                renderLeft ? renderLeft() : <Pressable style={[
                    $leftIconContainer,
                    {
                        backgroundColor: $theme == "dark" ? "#F0F2F525" : "#ffffff99"
                    }
                ]} onPress={() => onLeftPress()}>
                    <Image source={$theme == "dark" ? require('assets/icons/back-white.svg') : require('assets/icons/back.svg')} style={$leftIcon} />
                </Pressable>
            }
        </View>}
        {
            renderCenter ? renderCenter() : <View style={[$centerContainer]}>
                <Text style={[
                    $centerText,
                    {
                        color: $colors.text,
                    },
                ]}>{title}</Text>
            </View>
        }
        {
            <View style={{
                ...$rightContainer,
            }}>
                {renderRight ? renderRight() : null}
            </View>
        }
        {/* {
            renderRight ? renderRight() : <View style={{
                width: '20%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingRight: 10,
            }}>
                <TouchableOpacity onPress={onRightPress}>
                    <Icon name="dots-horizontal" size={20} color='#52525b' />
                </TouchableOpacity>
            </View>
        } */}
    </View>
}
const $container: ViewStyle = {
    height: scale(45),
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
}
const $leftContainer: ViewStyle = {
    height: scale(45),
    width: '20%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: scale(16),
}
const $leftIconContainer: ViewStyle = {
    width: scale(32),
    height: scale(32),
    borderRadius: s(10),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}
const $centerContainer: ViewStyle = {
    height: s(44),
    width: '60%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};
const $centerText: TextStyle = {
    fontSize: 16,
    fontWeight: '500',
}
const $rightContainer: ViewStyle = {
    width: '20%',
    alignItems: 'center'
}
const $leftIcon: ImageStyle = {
    width: s(4),
    height: s(8),
}

export default Navbar