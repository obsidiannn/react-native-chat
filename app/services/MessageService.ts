import messageApi from "app/api/chat/message"
import ToastException from "../exception/toast-exception";
import quickAes from "app/utils/quick-crypto";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { uploadFile } from "./file.service";
import { IModel } from "@repo/enums";
import { MessageType } from "app/components/chat-ui";
import chatUiAdapter from "app/utils/chat-ui.adapter";
import { imageFormat } from "app/utils/media-util";
import { LocalMessageService } from "./LocalMessageService";
import { IMessage } from "drizzle/schema";
export class CloudMessageService {
    private static async _send(chatId: string, key: string, message: MessageType.Any, data: {
        t: string;
        d: any;
    }) {
        if (!data.d) {
            throw new ToastException('消息內容不能爲空');
        }
        const encode = quickAes.En(key, Buffer.from(JSON.stringify(data), 'utf8'))
        const result = await messageApi.sendMessage({
            id: message.id,
            chatId: chatId,
            type: IModel.IChat.IMessageTypeEnum.NORMAL,
            isEnc: 1,
            content: Buffer.from(encode).toString('hex')
        });
        message.status = "sent";
        message.sequence = result.sequence;
        LocalMessageService.add({
            id: message.id,
            chatId: message.roomId ?? '',
            type: IModel.IChat.IMessageTypeEnum.NORMAL,
            sequence: message.sequence,
            uid: message.senderId,
            uidType: message.,
            time: message.createdAt ?? 0,
            state: message.status,
            data:JSON.stringify(data),
        });
        return message;
    }
    private static async _sendText(chatId: string, key: string, message: MessageType.Text) {
        const data = {
            t: 'text',
            d: message.text,
        }
        return await CloudMessageService._send(chatId, key, message, data);
    }
    private static async _sendImage(chatId: string, key: string, message: MessageType.Image) {
        const originalPath = message.uri
        const original = await manipulateAsync(originalPath, [], {
            compress: 1,
            format: SaveFormat.PNG,
        });
        console.log('original', original)
        const originalWebp = await imageFormat(original.uri);
        const originKey = await uploadFile(originalWebp);

        message.uri = originKey.key
        return await CloudMessageService._send(chatId, key, message, {
            t: 'image',
            d: chatUiAdapter.convertPartialContent(message)
        });
    }


    private static async _sendVideo(chatId: string, key: string, message: MessageType.Video) {
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

        return await CloudMessageService._send(chatId, key, message, {
            t: 'video',
            d: chatUiAdapter.convertPartialContent(message)
        });
    }

    private static async _sendFile(chatId: string, key: string, message: MessageType.File) {
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
        return await CloudMessageService._send(chatId, key, message, {
            t: 'file',
            d: chatUiAdapter.convertPartialContent(message)
        });
    }
    static async send(chatId: string, key: string, message: MessageType.Any): Promise<MessageType.Any> {
        switch (message.type) {
            case 'text':
                return await CloudMessageService._sendText(chatId, key, message as MessageType.Text);
            case 'image':
                return await CloudMessageService._sendImage(chatId, key, message as MessageType.Image);
            case 'video':
                return await CloudMessageService._sendVideo(chatId, key, message as MessageType.Video);
            // case 'audio':
            //     return await sendAudio(chatId, key, message);
            case 'file':
                return await CloudMessageService._sendFile(chatId, key, message as MessageType.File);
            default:
                throw new ToastException('不支持的消息類型');
        }
    }
    static async findByIds(chatId: string, ids: string[]) {
        // 过滤出已缓存的
        let items:IMessage[] = await LocalMessageService.findByIds(ids)
        const cloudIds = ids.filter(id => !items.find(item => item.id === id));
        if(cloudIds.length > 0){
            const cloudItems = await messageApi.findByIds({ chatId, ids: cloudIds });
            // 存储到缓存中
            await LocalMessageService.addBatch(cloudItems);
            items = [...items, ...cloudItems];
        }
        return items.sort((a, b) => a.sequence - b.sequence);
    }
    // 获取最新消息的 id 列表
    static async getLatestIds(chatId: string, sequence: number,limit:number= 20): Promise<string[]> {
        // 根据sequence 获取最新的 id 列表
        return [];
    }

    // 删除所有我的消息
    static async flushAll(){
    }
    // 删除消息对于我的关联
    static async delByIds(ids: string[]) {
        
        await LocalMessageService.delByIds(ids)
        return messageApi.deleteSelfMsg({ ids: ids })
    }
}


