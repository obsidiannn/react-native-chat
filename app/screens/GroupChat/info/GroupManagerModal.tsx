import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { forwardRef, useContext, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Image } from "expo-image";
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "app/components/SelectMemberModal/Index";
import MemberItem from "./components/MemberItem";
import groupService from "app/services/group.service";
import { GroupChatUiContext } from "../context";
import BaseModal from "app/components/base-modal";
import { useTranslation } from "react-i18next";
import { IModel } from "@repo/enums";
import { scale } from "app/utils/size";
import { colors } from "app/theme";

export interface GroupManagerModalRef {
  open: (groupId: number) => void;
}

export default forwardRef((props: {
  onCheck: () => void;
}, ref) => {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [groupId, setGroupId] = useState<number>();
  const maxManager = 5;
  const selectMemberModalRef = useRef<SelectMemberModalType>(null)
  const { t } = useTranslation('screens')
  const managerDescribe = [
    t('groupChat.label_manager_1'),
    t('groupChat.label_manager_2'),
    t('groupChat.label_manager_3'),
    t('groupChat.label_manager_4')
  ]
  const groupContext = useContext(GroupChatUiContext)

  useImperativeHandle(ref, () => ({
    open: (groupId: number) => {
      setGroupId(groupId);
      console.log('groupcontext=', groupContext);
      setVisible(true);
    }
  }));

  const managers = useMemo(() => {
    console.log('[manager load]', groupContext.members);
    if (groupContext.members && groupContext.members.length > 0) {
      return groupContext.members.filter(m => { return m.role === IModel.IGroup.IGroupMemberRoleEnum.MANAGER })
    }
    return []
  }, [groupContext.members])
  const onClose = () => {
    setGroupId(-1)
    setVisible(false)
  }
  return <BaseModal visible={visible} onClose={onClose} title={'管理員'} animationType="slide" styles={{
    flex: 1
  }} >
    <ScrollView style={styles.mainContainer}>
      <View style={{ marginTop: "5%" }}>
        <Text style={styles.titleStyle}>{t('groupChat.label_manager_auth')}</Text>
        <View style={styles.groupDescribe}>
          {
            managerDescribe.map(
              (e, i) => {
                return <Text style={{ color: "#6b7280", marginTop: scale(5), marginBottom: scale(5) }} key={i}> {e} </Text>
              }
            )
          }
        </View>
      </View>

      <View style={{ marginBottom: scale(12) }}>
        <Text style={styles.titleStyle}>{t('groupChat.label_current_manager')}</Text>
        <View style={styles.managerList}>
          {
            managers.map((e, i) => {
              return <View style={{
                ...styles.managerItem,
                marginTop: i === 0 ? 0 : scale(14)
              }} key={e.id + "member"}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image source={e.avatar} style={styles.avatar} />
                  <Text style={{ color: "#4b5563", marginLeft: scale(10), fontSize: scale(18) }}>{e.name}</Text>
                </View>


                <TouchableOpacity
                  style={{ padding: scale(4) }}
                  onPress={async () => {
                    console.log('remove admin');
                    await groupService.adminRemove({
                      id: groupId ?? -1,
                      uids: [e.uid]
                    })
                    groupContext.reloadMemberByUids([e.uid])
                  }}>
                  <Image source={require('assets/icons/destory.svg')}
                    style={{
                      width: scale(28), height: scale(28),
                      tintColor: colors.palette.gray400
                    }} />
                </TouchableOpacity>
              </View>
            })
          }
        </View>

      </View>

      <MemberItem

        avatar={require('assets/icons/plus.svg')}
        text={t('groupChat.btn_add_manager')}
        onPress={async () => {
          const existIds = managers?.map(item => item.uid) ?? [];
          const options: SelectMemberOption[] = (groupContext.members ?? [])
            .filter(m => { return m.role !== IModel.IGroup.IGroupMemberRoleEnum.OWNER })
            .map((item) => {
              const disabled = existIds.includes(item.uid);
              console.log(item);
              return {
                id: item.uid,
                icon: item.avatar,
                status: item.role === IModel.IGroup.IGroupMemberRoleEnum.MANAGER,
                name: item.name,
                title: item.name,
                name_index: item.nameIndex,
                disabled,
                pubKey: item.pubKey
              } as SelectMemberOption;
            })
          if (options.length > 0) {
            console.log('options', options);
            selectMemberModalRef.current?.open({
              title: t('groupChat.btn_add_manager'),
              options,
              callback: async (ops: SelectMemberOption[]) => {
                const uids = ops.filter((item) => item.status).map(item => Number(item.id));
                // const totalManagers = new Set([...managers.map(m=>m.uid),...uids])
                if (uids.length > 0) {
                  await groupService.adminAdd({
                    id: groupId ?? -1,
                    uids: uids
                  })
                  groupContext.reloadMemberByUids(uids)
                }
              },
            })
          }
        }} />
    </ScrollView>
    <SelectMemberModal ref={selectMemberModalRef} />
  </BaseModal>
});



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    padding: "5%"
  },

  titleStyle: {
    color: "black",
    marginLeft: scale(30),
    marginTop: "5%",
    marginBottom: "5%",
    fontWeight: "bold",
    fontSize: scale(16)
  },
  groupDescribe: {
    backgroundColor: "#f3f4f6",
    padding: scale(20),
    borderRadius: scale(15),

  },
  managerList: {
    // backgroundColor:"yellow",
  },
  managerItem: {
    padding: scale(10),
    paddingLeft: scale(20),
    paddingRight: scale(20),
    backgroundColor: "#f3f4f6",
    borderRadius: scale(15),

    display: 'flex',
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  avatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },


  button: {
    marginTop: scale(40),
    marginBottom: scale(40),
    borderRadius: scale(15),
    paddingVertical: scale(15),
    justifyContent: 'center',
  },
  buttonFont: {
    fontSize: scale(14),
    textAlign: "center"
  }


})
