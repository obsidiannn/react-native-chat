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
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `addrIdx` ON `users` (`addr`);--> statement-breakpoint
CREATE INDEX `userNameIdx` ON `users` (`userName`);