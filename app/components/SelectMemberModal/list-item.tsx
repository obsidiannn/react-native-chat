import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { SelectMemberOption } from "./index";
import Checkbox from "expo-checkbox";
import { scale } from "app/utils/size";


export default (props: {
    item: SelectMemberOption;
    index: number;
    isLast: boolean;
    onChange: (value: boolean) => void;
    primary: string
}) => {
    const { item, isLast, onChange } = props;
    return <View style={styles.container}>
        <Checkbox disabled={item.disabled} style={{
            marginRight: scale(15),
            borderRadius: scale(15)
        }} color={props.primary} value={item.status} onValueChange={(value) => onChange(value)} />
        <TouchableOpacity onPress={() => {
            if (!item.disabled) {
                onChange(!item.status)
            }
        }} style={{
            ...styles.rightContainer,
            borderBottomWidth: isLast ? 0 : 1,
        }}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
    </View>
}
const styles = StyleSheet.create({
    titleContainer: {
        height: scale(51),
        display: 'flex',
        justifyContent: 'center',
        paddingLeft: scale(15),
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: scale(66),
        paddingRight: scale(26),
        paddingLeft: scale(15),
    },
    rightContainer: {
        height: scale(66),
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#ECECEC',
    },
    icon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        borderColor: '#F0F0F0',
        borderWidth: 1,
        marginRight: scale(10),
    },
    name: {
        fontSize: scale(14),
        fontWeight: '500',
        color: '#333',
    }
});
