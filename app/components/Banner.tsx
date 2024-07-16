import { scale } from "app/utils/size"
import { Image } from "expo-image"
import { Text, View,Platform } from "react-native"

export interface BannerProperty {
    label: string
    describe: string
    onPress: () => void
}

const BannerComponent = (props: BannerProperty) => {

    return <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: scale(12),
        ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
            },
            android: {
              elevation: 10,
            },
          }),
    }}>
        <View style={{
            marginHorizontal: scale(16)
        }}>
            <Text style={{fontSize: scale(18),fontWeight: 500,marginBottom: scale(4)}}>{props.label}</Text>
            <Text style={{fontSize: scale(16),color: '#777777'}}>{props.describe}</Text>
        </View>
        <Image source={require('assets/images/banner.png')}
            contentFit="contain"
            style={{ 
                height: scale(100),
                aspectRatio:1.6
            }}
        />
    </View>
}

export default BannerComponent