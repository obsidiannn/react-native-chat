CREATE TABLE `group_members` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`role` integer DEFAULT 0,
	`status` integer DEFAULT 0,
	`group_id` integer,
	`group_alias` text,
	`group_alias_idx` text,
	`avatar` text,
	`nick_name` text,
	`nick_name_idx` text,
	`gender` integer DEFAULT 0,
	`pub_key` text,
	`sign` text,
	`created_at` integer,
	`refresh_at` integer
);
--> statement-breakpoint
CREATE INDEX `groupMemberIdIdx` ON `group_members` (`group_id`);