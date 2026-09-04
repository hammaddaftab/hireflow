CREATE TABLE "candidate_reviews" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"candidate_id" varchar(128) NOT NULL,
	"job_id" varchar(128) NOT NULL,
	"decision" varchar(32) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"applied_job_id" varchar(128),
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"cnic" varchar(32),
	"city" text,
	"province" text,
	"pdf_url" text,
	"source_document" jsonb NOT NULL,
	"identity" jsonb NOT NULL,
	"work_history" jsonb NOT NULL,
	"education" jsonb NOT NULL,
	"skills_demonstrated" jsonb NOT NULL,
	"skills_declared" jsonb NOT NULL,
	"logistics" jsonb NOT NULL,
	"extraction_metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"seniority_level" text,
	"skills_required" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skills_preferred" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"min_experience" jsonb NOT NULL,
	"education_min" jsonb NOT NULL,
	"location" jsonb NOT NULL,
	"work_mode" jsonb NOT NULL,
	"compensation_band" jsonb NOT NULL,
	"max_notice_period" jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "query_evaluations" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"job_id" varchar(128) NOT NULL,
	"query_text" text NOT NULL,
	"evaluations" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_reviews" ADD CONSTRAINT "candidate_reviews_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_reviews" ADD CONSTRAINT "candidate_reviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_applied_job_id_jobs_id_fk" FOREIGN KEY ("applied_job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "query_evaluations" ADD CONSTRAINT "query_evaluations_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;