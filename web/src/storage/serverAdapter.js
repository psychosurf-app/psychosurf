// Stores data on our server (release 2, step 3). Same five functions as the
// other adapters, so screens don't change (R-33).
//
// Every request carries Telegram's signed initData; the server checks it and
// knows who the person is (server/src/telegramAuth.js). No passwords.

export function createServerAdapter({ apiUrl, initData, fetchImpl = fetch }) {
  const base = apiUrl.replace(/\/$/, '');

  async function request(method, path, body) {
    const res = await fetchImpl(`${base}${path}`, {
      method,
      headers: {
        authorization: `tma ${initData}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status}`);
    return res.json();
  }

  return {
    load: () => request('GET', '/api/data'),
    saveProfile: (profile) => request('PUT', '/api/profile', profile),
    saveDiaries: (list) => request('PUT', '/api/diaries', list),
    saveEntry: (entry) => request('PUT', `/api/entries/${entry.id}`, entry),
    deleteEntry: (id) => request('DELETE', `/api/entries/${id}`),
  };
}
