CREATE TABLE "candidate_group_memberships" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"group_id" varchar(128) NOT NULL,
	"candidate_id" varchar(128) NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"job_id" varchar(128),
	"parent_id" varchar(128),
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_group_memberships" ADD CONSTRAINT "candidate_group_memberships_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_group_memberships" ADD CONSTRAINT "candidate_group_memberships_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_parent_id_groups_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_group_unique" ON "candidate_group_memberships" USING btree ("group_id","candidate_id");