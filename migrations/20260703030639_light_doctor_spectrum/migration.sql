CREATE TABLE `checks` (
	`id` text PRIMARY KEY,
	`template_id` text NOT NULL,
	`template_revision` text NOT NULL,
	`created_at` text NOT NULL,
	`user_id` text,
	`data` text NOT NULL
);
