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
    isFriend: integer("isFriend").default(0),
    friendId: integer("friendId").default(0),
    chatId: text("chatId"),
}, (users) => ({
    addrIdx: index('addrIdx').on(users.addr),
    userNameIdx: index('userNameIdx').on(users.userName),
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
    chatIdx: index('chatIdx').on(entity.chatId),
    sequenceIdx: index('sequenceIdx').on(entity.sequence),
}))

export type IMessage = typeof messages.$inferSelect