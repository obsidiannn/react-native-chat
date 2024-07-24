import { GroupApplyItem } from "@repo/types";
import groupService from "app/services/group.service";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View } from "react-native";
import ApplyListItemComponent from "./components/ApplyListItem";
import ApplyInfoModal, { ApplyInfoModalRef } from "./ApplyInfoModal"
import BaseModal from "app/components/base-modal";

// 羣申請列表
export interface ApplyListModalRef {
    open: (id: string, encKey: string, encPri: string) => void;
}
export default forwardRef((props: {
    onCheck: (item: GroupApplyItem) => void;
}, ref) => {
    const [visible, setVisible] = useState(false);
    const [gid, setGid] = useState<number>(-1);
    const [items, setItems] = useState<GroupApplyItem[]>([]);
    const applyInfoModalRef = useRef<ApplyInfoModalRef>(null);
    const [selfEnc, setSelfEnc] = useState<{ k: string, p: string }>()
    useImperativeHandle(ref, () => ({
        open: (id: number, encKey: string, encPri: string) => {
            setGid(id);
            loadApply(id)
            setVisible(true);
            setSelfEnc({ k: encKey, p: encPri })
        }
    }));

    const loadApply = (id: number) => {
        groupService.applyList([id]).then(res => {
            setItems(res);
        });
    }

    const onClose = () => {
        setItems([])
        setVisible(false)
    }

    return <BaseModal animationType="slide" visible={visible} onClose={onClose} title="申請列表" >
        <View>
            {items.map((item, idx) => {
                const isLast = idx === (items.length - 1);
                return <ApplyListItemComponent
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

    </BaseModal>
});
