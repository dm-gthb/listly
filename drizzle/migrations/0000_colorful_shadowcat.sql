CREATE TABLE `categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`parentId` integer,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`userId` integer NOT NULL,
	`listingId` integer NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`listingId`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `listingToCategory` (
	`listingId` integer NOT NULL,
	`categoryId` integer NOT NULL,
	PRIMARY KEY(`listingId`, `categoryId`),
	FOREIGN KEY (`listingId`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`sum` integer NOT NULL,
	`condition` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`ownerId` integer NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatarUrl` text,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);