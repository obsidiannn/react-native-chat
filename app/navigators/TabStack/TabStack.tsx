import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    WalletScreen,
    PlazaScreen,
    ChatScreen
} from '../../screens/index'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTab } from './BottomTab';
import { Header } from './Header';
import { View } from 'react-native';
import { App } from 'types/app';

export default () => {
    const insets = useSafeAreaInsets();
    const Stack = createBottomTabNavigator<App.StackParamList>();
    return <Stack.Navigator screenOptions={{
        headerShown: true,
        // header: () => null
        header: () => <Header />
    }} initialRouteName="ChatScreen" tabBar={(props) => {
        return <View style={{
            padding: 0,
            paddingBottom: insets.bottom,
            backgroundColor: "#07101D"
        }}>
            <BottomTab {...props} />
        </View>
    }}>
        <Stack.Screen name="PlazaScreen" component={PlazaScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="WalletScreen" component={WalletScreen} />
    </Stack.Navigator>
}