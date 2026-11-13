// Yana's advice texts, only in the test build with advice (R-39).
//
// pool.json is NOT in this public repo (R-34): the private repo
// psychosurf-advice copies it here right before building that test build.
// In the public build the file is absent, so POOL is null and advice stays off.
const files = import.meta.glob('./pool.json', { eager: true, import: 'default' });

export const POOL = files['./pool.json'] ?? null;
