
import { StyleSheet, Text, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { scale } from "app/utils/size";


export default (props: {
    style?: ViewStyle;
    textColor?: string;
    title: string;
    rightComponent?: ReactNode;
    onPress?: () => void;
}) => {
    return <TouchableWithoutFeedback onPress={props.onPress} >
        <View style={[styles.container, props.style]}>
            <Text style={{
                ...styles.text,
                color: props.textColor ?? '#000',
            }}>{props.title}</Text>
            {props.rightComponent}
        </View>
    </TouchableWithoutFeedback>
};

const styles = StyleSheet.create({
    container: {
        height: scale(50),
        borderRadius: scale(14),
        paddingHorizontal: scale(15),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F4F4F4',
        backgroundColor: '#F8F8F8',
    },
    text: {
        flex: 1,
        fontSize: scale(15),
        fontWeight: '400',
    }
});