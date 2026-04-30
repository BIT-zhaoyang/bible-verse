CREATE TYPE "public"."admin_role" AS ENUM('owner');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('pending', 'processing', 'review_required', 'approved', 'rejected', 'failed', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."generation_trigger" AS ENUM('cron', 'manual_regenerate');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('scheduled', 'approved', 'published', 'skipped', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."storage_provider" AS ENUM('local', 'r2');--> statement-breakpoint
CREATE TYPE "public"."verse_status" AS ENUM('draft', 'ready', 'disabled');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'owner' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "daily_publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publish_date" text NOT NULL,
	"verse_id" uuid NOT NULL,
	"generation_id" uuid NOT NULL,
	"status" "publication_status" DEFAULT 'scheduled' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"skip_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"verse_id" uuid NOT NULL,
	"target_date" text NOT NULL,
	"provider" text NOT NULL,
	"provider_model" text NOT NULL,
	"prompt_snapshot" text NOT NULL,
	"source_image_url" text,
	"card_image_simple_url" text,
	"card_image_extended_url" text,
	"storage_provider" "storage_provider" DEFAULT 'local' NOT NULL,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"trigger_type" "generation_trigger" NOT NULL,
	"generation_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"book_name" text NOT NULL,
	"chapter" integer NOT NULL,
	"verse_range" text NOT NULL,
	"reference_text" text NOT NULL,
	"translation" text DEFAULT 'WEB' NOT NULL,
	"verse_text" text NOT NULL,
	"explanation_text" text NOT NULL,
	"theme_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prompt_text" text NOT NULL,
	"status" "verse_status" DEFAULT 'draft' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_publications" ADD CONSTRAINT "daily_publications_verse_id_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."verses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_publications" ADD CONSTRAINT "daily_publications_generation_id_image_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."image_generations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_publications" ADD CONSTRAINT "daily_publications_approved_by_admin_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_generations" ADD CONSTRAINT "image_generations_verse_id_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."verses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_sessions_user_idx" ON "admin_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_publications_publish_date_idx" ON "daily_publications" USING btree ("publish_date");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_publications_publish_date_status_unique_idx" ON "daily_publications" USING btree ("publish_date") WHERE "daily_publications"."status" in ('approved', 'published');--> statement-breakpoint
CREATE UNIQUE INDEX "daily_publications_date_generation_unique_idx" ON "daily_publications" USING btree ("publish_date","generation_id");--> statement-breakpoint
CREATE INDEX "image_generations_target_date_idx" ON "image_generations" USING btree ("target_date");--> statement-breakpoint
CREATE INDEX "image_generations_verse_date_idx" ON "image_generations" USING btree ("verse_id","target_date");--> statement-breakpoint
CREATE UNIQUE INDEX "image_generations_target_date_version_idx" ON "image_generations" USING btree ("target_date","generation_version");--> statement-breakpoint
CREATE INDEX "verses_reference_idx" ON "verses" USING btree ("book_name","chapter","verse_range");--> statement-breakpoint
CREATE INDEX "verses_status_idx" ON "verses" USING btree ("status","is_active");