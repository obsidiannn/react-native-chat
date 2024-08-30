import { GroupApplyItem } from "@repo/types";
import groupService from "app/services/group.service";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View } from "react-native";
import ApplyListItemComponent from "./components/ApplyListItem";
import ApplyInfoModal, { ApplyInfoModalRef } from "./ApplyInfoModal";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { useTranslation } from "react-i18next";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";

// 羣申請列表
export interface ApplyListModalRef {
    open: (id: number, encKey: string, encPri: string) => void;
}
export default forwardRef((props: {
    onCheck: (item: GroupApplyItem) => void;
    theme: 'light' | 'dark';
}, ref) => {
    const [gid, setGid] = useState<number>(-1);
    const [items, setItems] = useState<GroupApplyItem[]>([]);
    const applyInfoModalRef = useRef<ApplyInfoModalRef>(null);
    const [selfEnc, setSelfEnc] = useState<{ k: string, p: string }>()
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('default')
    useImperativeHandle(ref, () => ({
        open: (id: number, encKey: string, encPri: string) => {
            setItems([])
            setGid(id);
            loadApply(id)
            screenModalRef.current?.open()
            setSelfEnc({ k: encKey, p: encPri })
        }
    }));

    const loadApply = (id: number) => {
        groupService.applyList([id]).then(res => {
            setItems(res);
        });
    }
    const screenModalRef = useRef<ScreenModalType>(null);

    return <ScreenModal ref={screenModalRef} title={t('Application List')} theme={props.theme}>
        <View style={{ flex: 1, }}>
            {items.map((item, idx) => {
                const isLast = idx === (items.length - 1);
                return <ApplyListItemComponent
                    themeColor={themeColor}
                    key={item.id}
                    onCheck={() => {
                        applyInfoModalRef.current?.open(item, selfEnc?.k ?? '', selfEnc?.p ?? '');
                    }} item={item} isLast={isLast} />
            })}
        </View>
        <ApplyInfoModal onCheck={() => {
            loadApply(gid)
        }} onReject={() => {
            // props.onChangeMemberList?.();
        }} ref={applyInfoModalRef} />

    </ScreenModal>
});
