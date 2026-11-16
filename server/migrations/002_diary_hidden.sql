-- A sport the person unticks is hidden, not deleted: its trainings stay and
-- come back if the sport is ticked again (same as in the test build).
ALTER TABLE diaries ADD COLUMN hidden boolean NOT NULL DEFAULT false;
