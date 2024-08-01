import { s } from 'app/utils/size';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native"

export default (props: {
    remark: string;
}) => {
    const {t} = useTranslation('screens')
    return <View style={styles.container}>
        <Text style={styles.text}>{t('userInfo.label_remark')}{props.remark}</Text>
    </View>
}
const styles = StyleSheet.create({
    container: {
        borderRadius: s(16),
        borderWidth: 1,
        borderColor: '#F4F4F4',
        backgroundColor: '#F8F8F8',
        paddingHorizontal: s(15),
        paddingVertical: s(17),
    },
    text: {
        fontSize: s(16),
        color: '#333',
        fontWeight: '400',
    }
});
