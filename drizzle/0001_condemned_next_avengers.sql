ALTER TABLE "asset" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "asset" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_userId_idx" ON "asset" USING btree ("user_id");