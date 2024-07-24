import messageApi from "app/api/chat/message"
import ToastException from "../exception/toast-exception";
import quickAes from "app/utils/quick-crypto";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { uploadFile } from "./file.service";
import { IModel } from "@repo/enums";
import { MessageDetailItem, MessageExtra } from "@repo/types";
import userService from "./user.service";
import { MessageType } from "app/components/chat-ui";
import chatUiAdapter from "app/utils/chat-ui.adapter";
import { imageFormat } from "app/utils/media-util";
import { LocalMessageService } from "./LocalMessageService";

const _send = async (chatId: string, key: string, mid: string, type: IModel.IChat.IMessageTypeEnum, data: {
    t: string;
    d: any;
}) => {
    if (!data.d) {
        throw new ToastException('消息內容不能爲空');
    }
    if (!globalThis.wallet) {
        throw new ToastException('請先登錄');
    }
    const encode = quickAes.En(key, Buffer.from(JSON.stringify(data), 'utf8'))
    return await messageApi.sendMessage({
        id: mid,
        chatId: chatId,
        type,
        isEnc: 1,
        content: Buffer.from(encode).toString('hex')
    });
}

const send = async (chatId: string, key: string, message: MessageType.Any): Promise<MessageType.Any> => {
    console.log('sendkey=', key);

    switch (message.type) {
        case 'text':
            return await sendText(chatId, key, message as MessageType.Text);
        case 'image':
            return await sendImage(chatId, key, message as MessageType.Image);
        case 'video':
            return await sendVideo(chatId, key, message as MessageType.Video);
        // case 'audio':
        //     return await sendAudio(chatId, key, message);
        case 'file':
            return await sendFile(chatId, key, message as MessageType.File);
        default:
            throw new ToastException('不支持的消息類型');
    }
}

const sendText = async (chatId: string, key: string, message: MessageType.Text) => {
    const data = {
        t: 'text',
        d: message.text,
    }
    const res = await _send(chatId, key, message.id, IModel.IChat.IMessageTypeEnum.NORMAL, data);
    message.sequence = res.sequence;
    return message
}
const sendImage = async (chatId: string, key: string, message: MessageType.Image) => {
    const originalPath = message.uri
    // const thumbnail = await manipulateAsync(originalPath, [{ resize: { width: 200 } }], {
    //     compress: 0.5,
    //     format: SaveFormat.JPEG,
    // });
    const original = await manipulateAsync(originalPath, [], {
        compress: 1,
        format: SaveFormat.PNG,
    });
    // const originalExt = originalPath.split('.').pop() ?? '';
    // const thumbnailExt = thumbnail.uri.split('.').pop() ?? '';
    // const originalWebp = originalPath.replace(originalExt, 'webp');
    console.log('original', original)
    const originalWebp = await imageFormat(original.uri);
    const originKey = await uploadFile(originalWebp);

    // const thumbnailWebp = thumbnail.uri.replace(thumbnailExt, 'webp');
    // console.log('thumbnail.uri', thumbnail.uri)
    // await format(thumbnail.uri, thumbnailWebp);
    // const thumbKey = await uploadFile(originalWebp);

    message.uri = originKey.key
    // message.metadata = {
    //     thumbnail: thumbKey.key
    // }
    const result = await _send(chatId, key, message.id, IModel.IChat.IMessageTypeEnum.NORMAL, {
        t: 'image',
        d: chatUiAdapter.convertPartialContent(message)
    });
    message.status = 'sent'
    message.sequence = result.sequence

    return message
}


const sendVideo = async (chatId: string, key: string, message: MessageType.Video) => {
    const file = message.uri;
    if (!file) {
        throw new ToastException('文件不能爲空');
    }
    const transFilePath = file
    // const transFilePath = fileService.cachePath() + message.id + '_trans.mp4'
    // await formatVideo(file, transFilePath)
    const videoResult = await uploadFile(transFilePath);

    const thumbailResult = await uploadFile(message.thumbnail);
    message.uri = videoResult.key
    message.thumbnail = thumbailResult.key
    message.metadata = { 'original': transFilePath }

    const result = await _send(chatId, key, message.id, IModel.IChat.IMessageTypeEnum.NORMAL, {
        t: 'video',
        d: chatUiAdapter.convertPartialContent(message)
    });
    message.status = 'sent'
    message.sequence = result.sequence
    return message
}

const sendFile = async (chatId: string, key: string, message: MessageType.File) => {
    const file = message.uri;
    if (!file) {
        throw new ToastException('文件不能爲空');
    }
    console.log('發送文件 file', file);
    const fileResult = await uploadFile(file);
    message.uri = fileResult.key
    message.metadata = { 'original': file }
    // const fileInfo = await fileService.getFileInfo(file);
    // fileInfo?.exists && (file.md5 = fileInfo.md5 ?? '');
    console.log('處理完成準備發送', file);
    const result = await _send(chatId, key, message.id, IModel.IChat.IMessageTypeEnum.NORMAL, {
        t: 'file',
        d: chatUiAdapter.convertPartialContent(message)
    });
    message.status = 'sent'
    message.sequence = result.sequence
    return message
}


const getListFromDb = async (
    chatId: string,
    sequence: number,
    direction: 'up' | 'down',
    limit: number,
    key: string,
    needDecode: boolean
): Promise<MessageType.Any[]> => {
    const queryParam = {
        chatId: chatId,
        sequence: sequence,
        direction: direction,
        limit: limit
    }
    const list = await LocalMessageService.queryEntity(queryParam)
    return chatUiAdapter.messageEntityToItems(list, key, false)
}

