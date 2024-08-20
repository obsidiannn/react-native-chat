import { MessageType } from "app/components/chat-ui"
import { ICollect } from "drizzle/schema"
import chatUiAdapter from "./chat-ui.adapter"
import { CollectItem } from "app/screens"
import en from "app/i18n/en"
import dateUtil from "./dateUtil"


const convertEntity = (message: MessageType.Any): ICollect => {
    let title = ""
    if (message.type === 'text') {
        title = (message as MessageType.Text).text
    }
    const entity: ICollect = {
        fromAuthorId: Number(message.author.id),
        fromAuthor: message.author.firstName ?? '',
        chatId: message.roomId ?? '',
        msgId: message.id,
        type: message.type,
        readCount: 0,
        title: title,
        data: chatUiAdapter.convertPartialContent(message as MessageType.PartialAny),
        createdAt: 0,
    }

    return entity
}


const convertItem = (entity: ICollect): CollectItem => {
    
    const item: CollectItem = {
        id: entity.id,
        fromAuthorId: entity.fromAuthorId ?? 0,
        fromAuthor: entity.fromAuthor ?? '',
        chatId: entity.chatId,
        msgId: entity.msgId,
        type: entity.type,
        readCount: entity.readCount,
        title: entity.title ?? '',
        data: chatUiAdapter.convertPartialItem(entity.data),
        createdAt: dateUtil.second2Label(entity.createdAt ?? 0)
    }
    return item
}

export default {
    convertEntity,
    convertItem
}