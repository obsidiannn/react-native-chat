import { GroupDetailItem, GroupInfoItem } from "@repo/types";
import { Image } from "expo-image";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Text, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import ViewShot, { captureRef } from "react-native-view-shot";
import BaseModal from "app/components/base-modal";
import { useTranslation } from "react-i18next";
import { scale } from "app/utils/size";
import { Button } from "app/components";
import toast from "app/utils/toast";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
export interface QRcodeModalRef {
    open: (params: {
        group: GroupDetailItem;
        count: number
    }) => void;
}
export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [group, setGroup] = useState<GroupInfoItem>();
    const [count, setCount] = useState<number>(0)
    const [data, setData] = useState<string>("xxxx");
    const viewRef = useRef<ViewShot>(null);
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('screens')

    useImperativeHandle(ref, () => ({
        open: (params: {
            group: GroupInfoItem;
            count: number
        }) => {
            setGroup(params.group);
            setCount(params.count)
            setData('action=groupInfo&groupId=' + params.group?.id);
            setVisible(true);
        }
    }));
    const onClose = () => {
        setVisible(false)
    }
    return <BaseModal visible={visible} onClose={onClose} title={'管理員'} animationType="slide" >
        <View style={{
            flex: 1,
            paddingHorizontal: scale(15),
        }}>
            <View style={{
                backgroundColor: '#fff',
                borderRadius: scale(16),
                padding: scale(30),
                marginTop: scale(20),
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
                shadowOpacity: 0.30,
                shadowRadius: 1,
                elevation: 1
            }}>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Image source={group?.avatar} style={{
                        width: scale(50),
                        height: scale(50),
                        borderRadius: scale(10),
                        backgroundColor: '#F6F6F6',
                        borderWidth: 1,
                        borderColor: '#ECECEC',
                        marginRight: scale(10),
                    }} />
                    <Text style={{
                        flex: 1,
                        fontSize: scale(15),
                        color: '#333',
                        fontWeight: '400',
                    }}>{group?.name}<Text style={{ fontSize: scale(14), color: '#999', fontWeight: '400' }}>({count}人)</Text></Text>
                </View>
                <ViewShot ref={viewRef} style={{
                    width: scale(280),
                    height: scale(280),
                    borderRadius: scale(16),
                    marginTop: scale(40),
                    backgroundColor: 'white',
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.30,
                    shadowRadius: 1,
                    elevation: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {data ? <QRCode
                        size={260}
                        value={data}
                    /> : null}
                </ViewShot>
                <View>
                    <Button onPress={() => {
                        if (viewRef.current == null) {
                            return;
                        }
                        captureRef(viewRef.current, {
                            format: "jpg",
                            quality: 0.8,
                            handleGLSurfaceViewOnAndroid: true,
                        }).then(uri => {
                            console.log(uri);
                            toast(t('groupChat.success_save_album'));
                        });
                    }}
                        style={{
                            height: scale(42),
                            marginTop: scale(40),
                            borderRadius: scale(21),
                            backgroundColor: themeColor.primary
                        }} >
                        <Text style={{
                            fontSize: scale(14),
                            fontWeight: '700',
                            color: '#333',
                        }}>
                            {t('groupChat.btn_save_image')}
                        </Text>
                    </Button>
                </View>
            </View>
        </View>
    </BaseModal>;
});