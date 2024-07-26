import { IChat } from "drizzle/schema"
import { ChatDetailItem } from "../../../../packages/types/dist/client/chat"

const dto2Entity = (dto: ChatDetailItem): IChat => {
    const entity: IChat = {
        id: dto.id,
        creatorId: dto.creatorId,
        type: dto.type,
        status: dto.status,
        isEnc: dto.isEnc,
        lastReadSequence: dto.lastReadSequence,
        lastSequence: dto.lastSequence,
        firstSequence: dto.firstSequence,
        lastTime: dto.lastTime,
        createdAt: dto.createdAt,
        avatar: dto.avatar,
        sourceId: dto.sourceId,
        chatAlias: dto.chatAlias,
        isTop: dto.isTop,
        chatUserId: dto.chatUserId,
        // 免打扰 1-是 0-否 默认0
        isMute: dto.isMute,
        describe: dto.describe
    }
    return entity
}

const entity2Dto = (entity: IChat): ChatDetailItem => {
    const dto: ChatDetailItem = {
        id: entity.id,
        creatorId: entity.creatorId,
        type: entity.type,
        status: entity.status,
        isEnc: entity.isEnc,
        lastReadSequence: entity.lastReadSequence,
        lastSequence: entity.lastSequence,
        firstSequence: entity.firstSequence,
        lastTime: entity.lastTime,
        createdAt: entity.createdAt,
        avatar: entity.avatar,
        sourceId: entity.sourceId,
        chatAlias: entity.chatAlias,
        isTop: entity.isTop,
        chatUserId: entity.chatUserId,
        isMute: entity.isMute,
        describe: entity.describe
    }
    return dto
}

export default {
    dto2Entity,
    entity2Dto
}