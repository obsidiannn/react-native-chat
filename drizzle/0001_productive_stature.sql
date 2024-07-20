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
CREATE INDEX `chatIdx` ON `messages` (`chat_id`);--> statement-breakpoint
CREATE INDEX `sequenceIdx` ON `messages` (`sequence`);