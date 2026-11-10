/* KWANG (by ZOOTRONIA) — IndexedDB wrapper (เก็บข้อมูลในเครื่อง ใช้งานออฟไลน์ได้) */
const ZDB = (() => {
  const NAME = 'zootronia', VER = 1;
  let dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const rq = indexedDB.open(NAME, VER);
      rq.onupgradeneeded = () => {
        const db = rq.result;
        if (!db.objectStoreNames.contains('beetles')) db.createObjectStore('beetles', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('logs')) {
          const s = db.createObjectStore('logs', { keyPath: 'id' });
          s.createIndex('beetleId', 'beetleId');
        }
      };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
    return dbp;
  }

  function tx(store, mode, fn) {
    return open().then(db => new Promise((res, rej) => {
      const t = db.transaction(store, mode);
      const out = fn(t.objectStore(store));
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : undefined);
      t.onerror = () => rej(t.error);
    }));
  }

  const uid = () => (crypto.randomUUID ? crypto.randomUUID() :
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  return {
    uid,
    put: (store, obj) => tx(store, 'readwrite', s => s.put(obj)).then(() => obj),
    del: (store, id) => tx(store, 'readwrite', s => s.delete(id)),
    get: (store, id) => open().then(db => new Promise((res, rej) => {
      const rq = db.transaction(store).objectStore(store).get(id);
      rq.onsuccess = () => res(rq.result || null);
      rq.onerror = () => rej(rq.error);
    })),
    all: (store) => open().then(db => new Promise((res, rej) => {
      const rq = db.transaction(store).objectStore(store).getAll();
      rq.onsuccess = () => res(rq.result || []);
      rq.onerror = () => rej(rq.error);
    })),
    logsOf: (beetleId) => open().then(db => new Promise((res, rej) => {
      const rq = db.transaction('logs').objectStore('logs').index('beetleId').getAll(beetleId);
      rq.onsuccess = () => res(rq.result || []);
      rq.onerror = () => rej(rq.error);
    })),
    delLogsOf: async (beetleId) => {
      const logs = await ZDB.logsOf(beetleId);
      for (const l of logs) await ZDB.del('logs', l.id);
    },
    clearAll: () => Promise.all([
      tx('beetles', 'readwrite', s => s.clear()),
      tx('logs', 'readwrite', s => s.clear()),
    ]),
  };
})();
