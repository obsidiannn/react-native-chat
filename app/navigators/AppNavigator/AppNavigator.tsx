/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import {
  LinkingOptions,
  NavigationContainer,
} from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import messaging from '@react-native-firebase/messaging';
import React, { useEffect } from "react"
import { Appearance, Linking, StatusBar } from "react-native"
import * as Screens from "app/screens"
import Config from "../../config"
import { navigationRef, useBackButtonHandler } from "./../navigationUtilities"
import { colors } from "app/theme"
import { useSetRecoilState } from "recoil";
import { NetworkState, ThemeState } from "app/stores/system";
import UserChatInfoModal from 'app/screens/UserChat/UserChatInfoModal'

import { init as KVInit } from "app/utils/kv-tool";
import { getNow } from "app/utils/account";
import { Wallet } from "app/utils/wallet";
import { AuthUser, AuthWallet } from "app/stores/auth";
import TabStack from "./../TabStack/TabStack";
import { Init as DBInit } from "app/utils/database";
import NetInfo from '@react-native-community/netinfo';
import { LocalUserService } from "app/services/LocalUserService";
import { AuthService } from "app/services/auth.service";
import { AppStackParamList } from "./type";

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="WelcomeScreen"
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
    >
      <Stack.Screen name="TabStack" component={TabStack} />
      <Stack.Screen name="UserChatScreen" component={Screens.UserChatScreen} />
      {/* <Stack.Screen name="ChatScreen" component={Screens.ChatScreen} /> */}
      <Stack.Screen name="WelcomeScreen" component={Screens.WelcomeScreen} />
      <Stack.Screen name="WebViewScreen" options={{ presentation: "modal" }} component={Screens.WebViewScreen} />
      <Stack.Screen name="SignInScreen" component={Screens.SignInScreen} />
      <Stack.Screen name="SignUpScreen" component={Screens.SignUpScreen} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="UserChatInfoModal" component={UserChatInfoModal} />
      </Stack.Group>
    </Stack.Navigator>
  )
}


export const AppNavigator = () => {
  const setThemeState = useSetRecoilState(ThemeState);
  const setAuthWallet = useSetRecoilState(AuthWallet)
  const setNetworkState = useSetRecoilState(NetworkState);
  const setAuthUser = useSetRecoilState(AuthUser)
  useEffect(() => {
    const v = Appearance.getColorScheme()
    setThemeState(v === "dark" ? 'dark' : 'light');
    StatusBar.setBarStyle(v === "dark" ? 'dark-content' : 'light-content');
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setThemeState(colorScheme === "dark" ? 'dark' : 'light'));
    const networkSubscription = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        setNetworkState(true)
      } else {
        setNetworkState(false)
        console.log('Disconnected');
      }
    });
    return () => {
      subscription.remove()
      networkSubscription();
    };
  }, []);
  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))
  const linking: LinkingOptions<AppStackParamList> = {
    enabled: true,
    prefixes: ['https://mychat.com', 'next-chat://'],
    config: {
      screens: {
        ChatScreen: 'chat/:id',
        GroupScreen: 'group/:id',
        UserScreen: 'user/:user_name',
      },
    },
    async getInitialURL() {
      const url = await Linking.getInitialURL();

      if (url != null) {
        return url;
      }
      const message = await messaging().getInitialNotification();
      return message?.data?.url as string;
    },
    subscribe(listener) {
      const onReceiveURL = ({ url }: { url: string }) => listener(url);
      const subscription = Linking.addEventListener('url', onReceiveURL);
      const unsubscribeNotification = messaging().onNotificationOpenedApp(
        (message: any) => {
          const url = message.data?.url;
          if (url) {
            listener(url);
          }
        }
      );

      return () => {
        subscription.remove();
        unsubscribeNotification();
      };
    },
  };
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={async () => {
        await KVInit();
        const now = getNow()
        if (now) {
          global.wallet = new Wallet(now);
          setAuthWallet(global.wallet);
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'TabStack' }],
          })
          await DBInit(global.wallet.getAddress());
          const user = await LocalUserService.findByAddr(global.wallet.getAddress())
          if (user) {
            setAuthUser(user)
          }
          NetInfo.fetch().then((state) => {
            if (state.isConnected) {
              setNetworkState(true)
              AuthService.getInfo().then((v) => {
                setAuthUser(v)
              }).catch(e => console.log(e))
              // 刷新请求地址
              // 上报firebase token
              // 连接websocket
            } else {
              setNetworkState(false)
            }
          })
        }
      }}
    >
      <AppStack />
    </NavigationContainer>
  )
}
