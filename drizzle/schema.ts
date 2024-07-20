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
}, (users) => ({
    addrIdx: index('addrIdx').on(users.addr),
    userNameIdx: index('userNameIdx').on(users.userName),
})
);