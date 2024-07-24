import { colors } from "app/theme";
import { scale } from "app/utils/size";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default (props: {
    alphabet: string[];
    onScrollToIndex: (v: number) => void;
    contactAlphabetIndex: { [key: string]: number };
}) => {
    const insets = useSafeAreaInsets();
    const alphabetPageY = useRef(0);
    const [alphabetIndex, setAlphabetIndex] = useState(0);
    const [alphabetFocus, setAlphabetFocus] = useState(false);
    return <View style={{
        ...styles.container,
    }}>
        <View onLayout={(event) => {
            alphabetPageY.current = event.nativeEvent.layout.y;
        }} onTouchStart={() => {
            setAlphabetFocus(true);
        }} onTouchEnd={() => {
            setTimeout(() => {
                setAlphabetFocus(false);
            }, 5000);
        }} onTouchMove={(e) => {
            const y = e.nativeEvent.pageY - alphabetPageY.current - insets.top;
            const index = Math.ceil(y / 17);
            if (index > 0 && index <= props.alphabet.length) {
                if (props.alphabet[index - 1] in props.contactAlphabetIndex) {
                    setAlphabetIndex(index - 1);
                    console.log(props.contactAlphabetIndex,props.alphabet[index - 1]);
                    props.onScrollToIndex(props.contactAlphabetIndex[props.alphabet[index - 1]]);
                }
            }
        }}>
            {props.alphabet.map((item, index) => {
                return <TouchableOpacity onPress={() => {
                    setAlphabetIndex(index);
                    props.onScrollToIndex(props.contactAlphabetIndex[item]);
                }} key={index} style={{
                    ...styles.itemContainer,
                    backgroundColor: (alphabetIndex == index && alphabetFocus) ? colors.palette.primary : '#ffffff00',
                }}>
                    <Text style={{ ...styles.text, color: (alphabetIndex != index || !alphabetFocus) ? colors.palette.primary : 'white', }}>{item}</Text>
                </TouchableOpacity>
            })}
        </View>
    </View>
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemContainer: {
        width: scale(16),
        height: scale(16),
        display: 'flex',
        borderRadius: scale(8),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1
    },
    text:{
        color: '#999',
        fontWeight: '600',
        fontSize: 10,
    }
});