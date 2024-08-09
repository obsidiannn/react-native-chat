import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    addr: text('addr'),
    avatar: text('avatar'),
    pubKey: text('pubKey'),
    gender: integer('gender'),
    nickName: text('nickName'),
    nickNameIdx: text('nickNameIdx'),
    userName: text('userName'),
    sign: text('sign'),
    createdAt: integer('createdAt', { mode: 'timestamp' }),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
    refreshAt: integer('refreshAt'),
    isFriend: integer("is_friend").default(0),
    friendId: integer("friendId").default(0),
    friendAlias: text('friend_alias'),
    friendAliasIdx: text('friend_alias_idx'),
    isSelf: integer('is_self').default(0),
    chatId: text("chatId"),
}, (users) => ({
    addrIdx: index('addrIdx').on(users.addr),
    userNameIdx: index('userNameIdx').on(users.userName),
    refreshIdx: index('userRefreshIdx').on(users.refreshAt),
}));

export type IUser = typeof users.$inferSelect

export const messages = sqliteTable("messages", {
    id: text("id").primaryKey(),
    chatId: text("chat_id"),
    type: integer("type"),
    sequence: integer("sequence"),
    uid: integer('uid'),
    uidType: integer('uid_type'),
    time: integer('time'),
    state: integer('state'),
    data: text('data', { length: 2048 }),
    extra: text('extra')
}, (entity) => ({
    chatIdx: index('msgChatIdx').on(entity.chatId),
    sequenceIdx: index('sequenceIdx').on(entity.sequence),
}))

export type IMessage = typeof messages.$inferSelect


export const chats = sqliteTable("chats", {
    id: text('id').primaryKey(),
    creatorId: text('creator_id'),
    type: integer('chat_type'),
    status: integer('status'),
    isEnc: integer('is_enc'),
    lastReadSequence: integer('last_read_sequence'),
    lastSequence: integer('last_sequence'),
    firstSequence: integer('first_sequence'),
    lastTime: integer('last_time'),
    createdAt: integer('create_at'),
    avatar: text('chat_avatar'),
    sourceId: text('source_id'),
    chatAlias: text('chat_alias'),
    isTop: integer('is_top').default(0),
    chatUserId: integer('chat_user_id'),
    // 免打扰 1-是 0-否 默认0
    isMute: integer('is_mute').default(0),
    describe: text('chat_describe'),
    refreshAt: integer('refreshAt'),
}, (entity) => ({
    typeIdx: index('typeIdx').on(entity.type),
    isTopIdx: index('isTopIdx').on(entity.isTop),
    refreshIdx: index('chatRefreshIdx').on(entity.refreshAt),
}))


export type IChat = typeof chats.$inferSelect



export const groups = sqliteTable('groups', {
    id: integer('id').primaryKey(),
    name: text('group_name'),
    avatar: text('group_avatar'),
    createdAt: integer('create_at'),
    memberLimit: integer('member_limit'),
    total: integer('total'),
    ownerId: integer('owner_id'),
    creatorId: integer('creator_id'),
    notice: text('group_notice'),
    desc: text('group_desc'),
    cover: text('group_cover'),
    isEnc: integer('is_enc').default(1),
    type: integer('group_type'),
    banType: integer('ban_type'),
    searchType: integer('search_type'),
    status: integer('status'),
    role: integer('member_role'),
    tags: text('tags'),
    encKey: text('enc_key', { length: 2048 }),
    encPri: text('enc_pri', { length: 2048 }),
    chatId: text('chat_id'),
    refreshAt: integer('refreshAt'),
    joinAt: integer('join_at').default(0)
}, (entity) => ({
    chatIdIdx: index('groupChatIdIdx').on(entity.chatId),
    refreshIdx: index('groupRefreshIdx').on(entity.refreshAt),
    joinAtIdx: index('groupJoinAtIdx').on(entity.joinAt),
}))

export type IGroup = typeof groups.$inferSelect


export const groupMembers = sqliteTable('group_members', {
    id: integer('id').primaryKey(),
	uid: integer('user_id'),
	role: integer('role').default(0),
	status: integer('status').default(0),
	groupId: integer('group_id'),
	groupAlias: text('group_alias'),
	groupAliasIdx: text('group_alias_idx'),
    avatar: text('avatar'),
	nickName: text('nick_name'),
    nickNameIdx: text('nick_name_idx'),
	gender: integer('gender').default(0),
	pubKey: text('pub_key'),
	sign: text('sign'),
    createdAt: integer('created_at'),
    refreshAt: integer('refresh_at'),
}, (entity) => ({
    groupIdIdx: index('groupMemberIdIdx').on(entity.groupId),
}))

export type IGroupMember = typeof groupMembers.$inferSelect