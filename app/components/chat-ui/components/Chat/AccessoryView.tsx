import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { ChatUiToolsKitProps } from "../../types";
import { Image } from "expo-image";
import { scale, verticalScale } from "app/utils/size";
import { colors } from "app/theme";

export interface InputToolsProps {
    tools?: ChatUiToolsKitProps[];
    onPress: (tool: ChatUiToolsKitProps) => void;
}
export default (props: InputToolsProps) => {
    const { tools, onPress } = props;
    return <View style={[styles.container]}>
        {(tools ?? []).map((tool, i) => {
            return <TouchableOpacity onPress={() => onPress(tool)} key={tool.key} style={{
                ...styles.item,
                marginTop: i > 3 ? 10 : 0,
            }}>
                <Image style={styles.icon} source={tool.icon} />
                <Text style={styles.title}>{tool.title}</Text>
            </TouchableOpacity>
        })}
    </View>
}
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: colors.palette.gray200,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    item: {
        width: '25%',
        alignItems: 'center',
        paddingVertical: scale(12),
        display: 'flex',
        flexDirection: 'column',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        width: scale(46),
        height: scale(46),
        borderRadius: scale(10),

    },
    title: {
        color: '#52525b',
        fontSize: scale(12),
        marginTop: scale(4),
        textAlign: 'center',
        marginVertical: verticalScale(5),
    }
});