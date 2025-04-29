PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`id` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`userId` integer NOT NULL,
	`listingId` integer NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`listingId`) REFERENCES `listings`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_comments`("id", "text", "userId", "listingId", "createdAt", "updatedAt") SELECT "id", "text", "userId", "listingId", "createdAt", "updatedAt" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_listingToCategory` (
	`listingId` integer NOT NULL,
	`categoryId` integer NOT NULL,
	PRIMARY KEY(`listingId`, `categoryId`),
	FOREIGN KEY (`listingId`) REFERENCES `listings`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_listingToCategory`("listingId", "categoryId") SELECT "listingId", "categoryId" FROM `listingToCategory`;--> statement-breakpoint
DROP TABLE `listingToCategory`;--> statement-breakpoint
ALTER TABLE `__new_listingToCategory` RENAME TO `listingToCategory`;--> statement-breakpoint
CREATE TABLE `__new_listings` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`sum` integer NOT NULL,
	`condition` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`ownerId` integer NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_listings`("id", "title", "description", "sum", "condition", "images", "ownerId", "createdAt", "updatedAt") SELECT "id", "title", "description", "sum", "condition", "images", "ownerId", "createdAt", "updatedAt" FROM `listings`;--> statement-breakpoint
DROP TABLE `listings`;--> statement-breakpoint
ALTER TABLE `__new_listings` RENAME TO `listings`;--> statement-breakpoint
CREATE TABLE `__new_passwords` (
	`hash` text NOT NULL,
	`userId` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_passwords`("hash", "userId") SELECT "hash", "userId" FROM `passwords`;--> statement-breakpoint
DROP TABLE `passwords`;--> statement-breakpoint
ALTER TABLE `__new_passwords` RENAME TO `passwords`;--> statement-breakpoint
CREATE TABLE `__new_permissionsToRoles` (
	`permissionId` integer NOT NULL,
	`roleId` integer NOT NULL,
	PRIMARY KEY(`permissionId`, `roleId`),
	FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_permissionsToRoles`("permissionId", "roleId") SELECT "permissionId", "roleId" FROM `permissionsToRoles`;--> statement-breakpoint
DROP TABLE `permissionsToRoles`;--> statement-breakpoint
ALTER TABLE `__new_permissionsToRoles` RENAME TO `permissionsToRoles`;--> statement-breakpoint
CREATE TABLE `__new_usersToRoles` (
	`userId` integer NOT NULL,
	`roleId` integer NOT NULL,
	PRIMARY KEY(`userId`, `roleId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_usersToRoles`("userId", "roleId") SELECT "userId", "roleId" FROM `usersToRoles`;--> statement-breakpoint
DROP TABLE `usersToRoles`;--> statement-breakpoint
ALTER TABLE `__new_usersToRoles` RENAME TO `usersToRoles`;