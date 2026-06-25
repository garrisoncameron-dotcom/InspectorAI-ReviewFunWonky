const AgencyDataStore = (() => {
  const dbName = "inspectaid-agency-os";
  const dbVersion = 1;
  const stateKey = "agency-os-state";

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("keyval")) db.createObjectStore("keyval", { keyPath: "key" });
        if (!db.objectStoreNames.contains("syncQueue")) db.createObjectStore("syncQueue", { keyPath: "id" });
        if (!db.objectStoreNames.contains("records")) db.createObjectStore("records", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function transact(storeName, mode, callback) {
    return openDatabase().then((db) => new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);
      transaction.oncomplete = () => resolve(request?.result);
      transaction.onerror = () => reject(transaction.error);
    }));
  }

  function getKey(key) {
    return transact("keyval", "readonly", (store) => store.get(key)).then((row) => row?.value || null);
  }

  function setKey(key, value) {
    return transact("keyval", "readwrite", (store) => store.put({ key, value, updatedAt: new Date().toISOString() }));
  }

  function getAll(storeName) {
    return transact(storeName, "readonly", (store) => store.getAll()).then((rows) => rows || []);
  }

  function putRecord(record) {
    return transact("records", "readwrite", (store) => store.put(record));
  }

  function putSyncEvent(event) {
    return transact("syncQueue", "readwrite", (store) => store.put(event));
  }

  async function queueSyncEvent(recordType, operation, payload) {
    const event = {
      id: `${recordType}-${operation}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      recordType,
      operation,
      payload,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    await putSyncEvent(event);
    return event;
  }

  async function saveAppState(snapshot) {
    const value = {
      ...snapshot,
      savedAt: new Date().toISOString()
    };
    await setKey(stateKey, value);
    await queueSyncEvent("agency_configuration", "update", value);
    return value;
  }

  async function saveTestSubmission(form, answers) {
    const record = {
      id: `application-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: "application",
      formId: form.id,
      formTitle: form.title,
      formStatus: form.status,
      answers,
      status: "local test submission",
      syncStatus: "pending",
      createdAt: new Date().toISOString()
    };
    await putRecord(record);
    await queueSyncEvent("application", "create", record);
    return record;
  }

  async function clearAll() {
    const db = await openDatabase();
    await Promise.all([...db.objectStoreNames].map((storeName) => new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).clear();
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    })));
  }

  async function loadSnapshot() {
    const [appState, syncEvents, records] = await Promise.all([
      getKey(stateKey),
      getAll("syncQueue"),
      getAll("records")
    ]);
    return {
      appState,
      syncEvents,
      records
    };
  }

  return {
    clearAll,
    loadSnapshot,
    queueSyncEvent,
    saveAppState,
    saveTestSubmission
  };
})();

window.AgencyDataStore = AgencyDataStore;
