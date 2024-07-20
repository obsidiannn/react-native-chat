import { ChatDetailItem } from "@repo/types";

declare namespace App{
    type StackParamList = {
        WelcomeScreen: undefined;
        HomeScreen: undefined;
        // 🔥 Your screens go here
        Login: undefined;
        GroupScreen: undefined;
        ChatScreen: undefined;
        UserScreen: undefined;
        UserChatScreen: {
          item: ChatDetailItem
          fromNotify?: boolean
        };
        WebViewScreen: {
          title: string;
          url: string;
        };
        SignInScreen: undefined;
        SignUpScreen: undefined;
        UnlockScreen: undefined;
        TabStack: undefined;
        ContactScreen: undefined;
        PlazaScreen: undefined;
        WalletScreen: undefined;
        // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
        UserChatInfoModal: {
      
        }
    }
}