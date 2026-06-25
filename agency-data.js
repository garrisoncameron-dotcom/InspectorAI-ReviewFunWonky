const AgencyDataStore = (() => {
  const dbName = "inspectaid-agency-os";
  const dbVersion = 1;
  const agenciesKey = "agency-os-agencies";
  const currentAgencyKey = "agency-os-current-agency";

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

  function stateKey(agencyId) {
    return `agency-os-state-${agencyId}`;
  }

  async function queueSyncEvent(recordType, operation, payload, agencyId = "mecklenburg-county-nc", status = "pending") {
    const event = {
      id: `${agencyId}-${recordType}-${operation}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      agencyId,
      recordType,
      operation,
      payload,
      status,
      createdAt: new Date().toISOString()
    };
    await putSyncEvent(event);
    return event;
  }

  async function saveAppState(snapshot) {
    const agencyId = snapshot.agencyId || "mecklenburg-county-nc";
    const value = {
      ...snapshot,
      agencyId,
      savedAt: new Date().toISOString()
    };
    await setKey(stateKey(agencyId), value);
    let remoteStatus = "pending";
    if (window.InspectAidSupabase?.enabled) {
      try {
        await window.InspectAidSupabase.saveConfiguration(value);
        remoteStatus = "synced";
      } catch (error) {
        remoteStatus = "pending";
      }
    }
    await queueSyncEvent("agency_configuration", "update", value, agencyId, remoteStatus);
    return value;
  }

  async function saveTestSubmission(form, answers, agencyId = "mecklenburg-county-nc", options = {}) {
    const recordType = options.recordType || (form.id?.includes("complaint") ? "complaint" : "application");
    const record = {
      id: `${agencyId}-${recordType}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      agencyId,
      type: recordType,
      formId: form.id,
      formTitle: form.title,
      formStatus: form.status,
      answers,
      status: options.status || "local test submission",
      syncStatus: "pending",
      createdAt: new Date().toISOString()
    };
    if (window.InspectAidSupabase?.enabled && options.remote !== false) {
      try {
        const remote = recordType === "complaint"
          ? await window.InspectAidSupabase.submitComplaint({ agencyId, answers })
          : await window.InspectAidSupabase.submitApplication({ agencyId, form, answers, portalSource: options.portalSource || "staff_test" });
        record.syncStatus = remote.remote ? "synced" : "pending";
        record.remoteId = remote.data?.id || null;
      } catch (error) {
        record.syncStatus = "pending";
        record.syncError = error.message;
      }
    }
    await putRecord(record);
    await queueSyncEvent(recordType, "create", record, agencyId, record.syncStatus === "synced" ? "synced" : "pending");
    return record;
  }

  async function loadAgencies(defaultAgencies) {
    const agencies = await getKey(agenciesKey);
    if (agencies?.length) return agencies;
    await setKey(agenciesKey, defaultAgencies);
    return defaultAgencies;
  }

  async function saveAgencies(agencies) {
    await setKey(agenciesKey, agencies);
    return agencies;
  }

  async function getCurrentAgencyId(defaultAgencyId) {
    return await getKey(currentAgencyKey) || defaultAgencyId;
  }

  async function setCurrentAgencyId(agencyId) {
    await setKey(currentAgencyKey, agencyId);
  }

  async function clearAgency(agencyId) {
    await setKey(stateKey(agencyId), null);
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

  async function loadSnapshot(agencyId = "mecklenburg-county-nc") {
    const [appState, syncEvents, records] = await Promise.all([
      getKey(stateKey(agencyId)),
      getAll("syncQueue"),
      getAll("records")
    ]);
    return {
      appState,
      syncEvents: (syncEvents || []).filter((event) => event.agencyId === agencyId),
      records: (records || []).filter((record) => record.agencyId === agencyId)
    };
  }

  return {
    clearAgency,
    clearAll,
    getCurrentAgencyId,
    loadSnapshot,
    loadAgencies,
    queueSyncEvent,
    saveAppState,
    saveAgencies,
    setCurrentAgencyId,
    saveTestSubmission
  };
})();

window.AgencyDataStore = AgencyDataStore;
