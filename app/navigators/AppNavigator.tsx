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
import { Appearance, Linking } from "react-native"
import * as Screens from "app/screens"
import Config from "../config"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { colors } from "app/theme"
import { useSetRecoilState } from "recoil";
import { ThemeState } from "app/stores/system";
export type AppStackParamList = {
  WelcomeScreen: undefined;
  // 🔥 Your screens go here
  Login: undefined;
  GroupScreen: undefined;
  ChatScreen: undefined;
  UserScreen: undefined;
  UserChatScreen: undefined;
  WebViewScreen: {
    title: string;
    url: string;
  };
  SignInScreen: undefined;
  SignUpScreen: undefined;
  UnlockScreen: undefined;
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

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
      <Stack.Screen name="UserChatScreen" component={Screens.UserChatScreen} />
      <Stack.Screen name="ChatScreen" component={Screens.ChatScreen} />
      <Stack.Screen name="WelcomeScreen" component={Screens.WelcomeScreen} />
      <Stack.Screen name="WebViewScreen" options={{presentation: "modal" }} component={Screens.WebViewScreen} />
      <Stack.Screen name="SignInScreen" component={Screens.SignInScreen} />
      <Stack.Screen name="SignUpScreen" component={Screens.SignUpScreen} />
    </Stack.Navigator>
  )
}


export const AppNavigator = () => {
  const setThemeState = useSetRecoilState(ThemeState);
  useEffect(() => {
    const v = Appearance.getColorScheme()
    setThemeState(v === "dark" ? 'dark' : 'light');
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setThemeState(colorScheme === "dark" ? 'dark' : 'light'));
    return () => subscription.remove();
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
      onReady={() => console.log('Navigation container is ready')}
    >
      <AppStack />
    </NavigationContainer>
  )
}