const checkDiffFromWb = (
    data: MessageType.Any[],
    _seq: number,
    direction: string,
    _limit: number,
    firstSeq: number
): { seq: number, limit: number } => {

    const success = { seq: 0, limit: -1 }
    if (data !== undefined && data !== null && data.length > 0) {
        const up: boolean = direction === 'up'
        const min = data[data.length - 1].sequence ?? 1
        const max = data[0].sequence ?? 1
        console.log('max=', max, 'min=', min);
        console.log('seq=', _seq);

        if (up) {
            const targetSeq = _seq - _limit <= 0 ? 1 : _seq - _limit
            // 完全取得
            if (max === _seq) {
                if (data.length === _limit || min <= firstSeq) {
                    return success
                }
            }
            // 部分取得
            if (max < _seq) {
                return { seq: _seq, limit: _seq - max }
            }
            if (min > targetSeq) {
                return { seq: min - 1, limit: min - targetSeq }
            }
        } else {
            const targetSeq = _seq + _limit
            // 完全取得
            if (min === _seq && data.length === _limit || min === 1) {
                return success
            }
            // 部分取得
            if (max < targetSeq) {
                return { seq: max + 1, limit: targetSeq - max }
            }
            return success
        }

    } else {
        // if (direction === 'up' && _seq <= firstSeq) {
        //     return success
        // }
    }



    return { seq: _seq, limit: _limit }
}

/**
 * 獲取消息列表
 * @param chatId
 * @param key
 * @param sequence
 * @param direction
 * @returns
 */
const getList = async (
    chatId: string,
    key: string,
    sequence: number,
    direction: 'up' | 'down',
    firstSeq: number,
    needDecode: boolean = true
): Promise<MessageType.Any[]> => {

    // await LocalMessageService.deleteMessageByChatIdIn([chatId])
    const list = await getMessageDetails(chatId, key, sequence, direction, firstSeq, needDecode)
    const userIds: number[] = []
    list.forEach(d => {
        if (d.senderId !== undefined && d.senderId !== null) {
            userIds.push(d.senderId)
        }
    })
    const userHash = await userService.getUserHash(userIds)
    console.log('message list',list);
    
    return list.map((item) => {
        const user = userHash.get(item?.senderId ?? -1)
        // console.log('user avatar::',user?.avatar);

        return {
            ...item,
            author: chatUiAdapter.userTransfer(user ?? undefined)
        }
    });
}

const getMessageDetails = async (
    chatId: string,
    key: string,
    sequence: number,
    direction: 'up' | 'down',
    firstSeq: number,
    needDecode: boolean
): Promise<MessageType.Any[]> => {
    if (chatId === null && chatId === undefined) {
        return []
    }
    const _limit = 20
    // await LocalMessageService.deleteMessageByChatIdIn([chatId])
    const list: MessageType.Any[] = await getListFromDb(chatId, sequence, direction, _limit, key, needDecode)
    const checkResult = checkDiffFromWb(list, sequence, direction, _limit, firstSeq)
    console.log('檢查', checkResult);

    if (checkResult.limit < 0) {
        // 無需請求遠端
        return list
    } else if (checkResult.limit < _limit) {
        // // 存在部分情況
        // if (direction === 'up' ) {
        //     if(sequence - _limit < 1)
        //     // 這種也無需請求遠端
        //     return list
        // }
    }

    const data = await messageApi.getMessageList({
        chatId,
        limit: checkResult.limit,
        sequence: checkResult.seq,
        direction,
    });
    if (data.items.length <= 0) {
        return list
    }
    const mids: string[] = data.items.map(i => i.msgId)
    const details = await messageApi.getMessageDetail({ chatId, ids: mids })
    const messageHash = new Map<string, MessageDetailItem>();
    details.items.forEach(d => {
        messageHash.set(d.id, d)
    })
    const remoteData: MessageType.Any[] = []
    data.items.forEach(item => {
        const detail = messageHash.get(item.msgId)
        if (detail !== undefined) {
            remoteData.push(chatUiAdapter.messageTypeConvert(detail, key, {}, needDecode))
        }
    })

    if (remoteData.length > 0) {

        console.log('remote data', remoteData);
        console.log('list data', list);
        if (list.length <= 0) {
            void LocalMessageService.saveBatchEntity(chatUiAdapter.messageEntityConverts(remoteData))
            return remoteData
        }

        const localSequence = new Set(list.map(r => r.sequence))
        const saveData = remoteData.filter(r => !localSequence.has(r.sequence))

        LocalMessageService.saveBatchEntity(chatUiAdapter.messageEntityConverts(saveData))
        const result = list.concat(saveData).sort((a, b) => { return (b.sequence ?? 0) - (a.sequence ?? 0) })
        console.log('[msg result]', result);

        return result
    }
    return list
};



const removeBatch = async (chatId: string, mids: string[]) => {
    return true;
}

// 清除所有消息
// 發起更新chatItem的事件
const clearMineMessage = async (chatIds: string[]) => {
    await LocalMessageService.deleteMessageByChatIdIn(chatIds)
    return messageApi.clearMineMessage({ chatIds: chatIds })
}

/**
 * 刪除羣消息
 */
const dropGroupMessage = async (chatIds: string[]) => {
    await LocalMessageService.deleteMessageByChatIdIn(chatIds)
    return messageApi.clearGroupMessageByChatIds({ chatIds: chatIds })
}

const deleteMessage = async (chatId: string, ids: string[]) => {
    await LocalMessageService.deleteMessageByMsgIds(chatId, ids)
    return messageApi.deleteSelfMsg({ ids: ids })
}

const clearMineMessageAll = async () => {
    await LocalMessageService.deleteAll()
    return messageApi.clearMineMessageAll()
}

export default {
    getList,
    removeBatch,
    send,
    clearMineMessage,
    clearMineMessageAll,
    dropGroupMessage,
    deleteMessage
}
