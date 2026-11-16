// Starts the server: database -> migrations -> HTTP.
// Settings come from the environment (.env on the server, never in git):
//   DATABASE_URL  postgres://user:password@host:5432/psychosurf
//   PORT          default 3000

import { createDb } from './db.js';
import { migrate } from './migrate.js';
import { createApp } from './app.js';

const db = createDb();
await migrate(db);

const port = Number(process.env.PORT ?? 3000);
createApp({ db }).listen(port, () => console.log(`Психосерф server on port ${port}`));
