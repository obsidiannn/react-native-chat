import { IUser, IMessage } from "drizzle/schema"
import fileService from "app/services/file.service"
import dayjs from 'dayjs'
import { IModel } from "@repo/enums"
import { GroupMemberItemVO, MessageDetailItem, MessageExtra } from "@repo/types"
import quickCrypto from "./quick-crypto"
import { MessageType, User } from "app/components/chat-ui"

const userTransfer = (user: IUser | null): User => {
    if (user === undefined || user === null) {
        return {} as User
    }

    return {
        id: user.id.toString(),
        createdAt: user.createdAt ? dayjs(user.createdAt).date() : 0,
        firstName: user.nickName ?? '',
        imageUrl: fileService.getFullUrl(user.avatar ?? ''),
        role: 'admin'
    }
}

const groupMemberTransfer = (member: GroupMemberItemVO): User => {
    if (member === undefined) {
        return {} as User
    }
    return {
        id: member.id.toString(),
        createdAt: new Date().getDate(),
        firstName: member.name,
        imageUrl: member.avatar,
        role: groupRoleTransfer(member.role)
    }
}

const groupRoleTransfer = (role: number): 'admin' | 'agent' | 'moderator' | 'user' => {
    switch (role) {
        case IModel.IGroup.IGroupMemberRoleEnum.MANAGER:
            return 'agent'
        case IModel.IGroup.IGroupMemberRoleEnum.OWNER:
            return 'admin'
        case IModel.IGroup.IGroupMemberRoleEnum.MEMBER:
            return 'user'

    }
    return 'moderator'
}


/**
 * message server 结构体 转换为 chatui 结构体
 * @param detail 
 * @param key 
 * @param author 
 * @param needDecode 
 * @returns 
 */
const messageTypeConvert = (
    detail: MessageDetailItem,
    key: string,
    author: User | null,
    needDecode: boolean
): MessageType.Any => {
    const _data = needDecode ? decrypt(key, detail?.content ?? '') : JSON.parse(detail?.content ?? '') as { t: string, d: string }
    const t = _data.t;
    const extra = detail?.extra && detail?.extra !== null ? JSON.parse(String(detail?.extra)) as MessageExtra : {};
    // if (detail?.type === MessageTypeEnum.RED_PACKET) {
    //     _d.packetId = extra.id
    // }
    let message: MessageType.Any
    const time = detail.createdAt !== null ? dayjs(detail.createdAt).valueOf() : new Date().valueOf()
    switch (t) {
        case 'text':
            message = {
                id: detail.id,
                author: author,
                createdAt: time,
                text: _data.d,
                type: 'text',
                sequence: detail.sequence,
                roomId: detail.chatId,
                senderId: detail.fromUid,
            } as MessageType.Text
            break
        case 'image':
            const content: MessageType.PartialImage = JSON.parse(_data.d) as MessageType.PartialImage
            message = {
                id: detail.id,
                author: author,
                createdAt: time,
                sequence: detail.sequence,
                roomId: detail.chatId,
                senderId: detail.fromUid,
                ...content,
                uri: fileService.getFullUrl(content.uri),
                type: 'image',
            } as MessageType.Image
            break
        case 'video':
            const videoData: MessageType.PartialVideo = JSON.parse(_data.d) as MessageType.PartialVideo
            message = {
                id: detail.id,
                author: author,
                createdAt: time,
                sequence: detail.sequence,
                roomId: detail.chatId,
                senderId: detail.fromUid,
                ...videoData,
                thumbnail: fileService.getFullUrl(videoData.thumbnail),
                type: 'video',
            } as MessageType.Video
            break
        case 'file':
            const fileData: MessageType.PartialFile = JSON.parse(_data.d) as MessageType.PartialFile
            message = {
                id: detail.id,
                author: author,
                createdAt: time,
                sequence: detail.sequence,
                roomId: detail.chatId,
                senderId: detail.fromUid,
                ...fileData,
                uri: fileService.getFullUrl(fileData.uri),
                type: 'file',
            } as MessageType.File
            break
        default:
            message = {
                type: 'unsupported',
                id: detail.id,
                author: author,
                createdAt: time,
                sequence: detail.sequence,
                roomId: detail.chatId,
                senderId: detail.fromUid,
            } as MessageType.Unsupported
            break
    }
    message.metadata = {
        ...message.metadata,
        'uidType': detail.fromUidType,
        'replyId': extra.replyId
    }
    return message;
}

const messageEntityConverts = (messages: MessageType.Any[]): IMessage[] => {
    return messages.map(m => {
        return messageDto2Entity(m)
    })
}

/**
 * chatui 结构体转 数据库entity 
 * @param m 
 * @returns 
 */
const messageDto2Entity = (m: MessageType.Any): IMessage => {
    const entity: IMessage = {
        id: m.id,
        chatId: m.roomId ?? '',
        type: messageTypeCodeConvert(m.type),
        sequence: m.sequence,
        time: m.createdAt ?? new Date().valueOf(),
        uid: m.senderId,
        uidType: m.metadata?.uidType,
        state: m.status === 'error' ? IModel.IChat.IMessageStatusEnum.DELETED : IModel.IChat.IMessageStatusEnum.NORMAL,
        data: convertPartialContent(m as MessageType.PartialAny),
        extra: JSON.stringify(m.metadata ?? {}),
        replyId: m.metadata?.replyId ?? null
    }
    return entity
}

