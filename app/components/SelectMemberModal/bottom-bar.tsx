import { scale, verticalScale } from "app/utils/size";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../Button";
import Checkbox from "expo-checkbox";
import { colors } from "app/theme";

export default (props: {
    onConfirm: () => void;
    checkedAll: boolean;
    onCheckedAllChange: (value: boolean) => void;
    primary: string
}) => {

    return <View style={styles.container}>
        <Checkbox style={{
            borderRadius: scale(15)
        }} color={props.primary} value={props.checkedAll} onValueChange={(value) => props.onCheckedAllChange(value)} />
        <Button style={{
            ...styles.button,
            backgroundColor: props.primary
        }} onPress={() => props.onConfirm()} >
            <Text style={{
                ...styles.buttonLabel,
                color: colors.palette.neutral100
            }}>完成</Text>
        </Button>
    </View>
}
const styles = StyleSheet.create({
    container: {
        height: verticalScale(60),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(15),
    },
    button: {
        borderRadius: scale(10),
        padding: scale(16),
        height: scale(32)
    },
    buttonLabel: {
        fontSize: scale(14),
        fontWeight: '500',
    }
});