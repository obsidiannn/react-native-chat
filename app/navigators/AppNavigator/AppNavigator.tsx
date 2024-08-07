import {
  LinkingOptions,
  NavigationContainer,
} from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import messaging from '@react-native-firebase/messaging';
import React, { useCallback, useContext, useEffect } from "react"
import { AppState, Appearance, Linking, StatusBar } from "react-native"
import * as Screens from "app/screens"
import Config from "../../config"
import { navigationRef, useBackButtonHandler } from "./../navigationUtilities"
import { colors } from "app/theme"
import { useSetRecoilState } from "recoil";
import { NetworkState, ThemeState } from "app/stores/system";

import { init as KVInit } from "app/utils/kv-tool";
import { getNow } from "app/utils/account";
import { Wallet } from "app/utils/wallet";
import { AuthUser, AuthWallet, ChatsStore } from "app/stores/auth";
import TabStack from "./../TabStack/TabStack";
import { Init as DBInit } from "app/utils/database";
import NetInfo from '@react-native-community/netinfo';
import { LocalUserService } from "app/services/LocalUserService";
import { AuthService } from "app/services/auth.service";
import chatService from "app/services/chat.service";

import { SocketContext } from "app/components/socket";
import { IUser } from "drizzle/schema";
import { SystemService } from "app/services/system.service";
import { App } from "types/app";


const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof App.StackParamList> = NativeStackScreenProps<App.StackParamList, T>

const Stack = createNativeStackNavigator<App.StackParamList>()

const AppStack = () => {
  const setAuthUser = useSetRecoilState(AuthUser)
  const setChatsStore = useSetRecoilState(ChatsStore)
  const socketContext = useContext(SocketContext)

  const setAuthWallet = useSetRecoilState(AuthWallet)
  const setNetworkState = useSetRecoilState(NetworkState);
  const loadOnlineData = useCallback(() => {
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        await SystemService.refreshNodes()
        setNetworkState(true)
        AuthService.getInfo().then((v) => {
          setAuthUser(v)
          AppState.addEventListener('change', nextAppState => {
            socketContext.setAppState(nextAppState);
            if (nextAppState == "background") {
              // 关闭socket
              socketContext.close();
            }
            if (nextAppState == "active") {
              // 打开socket
              socketContext.init(v);
            }
          });
          socketContext.init(v);
        }).catch(e => console.log(e))
        // 刷新请求地址
        // 上报firebase token
        // 连接websocket
        console.log('[init] 加载在线chat');
        chatService.mineChatList().then((res) => {
          if (res !== null && res.length > 0) {
            console.log('change chat detail');
            setChatsStore(res)
          }
        })

      } else {
        setNetworkState(false)
      }
    })
  },[])
  const init = useCallback(async () => {
    await KVInit();
    const now = getNow()
    console.log('now=', now);
    if (now) {
      global.wallet = new Wallet(now);
      setAuthWallet(global.wallet);
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'TabStack' }],
      })
      await DBInit(global.wallet.getAddress());
      // 加载离线chat 
      chatService.mineLocalChats().then(res => {
        setChatsStore(res)
      })
      let currentUser: IUser | undefined = undefined
      const user = await LocalUserService.findByAddr(global.wallet.getAddress())

      console.log('本地用户信息', user)
      if (user) {
        setAuthUser(user)
        currentUser = user
      }
      loadOnlineData();
    }
  }, [])
  const setThemeState = useSetRecoilState(ThemeState);
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
    init();
    return () => {
      subscription.remove()
      networkSubscription();
    };
  }, []);
  return (
    <Stack.Navigator
      initialRouteName="WelcomeScreen"
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
    >
      <Stack.Screen name="TabStack" component={TabStack} />
      <Stack.Screen name="UserChatScreen" component={Screens.UserChatScreen} />
      <Stack.Screen name="GroupChatScreen" component={Screens.GroupChatScreen} />
      <Stack.Screen name="WelcomeScreen" component={Screens.WelcomeScreen} />
      <Stack.Screen name="WebViewScreen" component={Screens.WebViewScreen} />
      <Stack.Screen name="SignUpScreen" component={Screens.SignUpScreen} />
      <Stack.Screen name="UserInfoScreen" component={Screens.UserInfoScreen} />
      <Stack.Screen name="InviteFriendScreen" component={Screens.InviteFriendScreen} />
      <Stack.Screen name="InviteInfoScreen" component={Screens.InviteInfoScreen} />
      <Stack.Screen name="FriendInviteRecordScreen" component={Screens.FriendInviteRecordScreen} />
      <Stack.Screen name="AddFriendModal" component={Screens.AddFriendModal} />
      <Stack.Screen name="GroupCreateScreen" component={Screens.GroupCreateScreen} />
      <Stack.Screen name="ProfileScreen" component={Screens.ProfileScreen} />
      <Stack.Screen name="SafetyScreen" component={Screens.SafetyScreen} />
      <Stack.Screen name="SettingScreen" component={Screens.SettingScreen} />
      <Stack.Screen name="UnlockScreen" component={Screens.UnlockScreen} />

      <Stack.Screen name="DiscoverScreen" component={Screens.DiscoverScreen} />
      <Stack.Screen name="GroupInfoScreen" component={Screens.GroupInfoScreen} />
    </Stack.Navigator>
  )
}


export const AppNavigator = () => {

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))
  const linking: LinkingOptions<App.StackParamList> = {
    enabled: true,
    prefixes: ['https://mychat.com', 'nextchat://'],
    config: {
      screens: {
        ChatScreen: 'chat/:id',
        GroupScreen: 'group/:id',
        UserScreen: 'user/:user_name',
        UserInfoScreen: 'userinfo/:userId'
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

      }}
    >
      <AppStack />
    </NavigationContainer>
  )
}
