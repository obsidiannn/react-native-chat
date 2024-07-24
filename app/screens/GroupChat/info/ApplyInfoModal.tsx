import { GroupApplyItem } from "@repo/types";
import groupService from "app/services/group.service";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { scale, verticalScale } from "app/utils/size";
import { Image } from "expo-image";
import * as clipboard from 'expo-clipboard';
import toast from "app/utils/toast";
import BaseModal from "app/components/base-modal";
import { useTranslation } from "react-i18next";
import { IModel } from "@repo/enums";
import { Button } from "app/components";
import quickCrypto from "app/utils/quick-crypto";

export interface ApplyInfoModalRef {
    open: (item: GroupApplyItem, encKey: string, encPub: string) => void;
}
export default forwardRef((props: {
    onCheck: (item: GroupApplyItem) => void;
    onReject: (item: GroupApplyItem) => void;
}, ref) => {
    const [visible, setVisible] = useState(false);

    const { t } = useTranslation('screen-group-chat')
    const [item, setItem] = useState<GroupApplyItem>();
    const [selfEnc, setSelfEnc] = useState<{ k: string, p: string }>()
    const [loading, setLoading] = useState(false);
    useImperativeHandle(ref, () => ({
        open: (v: GroupApplyItem, encKey: string, encPub: string) => {
            setItem(v);
            setSelfEnc({
                k: encKey, p: encPub
            })
            setVisible(true);
        }
    }));
    const onClose = () => {
        setVisible(false)
    }
    return <BaseModal visible={visible} onClose={onClose} title={t('title_apply_info')} animationType="slide">
        <View>
            <View style={{ paddingHorizontal: scale(15), paddingTop: verticalScale(21) }}>
                <View style={{
                    height: verticalScale(82),
                    borderWidth: 1,
                    borderColor: '#F4F4F4',
                    backgroundColor: '#F8F8F8',
                    width: '100%',
                    borderRadius: verticalScale(16),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: scale(15),
                }}>
                    <Image style={{
                        width: verticalScale(50),
                        height: verticalScale(50),
                        borderRadius: verticalScale(25),
                        borderWidth: 1,
                        borderColor: '#F0F0F0',
                        marginRight: scale(15),
                    }} source={item?.avatar} />
                    <View>
                        <Text style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>{item?.name}</Text>
                        <TouchableOpacity onPress={async () => {
                            await clipboard.setStringAsync(item?.address ?? '');
                            toast(t('option_success'));
                        }} style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 5,
                        }}>
                            <Text style={{ fontSize: 14, color: '#999', fontWeight: '400' }}>{item?.address}</Text>
                            <Image style={{
                                width: verticalScale(20),
                                height: verticalScale(20),
                            }} source={require('assets/icons/copy.svg')} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{
                    borderWidth: 1,
                    borderColor: '#F4F4F4',
                    backgroundColor: '#F8F8F8',
                    width: '100%',
                    borderRadius: verticalScale(16),
                    paddingHorizontal: scale(15),
                    paddingVertical: verticalScale(17),
                    marginTop: verticalScale(10),
                }}>
                    <Text style={{
                        fontSize: 16,
                        color: '#333'
                    }}>{item?.remark ?? ''}</Text>
                </View>
            </View>
            <View style={{
                paddingHorizontal: scale(23),
            }}>
                {item?.status === IModel.IGroup.IGroupMemberStatus.PENDING ? <>
                    <Button style={{
                        width: '100%',
                        height: verticalScale(50),
                        borderRadius: verticalScale(16),
                        marginTop: verticalScale(30),
                    }}
                        onPress={async () => {
                            if (loading) {
                                return
                            };
                            setLoading(true);
                            try {
                                const encKey = selfEnc?.k

                                if (encKey === '' || encKey === undefined) {
                                    return
                                }
                                const myWallet = globalThis.wallet
                                console.log(selfEnc);
                                console.log('target pub', item);

                                if (!myWallet) {
                                    return
                                }

                                let sharedKey = ''
                                if (selfEnc?.p && selfEnc.p !== '') {
                                    sharedKey = myWallet.computeSharedSecret(selfEnc?.p ?? '')

                                } else {
                                    sharedKey = myWallet.computeSharedSecret(myWallet.getPublicKey())
                                }

                                const password = quickCrypto.De(sharedKey, Buffer.from(encKey, 'utf8'))
                                const newSharedKey = myWallet.computeSharedSecret(item.pubKey)
                                const newEncKey = quickCrypto.En(newSharedKey, password)
                                console.log(sharedKey);
                                await groupService.adminAgree({
                                    id: item.gid,
                                    uid: item.uid,
                                    encPri: myWallet.getPublicKey(),
                                    encKey: Buffer.from(newEncKey).toString('hex')
                                })
                            } catch (e) {
                                console.error(e)
                            } finally {
                                setLoading(false)
                                props.onCheck(item)
                                onClose()
                            }




                            // .finally(()=>{
                            //     setLoading(false);
                            //    
                            // })

                        }} >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '700',
                        }}>
                            {t('btn_allow')}
                        </Text>

                    </Button>
                    <Button style={{
                        width: '100%',
                        height: verticalScale(50),
                        borderRadius: verticalScale(16),
                        marginTop: verticalScale(16),
                    }} onPress={() => {
                        if (loading) {
                            return
                        };
                        setLoading(true);
                        groupService.rejectJoin(item?.gid, [item?.uid]).then(res => {
                            toast(t('label_rejected'));
                            setTimeout(() => {
                                setVisible(false);
                            }, 500)
                        }).finally(() => {
                            setLoading(false);
                            props.onCheck(item)
                        })
                    }}  >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '700',
                        }}>
                            {t('btn_reject')}
                        </Text>
                    </Button>
                </> : null}
            </View>
        </View>

    </BaseModal>
});
