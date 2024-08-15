import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import React from "react";
import { Image, ImageStyle } from "expo-image";
import { goBack } from "app/navigators";
import { s } from "app/utils/size";
import { ColorsState, ThemeState } from "app/stores/system";
import { useRecoilValue } from "recoil";
import { IconFont } from "./IconFont/IconFont";
const Navbar = (props: {
    onLeftPress?: () => void;
    renderRight?: () => React.ReactNode;
    renderLeft?: () => React.ReactNode;
    renderCenter?: () => React.ReactNode;
    title?: string;
    rightStyle?: ViewStyle
    style?: ViewStyle
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

    const renderTitle = () => {
        if (renderCenter) {
            return <View style={[$centerContainer]}>
                {renderCenter()}
            </View>
        } else {
            return <View style={[$centerContainer]}>
                <Text style={[
                    $centerText,
                    {
                        color: $colors.text,
                    },
                ]}>{title}</Text>
            </View>
        }
        return null
    }

    return <View style={[$container, {
        backgroundColor: $colors.secondaryBackground
    }, props.style]}>
        {<View style={$leftContainer}>
            {
                renderLeft ? renderLeft() : <Pressable style={[
                    $leftIconContainer,
                    {
                        backgroundColor: $colors.background
                    }
                ]} onPress={() => onLeftPress()}>
                    <IconFont name="arrowLeft" color={$colors.text} size={14} />
                </Pressable>
            }
        </View>}
        {
            renderTitle()
        }
        {
            <View style={{
                ...$rightContainer,
                ...rightStyle
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
    height: s(45),
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
}
const $leftContainer: ViewStyle = {
    height: s(45),
    width: '20%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: s(16),
}
const $leftIconContainer: ViewStyle = {
    width: s(32),
    height: s(32),
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
