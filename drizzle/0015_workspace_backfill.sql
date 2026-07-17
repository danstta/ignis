-- Backfill for installs that predate workspaces (0014 added nullable workspace_id
-- columns; 0016 sets them NOT NULL). If any domain row exists without a workspace,
-- attach everything to a single "Default" workspace and enroll every existing user
-- in it (earliest account becomes owner). Fresh databases skip this entirely —
-- new users get a personal workspace created just-in-time by the app.
DO $$
DECLARE
	ws uuid;
	has_rows boolean;
BEGIN
	SELECT EXISTS (SELECT 1 FROM "workflows" WHERE "workspace_id" IS NULL)
		OR EXISTS (SELECT 1 FROM "templates" WHERE "workspace_id" IS NULL)
		OR EXISTS (SELECT 1 FROM "brands" WHERE "workspace_id" IS NULL)
		OR EXISTS (SELECT 1 FROM "assets" WHERE "workspace_id" IS NULL)
		OR EXISTS (SELECT 1 FROM "connections" WHERE "workspace_id" IS NULL)
		OR EXISTS (SELECT 1 FROM "folders" WHERE "workspace_id" IS NULL)
		OR EXISTS (SELECT 1 FROM "render_jobs" WHERE "workspace_id" IS NULL)
	INTO has_rows;

	IF has_rows THEN
		INSERT INTO "workspaces" ("name") VALUES ('Default') RETURNING "id" INTO ws;

		UPDATE "workflows" SET "workspace_id" = ws WHERE "workspace_id" IS NULL;
		UPDATE "templates" SET "workspace_id" = ws WHERE "workspace_id" IS NULL;
		UPDATE "brands" SET "workspace_id" = ws WHERE "workspace_id" IS NULL;
		UPDATE "assets" SET "workspace_id" = ws WHERE "workspace_id" IS NULL;
		UPDATE "connections" SET "workspace_id" = ws WHERE "workspace_id" IS NULL;
		UPDATE "folders" SET "workspace_id" = ws WHERE "workspace_id" IS NULL;
		UPDATE "render_jobs" SET "workspace_id" = ws WHERE "workspace_id" IS NULL;

		INSERT INTO "workspace_members" ("workspace_id", "user_id", "role")
		SELECT ws, u."id",
			CASE
				WHEN u."id" = (SELECT "id" FROM "user" ORDER BY "created_at" ASC LIMIT 1)
					THEN 'owner'
				ELSE 'member'
			END
		FROM "user" u
		ON CONFLICT DO NOTHING;
	END IF;
END $$;
