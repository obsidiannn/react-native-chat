import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { goBack } from "app/navigators";
import { scale, verticalScale } from "app/utils/size";
const Navbar = (props: {
    onLeftPress?: () => void;
    renderRight?: () => React.ReactNode;
    renderLeft?: () => React.ReactNode;
    renderCenter?: () => React.ReactNode;
    theme?: 'light' | 'dark';
    title?: string;
    backgroundColor?: string;
}) => {
    const {
        title = '',
        onLeftPress = () => goBack(),
        renderLeft,
        renderCenter,
        renderRight,
        theme = 'light',
    } = props;
    return <View style={[
        styles.container,
        theme === 'dark' ? {
            backgroundColor: 'black',
        } : null,
        {
           ...(props.backgroundColor ? {backgroundColor: props.backgroundColor} : null),
        }
    ]}>
        {<View style={styles.leftContainer}>
            {
                renderLeft ? renderLeft() : <TouchableOpacity style={styles.leftIconContainer} onPress={() => onLeftPress()}>
                    <Image 
                    source={theme == "dark" ? require('assets/icons/back.svg') : require('assets/icons/back.svg')} 
                    style={styles.leftIcon} />
                </TouchableOpacity>
            }
        </View>}
        {
            renderCenter ? renderCenter() : <View style={styles.centerContainer}>
                <Text style={[
                    styles.centerText,
                    theme === 'dark' ? {
                        color: 'white',
                    } : null,
                ]}>{title}</Text>
            </View>
        }
        {
            <View style={styles.rightContainer}>
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

const styles = StyleSheet.create({
    container: {
        height: verticalScale(44),
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
    },
    leftContainer: {
        height: verticalScale(50),
        width: '20%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingLeft: scale(16),
    },
    leftIconContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftIcon: {
        width: scale(8),
        height: scale(8),
    },
    centerContainer: {
        height: verticalScale(44),
        width: '60%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'black',
    },
    rightContainer: {
        height: verticalScale(44),
        width: '20%',
    },
});

export default Navbar