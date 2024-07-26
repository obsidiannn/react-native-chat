CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_id` text,
	`chat_type` integer,
	`status` integer,
	`is_enc` integer,
	`last_read_sequence` integer,
	`last_sequence` integer,
	`first_sequence` integer,
	`last_time` integer,
	`create_at` integer,
	`chat_avatar` text,
	`source_id` text,
	`chat_alias` text,
	`is_top` integer DEFAULT 0,
	`chat_user_id` integer,
	`is_mute` integer DEFAULT 0,
	`chat_describe` text,
	`refreshAt` integer
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY NOT NULL,
	`group_name` text,
	`group_avatar` text,
	`create_at` integer,
	`member_limit` integer,
	`total` integer,
	`owner_id` integer,
	`creator_id` integer,
	`group_notice` text,
	`group_desc` text,
	`group_cover` integer,
	`is_enc` integer DEFAULT 1,
	`group_type` integer,
	`ban_type` integer,
	`search_type` integer,
	`status` integer,
	`member_role` integer,
	`tags` text,
	`enc_key` text(2048),
	`enc_pri` text(2048),
	`chat_id` text,
	`refreshAt` integer
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text,
	`type` integer,
	`sequence` integer,
	`uid` integer,
	`uid_type` integer,
	`time` integer,
	`state` integer,
	`data` text(2048),
	`extra` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`addr` text,
	`avatar` text,
	`pubKey` text,
	`gender` integer,
	`nickName` text,
	`nickNameIdx` text,
	`userName` text,
	`sign` text,
	`createdAt` integer,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP,
	`refreshAt` integer,
	`is_friend` integer DEFAULT 0,
	`friendId` integer DEFAULT 0,
	`friend_alias` text,
	`friend_alias_idx` text,
	`is_self` integer DEFAULT 0,
	`chatId` text
);
--> statement-breakpoint
CREATE INDEX `typeIdx` ON `chats` (`chat_type`);--> statement-breakpoint
CREATE INDEX `isTopIdx` ON `chats` (`is_top`);--> statement-breakpoint
CREATE INDEX `chatRefreshIdx` ON `chats` (`refreshAt`);--> statement-breakpoint
CREATE INDEX `groupChatIdIdx` ON `groups` (`chat_id`);--> statement-breakpoint
CREATE INDEX `groupRefreshIdx` ON `groups` (`refreshAt`);--> statement-breakpoint
CREATE INDEX `msgChatIdx` ON `messages` (`chat_id`);--> statement-breakpoint
CREATE INDEX `sequenceIdx` ON `messages` (`sequence`);--> statement-breakpoint
CREATE INDEX `addrIdx` ON `users` (`addr`);--> statement-breakpoint
CREATE INDEX `userNameIdx` ON `users` (`userName`);--> statement-breakpoint
CREATE INDEX `userRefreshIdx` ON `users` (`refreshAt`);