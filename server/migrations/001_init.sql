-- First tables of the server (release 2). Model: docs/data-model.md.
-- Decisions: R-29 (own user id, Telegram only as a way to log in),
-- R-35 (deleting a user deletes everything), R-36 (team sees no notes).

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name  text,                                   -- "Как тебя называть" (V-18), empty = «психосёрфик»
  daily_start   date,                                   -- first day in the app: "Приём дня" and trial (R-37, R-40)
  daily_opened  date,                                   -- last day the "Приём дня" card was opened
  settings      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  consent_at    timestamptz,                            -- consent to data processing (Z-12)
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- How a person logs in. Separate table so a second way (e-mail) can be added
-- later without losing diaries if Telegram is blocked (R-29).
CREATE TABLE auth_identities (
  provider          text        NOT NULL CHECK (provider IN ('telegram')),
  provider_user_id  text        NOT NULL,
  user_id           uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, provider_user_id)
);
CREATE INDEX auth_identities_user ON auth_identities (user_id);

-- One diary per sport (R-6). `key` is the app's own key: sport code or "custom:<name>".
CREATE TABLE diaries (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  key         text        NOT NULL,
  sport_code  text,                                     -- null for an own sport
  name        text        NOT NULL,
  color       text        NOT NULL,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);

-- One training (R-2, R-26, R-27). The id comes from the app, so a training
-- saved offline and sent later is not duplicated.
-- Chosen options are arrays of dictionary codes (Сл-1 …), not a join table:
-- simpler, and still easy to count for anonymous statistics (R-36).
CREATE TABLE entries (
  id                  uuid        PRIMARY KEY,
  user_id             uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  diary_id            uuid        NOT NULL REFERENCES diaries (id) ON DELETE CASCADE,
  training_date       date        NOT NULL,
  created_at          timestamptz NOT NULL,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  tone                text        NOT NULL CHECK (tone IN ('good', 'hard', 'numb')),
  emotions            text[]      NOT NULL DEFAULT '{}',
  emotion_note        text        NOT NULL DEFAULT '' CHECK (length(emotion_note) <= 1000),
  motivation          text        CHECK (motivation IN ('forward', 'not_forward')),
  motivation_options  text[]      NOT NULL DEFAULT '{}',
  motivation_note     text        NOT NULL DEFAULT '' CHECK (length(motivation_note) <= 1000),
  advice_pick         jsonb,                            -- which advice pieces this training got (R-38)
  version             integer     NOT NULL DEFAULT 1    -- format of the record (R-33, rule 3)
);
CREATE INDEX entries_user_date ON entries (user_id, training_date);
CREATE INDEX entries_diary ON entries (diary_id);