/**
 * 本地entity 转 chatui 结构体 
 */
const messageEntityToItems = (entities: IMessage[], key: string = '', needDecode: boolean = false): MessageType.Any[] => {
    if (entities === undefined || entities === null || entities.length <= 0) {
        return []
    }
    return entities.map(entity => {
        return messageEntity2Dto(entity, key, needDecode)
    })
}

// 数据库entity 转 chatui 结构体
const messageEntity2Dto = (entity: IMessage, key: string = '', needDecode: boolean = false): MessageType.Any => {
    const data = needDecode ? decrypt(key, entity.data ?? '') : JSON.parse(entity.data ?? '')
    const time = entity.time !== null ? entity.time : new Date().valueOf()
    let message: MessageType.Any
    switch (data.type) {
        case 'text':
            message = {
                id: entity.id,
                author: {},
                createdAt: time,
                updatedAt: time,
                text: data.text,
                type: 'text',
                sequence: entity.sequence,
                roomId: entity.chatId,
                senderId: entity.uid,
            } as MessageType.Text
            break
        case 'image':
            const content: MessageType.PartialImage = data as MessageType.PartialImage
            message = {
                id: entity.id,
                author: {},
                createdAt: entity.time,
                sequence: entity.sequence,
                roomId: entity.chatId,
                senderId: entity.uid,
                ...content,
                uri: fileService.getFullUrl(content.uri),
                type: 'image',
            } as MessageType.Image
            break
        case 'video':
            const videoData: MessageType.PartialVideo = data as MessageType.PartialVideo
            message = {
                id: entity.id,
                author: {},
                createdAt: time,
                sequence: entity.sequence,
                roomId: entity.chatId,
                senderId: entity.uid,
                ...videoData,
                thumbnail: fileService.getFullUrl(videoData.thumbnail),
                type: 'video',
            } as MessageType.Video
            break
        case 'file':
            const fileData: MessageType.PartialFile = data as MessageType.PartialFile
            message = {
                id: entity.id,
                author: {},
                createdAt: time,
                sequence: entity.sequence,
                roomId: entity.chatId,
                senderId: entity.uid,
                ...fileData,
                uri: fileService.getFullUrl(fileData.uri),
                type: 'file',
            } as MessageType.File
            break
        default:
            message = {
                type: 'unsupported',
                id: entity.id,
                author: {},
                createdAt: time,
                sequence: entity.sequence,
                roomId: entity.chatId,
                senderId: entity.uid,
            } as MessageType.Unsupported
            break
    }
    message.metadata = {
        ...message.metadata,
        'uidType': entity.uidType,
        'replyId': entity.replyId
    }
    return message
}

/**
 * chatui 消息类型 转换为 server端的message type
 * @param type 
 * @returns 
 */
const messageTypeCodeConvert = (type: string): number => {
    let code = IModel.IChat.IMessageTypeEnum.NORMAL
    switch (type) {
        case 'image':
            code = IModel.IChat.IMessageTypeEnum.NORMAL
            break
        case 'text':
            code = IModel.IChat.IMessageTypeEnum.NORMAL
            break
        case 'video':
            code = IModel.IChat.IMessageTypeEnum.NORMAL
            break
        case 'file':
            code = IModel.IChat.IMessageTypeEnum.NORMAL
            break
        default: break
    }
    return code
}

const convertPartialContent = (m: MessageType.PartialAny): string => {
    let partial: MessageType.PartialAny | null = null
    switch (m.type) {
        case 'image':
            partial = {
                type: m.type,
                height: m.height,
                width: m.width,
                name: m.name,
                size: m.size,
                uri: fileService.getFullUrl(m.uri),
                metadata: m.metadata
            }
            break
        case 'text':
            partial = {
                type: m.type,
                text: m.text
            }
            break
        case 'video':
            partial = {
                height: m.height,
                width: m.width,
                metadata: m.metadata,
                name: m.name,
                size: m.size,
                duration: m.duration,
                uri: m.uri,
                thumbnail: fileService.getFullUrl(m.thumbnail),
                type: 'video'
            }
            break
        case 'file':
            partial = {
                type: m.type,
                name: m.name,
                size: m.size,
                uri: fileService.getFullUrl(m.uri),
                mimeType: m.mimeType
            }
            break
        default:
            break
    }
    return partial === null ? '{}' : JSON.stringify(partial)
}

const decrypt = (key: string, content: string) => {
    try {
        const decrypted = quickCrypto.De(key, Buffer.from(content, 'hex'));
        const data = Buffer.from(decrypted).toString('utf8');
        return JSON.parse(data) as { t: string, d: any };
    } catch (error) {
    }
    return {
        t: 'text',
        d: '解密失敗'
    }
}

export default {
    userTransfer,
    groupMemberTransfer,
    messageTypeConvert,
    messageEntityConverts,
    messageDto2Entity,
    convertPartialContent,
    messageEntityToItems,
    messageEntity2Dto
} 