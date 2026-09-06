CREATE TABLE "resume_uploads" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"size" integer NOT NULL,
	"content_type" varchar(64) DEFAULT 'application/pdf' NOT NULL,
	"blob_url" text NOT NULL,
	"pathname" text NOT NULL,
	"hash" varchar(128),
	"job_id" varchar(128),
	"candidate_id" varchar(128),
	"status" varchar(32) DEFAULT 'stored' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "location" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "location" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "current_role_title" text;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "current_company" text;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "total_years_experience" numeric;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "highest_degree_level" varchar(32);--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "highest_degree_field" text;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "expected_salary_min" numeric;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "expected_salary_max" numeric;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "salary_currency" varchar(8);--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "notice_period_days" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "employment_type" varchar(32);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "location_requirement" jsonb NOT NULL;