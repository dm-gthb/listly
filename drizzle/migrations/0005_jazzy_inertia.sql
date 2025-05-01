CREATE TABLE `attributeValues` (
	`id` integer PRIMARY KEY NOT NULL,
	`attributeId` integer NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`attributeId`) REFERENCES `attributes`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `attributes` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`inputType` text NOT NULL,
	`unit` text,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attributes_slug_unique` ON `attributes` (`slug`);--> statement-breakpoint
CREATE TABLE `categoryToAttribute` (
	`categoryId` integer NOT NULL,
	`attributeId` integer NOT NULL,
	PRIMARY KEY(`categoryId`, `attributeId`),
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`attributeId`) REFERENCES `attributes`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listingAttributes` (
	`listingId` integer NOT NULL,
	`attributeId` integer NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`listingId`, `attributeId`),
	FOREIGN KEY (`listingId`) REFERENCES `listings`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`attributeId`) REFERENCES `attributes`(`id`) ON UPDATE cascade ON DELETE cascade
);
