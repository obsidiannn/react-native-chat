import { ChatDetailItem, GroupDetailItem } from "@repo/types";

declare namespace App {
  type StackParamList = {
    WelcomeScreen: undefined;
    HomeScreen: undefined;
    // 🔥 Your screens go here
    Login: undefined;
    GroupScreen: undefined;
    ChatScreen: undefined;
    UserScreen: undefined;
    UserChatScreen: {
      chatId: string
      item: ChatDetailItem
      fromNotify?: boolean
    };
    GroupChatScreen: {
      chatId: string
      item: ChatDetailItem
      fromNotify?: boolean
    };
    GroupInfoScreen: {
      group: GroupDetailItem
      outside?: boolean
    }
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
    UserInfoScreen: {
      userId: number
      remark?: string
      outside?: boolean
    };
    InviteFriendScreen: {
      userId: number
    };
    InviteInfoScreen: {
      friendApply: IServer.IFriendApply;
      user: IUser;
    }
    GroupCreateScreen: {
      selected: SelectMemberOption[]
    }

    FriendInviteRecordScreen: undefined
    // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
    UserChatInfoModal: {

    }
    AddFriendModal: undefined;
    UserCenterScreen: undefined;
    ProfileScreen: undefined;
    SafetyScreen: undefined;
    SettingScreen: undefined;
    DiscoverScreen: undefined
    UserBlockScreen: undefined
    CollectScreen: undefined
    SystemFeedbackScreen: undefined
    DonateScreen: undefined
  }
}