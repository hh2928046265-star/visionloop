CREATE TABLE `ai_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`model` text NOT NULL,
	`type` text NOT NULL,
	`input` text NOT NULL,
	`output` text,
	`tokens` integer,
	`latency_ms` integer,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`thumbnail_url` text DEFAULT '',
	`metadata` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`input_text` text NOT NULL,
	`analysis` text,
	`status` text DEFAULT 'draft',
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '',
	`type` text DEFAULT 'short_video' NOT NULL,
	`status` text DEFAULT 'idea' NOT NULL,
	`style` text,
	`duration_sec` integer DEFAULT 60,
	`owner_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` text PRIMARY KEY NOT NULL,
	`script_id` text NOT NULL,
	`scene_number` integer NOT NULL,
	`location` text DEFAULT '',
	`time_of_day` text DEFAULT '',
	`duration_sec` integer,
	`action` text DEFAULT '',
	`dialogue` text DEFAULT '',
	`voiceover` text DEFAULT '',
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`script_id`) REFERENCES `scripts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `scripts` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`story_id` text,
	`version` integer DEFAULT 1 NOT NULL,
	`title` text DEFAULT '',
	`status` text DEFAULT 'draft',
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `shot_assets` (
	`shot_id` text NOT NULL,
	`asset_id` text NOT NULL,
	PRIMARY KEY(`shot_id`, `asset_id`),
	FOREIGN KEY (`shot_id`) REFERENCES `shots`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shots` (
	`id` text PRIMARY KEY NOT NULL,
	`scene_id` text NOT NULL,
	`project_id` text NOT NULL,
	`shot_number` integer NOT NULL,
	`duration_sec` integer,
	`shot_type` text DEFAULT 'medium',
	`camera` text,
	`lighting` text,
	`subject` text,
	`emotion` text DEFAULT '',
	`sound` text DEFAULT '',
	`director_note` text DEFAULT '',
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft',
	`created_at` text NOT NULL,
	FOREIGN KEY (`scene_id`) REFERENCES `scenes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`version` integer NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`idea_id` text,
	`version` integer DEFAULT 1 NOT NULL,
	`logline` text DEFAULT '',
	`theme` text DEFAULT '',
	`structure` text,
	`characters` text,
	`status` text DEFAULT 'draft',
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `storyboard_frames` (
	`id` text PRIMARY KEY NOT NULL,
	`storyboard_id` text NOT NULL,
	`shot_id` text,
	`image_url` text DEFAULT '',
	`caption` text DEFAULT '',
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`storyboard_id`) REFERENCES `storyboards`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shot_id`) REFERENCES `shots`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `storyboards` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`layout` text DEFAULT '3x3',
	`title` text DEFAULT '',
	`version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'draft',
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`avatar` text,
	`preferences` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);