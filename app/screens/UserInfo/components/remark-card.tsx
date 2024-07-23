import { scale } from 'app/utils/size';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native"

export default (props: {
    remark: string;
}) => {
    const {t} = useTranslation('user-center')
    return <View style={styles.container}>
        <Text style={styles.text}>{t('label_remark')}{props.remark}</Text>
    </View>
}
const styles = StyleSheet.create({
    container: {
        borderRadius: scale(16),
        borderWidth: 1,
        borderColor: '#F4F4F4',
        backgroundColor: '#F8F8F8',
        paddingHorizontal: scale(15),
        paddingVertical: scale(17),
    },
    text: {
        fontSize: scale(16),
        color: '#333',
        fontWeight: '400',
    }
});