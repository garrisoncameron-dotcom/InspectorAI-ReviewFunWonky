async function bootAgencyOS() {
const state = {
  activeView: "command",
  activeStudio: "templates",
  activeTemplate: "food-service",
  activeAgencyId: "mecklenburg-county-nc",
  agencies: [
    { id: "mecklenburg-county-nc", name: "Mecklenburg County NC", slug: "mecklenburg-county-nc", url: "/mecklenburg-county-nc", role: "company_admin" },
    { id: "union-county-nc", name: "Union County NC", slug: "union-county-nc", url: "/union-county-nc", role: "company_admin" },
    { id: "wake-county-nc", name: "Wake County NC", slug: "wake-county-nc", url: "/wake-county-nc", role: "company_admin" },
    { id: "demo-agency", name: "Demo Agency", slug: "demo-agency", url: "/demo-agency", role: "company_admin" }
  ],
  activeFormId: "food-application",
  editingFieldId: null,
  activeModalTab: "general",
  activeAiMode: "scan",
  aiDraft: null,
  dataStatus: "loading",
  savedAt: null,
  syncEvents: [],
  testRecords: [],
  forms: [
    {
      id: "food-application",
      title: "Food service application",
      source: "Food Service Agency template",
      status: "template",
      description: "Public intake form for new food establishment permits.",
      fields: [
        {
          id: "legal-name",
          label: "Legal business name",
          key: "application.legal_business_name",
          type: "Text",
          section: "Application",
          required: "true",
          visibility: "Public and staff",
          editRole: "Intake staff",
          helpText: "Use the legal entity name that will appear on the permit.",
          width: "Full",
          recordMap: "Application",
          auditLevel: "Standard"
        },
        {
          id: "facility-address",
          label: "Facility address",
          key: "facility.address",
          type: "Address",
          section: "Application",
          required: "true",
          visibility: "Public and staff",
          editRole: "Intake staff",
          helpText: "Physical location where regulated activity occurs.",
          width: "Full",
          recordMap: "Facility",
          auditLevel: "Standard"
        },
        {
          id: "permit-class",
          label: "Permit class",
          key: "permit.class",
          type: "Select",
          section: "Permit",
          required: "true",
          visibility: "Staff only",
          editRole: "Agency admin",
          helpText: "Internal classification used for fees, inspection frequency, and reports.",
          options: "Food service\nMobile food unit\nTemporary event\nCaterer\nCommissary",
          width: "Half",
          recordMap: "Permit",
          auditLevel: "High"
        },
        {
          id: "risk-category",
          label: "Risk category",
          key: "inspection.risk_category",
          type: "Select",
          section: "Inspection",
          required: "true",
          visibility: "Staff only",
          editRole: "Supervisor",
          helpText: "Drives routine inspection frequency.",
          options: "Low\nMedium\nHigh\nPriority",
          width: "Half",
          recordMap: "Inspection",
          auditLevel: "High",
          sourceLink: "Food code source pack"
        }
      ]
    },
    {
      id: "complaint-intake",
      title: "Complaint intake",
      source: "Food Service Agency template",
      status: "template",
      description: "Public complaint form linked to facilities and follow-up inspections.",
      fields: [
        {
          id: "complaint-source",
          label: "Complaint source",
          key: "complaint.source",
          type: "Select",
          section: "Complaints",
          required: "true",
          visibility: "Public and staff",
          editRole: "Intake staff",
          options: "Public\nAnonymous\nReferral\nAgency staff",
          helpText: "How the complaint was received.",
          width: "Half",
          recordMap: "Complaint",
          auditLevel: "Standard"
        },
        {
          id: "complaint-details",
          label: "Complaint details",
          key: "complaint.details",
          type: "Long text",
          section: "Complaints",
          required: "true",
          visibility: "Public and staff",
          editRole: "Intake staff",
          helpText: "Narrative complaint description.",
          width: "Full",
          recordMap: "Complaint",
          auditLevel: "High"
        }
      ]
    }
  ]
};

const modules = [
  {
    id: "applications",
    title: "Applications",
    badge: "18 new",
    text: "Public portal submissions flow into staff review, correction requests, approval, and conversion to permits."
  },
  {
    id: "permits",
    title: "Permits",
    badge: "642 active",
    text: "Facility records, contacts, permit status, renewals, documents, and complete agency history."
  },
  {
    id: "billing",
    title: "Billing and invoicing",
    badge: "$42.8k due",
    text: "Fee schedules, invoices, receipts, payment status, renewal fees, and account balances."
  },
  {
    id: "inspections",
    title: "Inspections and complaints",
    badge: "InspectAid",
    text: "Routine inspections, complaint investigations, follow-ups, violations, citations, and final reports."
  }
];

const timeline = [
  ["Application", "New food service application submitted online", "Needs completeness review", "warn"],
  ["Application", "Applicant uploaded floor plan and menu", "Documents attached", "good"],
  ["Permit", "Application approved and converted to permit", "Permit FS-2026-1842", "good"],
  ["Billing", "Annual food service permit invoice generated", "$425 due", "warn"],
  ["Inspection", "Opening inspection scheduled", "Assigned to field staff", "good"],
  ["Complaint", "Public complaint linked to permitted facility", "Triage required", "alert"]
];

const templates = [
  {
    id: "food-service",
    title: "Food Service Agency",
    text: "Restaurants, mobile units, temporary events, risk categories, food-code inspections, and recurring permits."
  },
  {
    id: "lodging",
    title: "Tourist Accommodation",
    text: "Hotels, short-term rentals, sanitation inspections, certificate renewals, and complaint investigations."
  },
  {
    id: "septic",
    title: "Septic and Land Use",
    text: "Site applications, plan review, installation permits, inspections, and contractor records."
  }
];

const blueprints = {
  "food-service": [
    ["Applications", "Food establishment, mobile unit, temporary event, ownership change, and renewal intake.", "5 forms"],
    ["Permit types", "Food service, mobile food unit, temporary event, catering, and commissary-linked permits.", "5 types"],
    ["Inspection profile", "Risk category, routine frequency, opening inspection, complaint investigation, follow-up.", "InspectAid"],
    ["Billing rules", "Application fee, annual permit fee, late fee, reinspection fee, and temporary-event fee.", "5 fees"],
    ["Reports", "Inspection report, notice of violation, permit certificate, renewal notice, and invoice.", "5 outputs"]
  ],
  lodging: [
    ["Applications", "Hotel, motel, short-term rental, ownership change, and renewal intake.", "5 forms"],
    ["Permit types", "Tourist accommodation, extended stay, pool add-on, and food add-on.", "4 types"],
    ["Inspection profile", "Sanitation, complaint, follow-up, and seasonal inspection schedules.", "4 tracks"],
    ["Billing rules", "License, room-count tier, late fee, and reinspection fee.", "4 fees"],
    ["Reports", "Certificate, inspection report, complaint letter, and renewal notice.", "4 outputs"]
  ],
  septic: [
    ["Applications", "Site evaluation, repair, installation, contractor, and subdivision review.", "5 forms"],
    ["Permit types", "New system, repair, abandonment, operational permit, and installer registration.", "5 types"],
    ["Inspection profile", "Site visit, installation inspection, final approval, and complaint investigation.", "4 tracks"],
    ["Billing rules", "Application, plan review, permit, reinspection, and contractor registration fees.", "5 fees"],
    ["Reports", "Approval letter, permit, deficiency notice, and final inspection record.", "4 outputs"]
  ]
};

const workflows = [
  ["Applications", ["Submitted", "Completeness review", "Corrections requested", "Ready for approval", "Approved or denied"]],
  ["Permits", ["Draft", "Pending fee", "Active", "Suspended", "Expired", "Renewal due"]],
  ["Inspections", ["Scheduled", "In progress", "Supervisor review", "Finalized", "Follow-up required"]],
  ["Complaints", ["Received", "Triaged", "Assigned", "Inspection linked", "Closed"]]
];

const fees = [
  ["Food service annual permit", "$425", "Generated when a permit is issued or renewed."],
  ["Temporary event permit", "$95", "Generated per event date range and location."],
  ["Reinspection fee", "$150", "Generated when a follow-up is required after unresolved violations."],
  ["Late renewal penalty", "15%", "Generated after configurable grace period."]
];

const inspectionSetup = [
  ["Inspection form templates", "Routine food, opening, complaint, follow-up, and temporary event forms.", "5 forms"],
  ["Frequency rules", "Risk category drives routine inspection cadence and renewal requirements.", "risk-based"],
  ["Trusted source packs", "Agency-approved regulations, SOPs, interpretations, and report language.", "cited"],
  ["Output templates", "Final reports, notices, correction letters, and printable permit certificates.", "mapped"]
];

const portalSetup = [
  ["Public applications", "Applicants can submit forms, upload documents, and track status, but never access setup controls.", "enabled"],
  ["Complaint intake", "Public complaints collect category, facility, contact preference, and attachments only.", "enabled"],
  ["Renewals", "Operators renew permits, update ownership/contact info, and pay fees.", "draft"],
  ["Payments", "Invoices expose balance, payment links, receipts, and staff override notes.", "planned"]
];

const roles = [
  ["Agency admin", "Can configure templates, fields, workflows, roles, fees, and source packs.", "setup allowed"],
  ["Implementation support", "Can assist agency admins during onboarding, migrations, and template tuning.", "setup support"],
  ["Intake staff", "Can review applications, request corrections, and prepare approvals. No setup access.", "applications"],
  ["Inspector", "Can schedule, perform, and draft inspections and complaint investigations. No setup access.", "field work"],
  ["Supervisor", "Can approve reports, enforcement actions, source packs, and overrides.", "approval"],
  ["Billing admin", "Can manage invoices, adjustments, payments, and receipt history. No schema setup by default.", "billing"],
  ["Public user", "Can submit applications, renewals, documents, payments, and complaints only.", "portal only"]
];

const agencyTemplateLibrary = {
  "union-food": {
    agency: "Union County NC",
    title: "Union County food service application",
    rules: "NC food code, local food establishment permitting, plan review, risk category assignment",
    fields: [
      ["Owner legal name", "Text", "Application", "Public and staff"],
      ["Facility physical address", "Address", "Application", "Public and staff"],
      ["Permit type", "Select", "Permit", "Staff only"],
      ["Menu category", "Multi-select", "Application", "Public and staff"],
      ["Floor plan upload", "Document upload", "Application", "Public and staff"],
      ["Owner signature", "Signature", "Application", "Public and staff"],
      ["Risk category", "Select", "Inspection", "Staff only"]
    ]
  },
  "union-pool": {
    agency: "Union County NC",
    title: "Union County public pool permit",
    rules: "NC public pool rules, seasonal opening inspections, operator certification",
    fields: [
      ["Pool facility name", "Text", "Application", "Public and staff"],
      ["Pool type", "Select", "Permit", "Public and staff"],
      ["Certified pool operator", "Text", "Permit", "Public and staff"],
      ["Drain cover documentation", "Document upload", "Application", "Public and staff"],
      ["Opening inspection required", "Checkbox", "Inspection", "Staff only"]
    ]
  },
  "wake-lodging": {
    agency: "Wake County NC",
    title: "Wake County lodging complaint intake",
    rules: "Tourist accommodation sanitation complaints and follow-up tracking",
    fields: [
      ["Property name", "Text", "Complaints", "Public and staff"],
      ["Complaint category", "Select", "Complaints", "Public and staff"],
      ["Room or unit number", "Text", "Complaints", "Public and staff"],
      ["Complaint narrative", "Long text", "Complaints", "Public and staff"],
      ["Photo upload", "Document upload", "Complaints", "Public and staff"]
    ]
  },
  "gwinnett-mobile": {
    agency: "Gwinnett County GA",
    title: "Gwinnett mobile food unit",
    rules: "Mobile unit permit, commissary agreement, route review, food-code inspection",
    fields: [
      ["Mobile unit name", "Text", "Application", "Public and staff"],
      ["Vehicle tag", "Text", "Permit", "Public and staff"],
      ["Commissary agreement", "Document upload", "Application", "Public and staff"],
      ["Menu items", "Long text", "Application", "Public and staff"],
      ["Route schedule", "Document upload", "Application", "Public and staff"],
      ["Inspection risk category", "Select", "Inspection", "Staff only"]
    ]
  }
};

const views = {
  command: document.querySelector("#view-command"),
  configuration: document.querySelector("#view-configuration"),
  inspections: document.querySelector("#view-inspections")
};

const navButtons = [...document.querySelectorAll(".nav-button")];
const moduleGrid = document.querySelector("#moduleGrid");
const timelineList = document.querySelector("#timelineList");
const templateList = document.querySelector("#templateList");
const blueprintList = document.querySelector("#blueprintList");
const fieldList = document.querySelector("#fieldList");
const activeTemplateName = document.querySelector("#activeTemplateName");
const activeFormTitle = document.querySelector("#activeFormTitle");
const activeFormMeta = document.querySelector("#activeFormMeta");
const formList = document.querySelector("#formList");
const useTemplateForm = document.querySelector("#useTemplateForm");
const createBlankForm = document.querySelector("#createBlankForm");
const newBlankForm = document.querySelector("#newBlankForm");
const addFieldButton = document.querySelector("#addFieldButton");
const previewFormButton = document.querySelector("#previewFormButton");
const saveDraftButton = document.querySelector("#saveDraftButton");
const publishFormButton = document.querySelector("#publishFormButton");
const resetLocalDataButton = document.querySelector("#resetLocalDataButton");
const dataStatusText = document.querySelector("#dataStatusText");
const syncQueueStatus = document.querySelector("#syncQueueStatus");
const activeAgencyName = document.querySelector("#activeAgencyName");
const activeAgencyUrl = document.querySelector("#activeAgencyUrl");
const agencySelector = document.querySelector("#agencySelector");
const addAgencyButton = document.querySelector("#addAgencyButton");
const newAgencyName = document.querySelector("#newAgencyName");
const fieldModal = document.querySelector("#fieldModal");
const fieldModalForm = document.querySelector("#fieldModalForm");
const fieldModalTitle = document.querySelector("#fieldModalTitle");
const closeFieldModal = document.querySelector("#closeFieldModal");
const cancelFieldButton = document.querySelector("#cancelFieldButton");
const deleteFieldButton = document.querySelector("#deleteFieldButton");
const modalTabs = [...document.querySelectorAll(".modal-tab")];
const modalPages = [...document.querySelectorAll(".modal-page")];
const studioTabs = [...document.querySelectorAll(".studio-tab")];
const studioSections = [...document.querySelectorAll(".studio-section")];
const workflowBoard = document.querySelector("#workflowBoard");
const feeList = document.querySelector("#feeList");
const inspectionSetupList = document.querySelector("#inspectionSetupList");
const portalSetupList = document.querySelector("#portalSetupList");
const roleList = document.querySelector("#roleList");
const aiModeButtons = [...document.querySelectorAll(".ai-mode")];
const aiSourceFile = document.querySelector("#aiSourceFile");
const aiFileName = document.querySelector("#aiFileName");
const agencyTemplateSelect = document.querySelector("#agencyTemplateSelect");
const aiInstructions = document.querySelector("#aiInstructions");
const generateAiDraft = document.querySelector("#generateAiDraft");
const sendAiDraftToBuilder = document.querySelector("#sendAiDraftToBuilder");
const aiDraftSummary = document.querySelector("#aiDraftSummary");
const aiDraftStatus = document.querySelector("#aiDraftStatus");
const openAiAssistSource = document.querySelector("#openAiAssistSource");
const aiInputPanels = [...document.querySelectorAll("[data-ai-input]")];
const starterForms = cloneForms(state.forms);

function activeAgency() {
  return state.agencies.find((agency) => agency.id === state.activeAgencyId) || state.agencies[0];
}

function renderAgencyEnvironment() {
  const agency = activeAgency();
  activeAgencyName.textContent = agency.name;
  activeAgencyUrl.textContent = agency.url || `/${agency.slug}`;
  agencySelector.innerHTML = state.agencies.map((item) => `
    <option value="${item.id}" ${item.id === state.activeAgencyId ? "selected" : ""}>${item.name}</option>
  `).join("");
}

function slugForAgencyName(name) {
  return slugify(name).replace(/-county$/, "-county") || `agency-${Date.now()}`;
}

function cloneForms(forms) {
  return JSON.parse(JSON.stringify(forms));
}

function snapshotConfiguration() {
  return {
    agencyId: state.activeAgencyId,
    activeFormId: state.activeFormId,
    forms: cloneForms(state.forms),
    template: state.activeTemplate
  };
}

function statusTone(status) {
  if (status === "published" || status === "template" || status === "template copy") return "good";
  if (status === "AI draft" || status === "admin draft" || status === "unsaved draft") return "warn";
  return "";
}

function updateDataStatus(message = null, tone = null) {
  const pending = state.syncEvents.filter((event) => event.status === "pending").length;
  const savedText = state.savedAt ? `Saved ${new Date(state.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Not saved yet";
  dataStatusText.textContent = message || `${savedText} in offline cache`;
  dataStatusText.className = `pill ${tone || (state.dataStatus === "saved" ? "good" : "warn")}`;
  syncQueueStatus.textContent = `${pending} pending sync ${pending === 1 ? "event" : "events"}`;
}

function markDirty() {
  state.dataStatus = "dirty";
  updateDataStatus("Unsaved local changes", "warn");
}

async function refreshLocalSnapshotStatus() {
  if (!window.AgencyDataStore) return;
  const snapshot = await window.AgencyDataStore.loadSnapshot(state.activeAgencyId);
  state.syncEvents = snapshot.syncEvents || [];
  state.testRecords = snapshot.records || [];
  updateDataStatus();
}

async function loadPersistedState() {
  if (!window.AgencyDataStore) {
    state.dataStatus = "memory only";
    updateDataStatus("Offline cache unavailable", "warn");
    return;
  }
  state.agencies = await window.AgencyDataStore.loadAgencies(state.agencies);
  state.activeAgencyId = await window.AgencyDataStore.getCurrentAgencyId(state.activeAgencyId);
  const snapshot = await window.AgencyDataStore.loadSnapshot(state.activeAgencyId);
  if (snapshot.appState?.forms?.length) {
    state.forms = snapshot.appState.forms;
    state.activeFormId = snapshot.appState.activeFormId || state.forms[0]?.id || state.activeFormId;
    state.activeTemplate = snapshot.appState.template || state.activeTemplate;
    state.savedAt = snapshot.appState.savedAt || null;
    state.dataStatus = "saved";
  } else {
    state.forms = cloneForms(starterForms);
    state.activeFormId = state.forms[0]?.id || "food-application";
    state.savedAt = null;
    state.dataStatus = "seed";
  }
  state.syncEvents = snapshot.syncEvents || [];
  state.testRecords = snapshot.records || [];
  renderAgencyEnvironment();
}

async function saveConfiguration(message = "Saved full form schema") {
  if (!window.AgencyDataStore) return;
  const saved = await window.AgencyDataStore.saveAppState(snapshotConfiguration());
  state.savedAt = saved.savedAt;
  state.dataStatus = "saved";
  await refreshLocalSnapshotStatus();
  updateDataStatus(message, "good");
}

async function publishActiveForm() {
  const form = activeForm();
  form.status = "published";
  form.publishedAt = new Date().toISOString();
  form.version = (form.version || 0) + 1;
  form.source = form.source || "Agency-owned form";
  await saveConfiguration(`Published ${form.fields.length} field form`);
  renderFormBuilder();
}

async function switchAgencyEnvironment(agencyId) {
  if (state.dataStatus === "dirty") {
    await saveConfiguration("Saved before switching agency");
  }
  state.activeAgencyId = agencyId;
  await window.AgencyDataStore.setCurrentAgencyId(agencyId);
  state.aiDraft = null;
  await loadPersistedState();
  renderAgencyEnvironment();
  renderTemplates();
  renderBlueprint();
  renderFormBuilder();
  renderAiDraft();
  updateDataStatus(`Loaded ${activeAgency().name}`, "good");
}

async function addAgencyEnvironment() {
  const name = newAgencyName.value.trim();
  if (!name) {
    newAgencyName.focus();
    return;
  }
  const baseSlug = slugForAgencyName(name);
  let slug = baseSlug;
  let counter = 2;
  while (state.agencies.some((agency) => agency.id === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  const agency = {
    id: slug,
    name,
    slug,
    url: `/${slug}`,
    role: "company_admin"
  };
  state.agencies.push(agency);
  await window.AgencyDataStore.saveAgencies(state.agencies);
  await switchAgencyEnvironment(agency.id);
  await saveConfiguration(`Created ${agency.name} environment`);
  newAgencyName.value = "";
}

function setView(view) {
  state.activeView = view;
  Object.entries(views).forEach(([key, element]) => element.classList.toggle("hidden", key !== view));
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
}

function setStudio(section) {
  state.activeStudio = section;
  studioTabs.forEach((button) => button.classList.toggle("active", button.dataset.studio === section));
  studioSections.forEach((element) => element.classList.toggle("hidden", element.dataset.studioSection !== section));
}

function setAiMode(mode) {
  state.activeAiMode = mode;
  aiModeButtons.forEach((button) => button.classList.toggle("active", button.dataset.aiMode === mode));
  aiInputPanels.forEach((panel) => {
    const isCurrentInput = panel.dataset.aiInput === mode || (panel.dataset.aiInput === "scan" && mode === "hs-template");
    panel.classList.toggle("is-muted", !isCurrentInput);
  });
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "field";
}

function keyify(value, section = "custom") {
  return `${section.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") || "field"}`;
}

function activeForm() {
  return state.forms.find((form) => form.id === state.activeFormId) || state.forms[0];
}

function activeField() {
  const form = activeForm();
  return form?.fields.find((field) => field.id === state.editingFieldId) || null;
}

function renderModules() {
  moduleGrid.innerHTML = modules.map((module) => `
    <button class="module-card ${module.id === "inspections" ? "active" : ""}" type="button" data-module="${module.id}">
      <span class="pill ${module.id === "billing" ? "warn" : module.id === "inspections" ? "good" : ""}">${module.badge}</span>
      <strong>${module.title}</strong>
      <p>${module.text}</p>
    </button>
  `).join("");

  moduleGrid.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.module === "inspections" ? "inspections" : "command";
      setView(target);
    });
  });
}

function renderTimeline() {
  timelineList.innerHTML = timeline.map(([stage, title, note, tone]) => `
    <article class="timeline-item">
      <span class="badge ${tone}">${stage}</span>
      <div>
        <strong>${title}</strong>
        <p>${note}</p>
      </div>
      <span class="pill">audit</span>
    </article>
  `).join("");
}

function renderTemplates() {
  templateList.innerHTML = templates.map((template) => `
    <button class="module-card ${template.id === state.activeTemplate ? "active" : ""}" type="button" data-template="${template.id}">
      <span class="pill ${template.id === state.activeTemplate ? "good" : ""}">${template.id === state.activeTemplate ? "active" : "template"}</span>
      <strong>${template.title}</strong>
      <p>${template.text}</p>
    </button>
  `).join("");
  activeTemplateName.textContent = templates.find((template) => template.id === state.activeTemplate)?.title || "Custom template";
  templateList.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTemplate = button.dataset.template;
      renderTemplates();
      renderBlueprint();
    });
  });
}

function renderBlueprint() {
  blueprintList.innerHTML = (blueprints[state.activeTemplate] || []).map(([area, text, count]) => `
    <article class="blueprint-item">
      <span class="pill">${area}</span>
      <div>
        <strong>${text}</strong>
        <p>Template installs editable defaults; admins can rename, hide, require, or replace them.</p>
      </div>
      <span class="badge good">${count}</span>
    </article>
  `).join("");
}

function createBlankFormRecord() {
  const number = state.forms.filter((form) => form.status === "blank").length + 1;
  const form = {
    id: `blank-form-${Date.now()}`,
    title: `Custom form ${number}`,
    source: "Blank slate",
    status: "blank",
    description: "Empty agency-owned form ready for custom fields.",
    fields: []
  };
  state.forms.push(form);
  state.activeFormId = form.id;
  markDirty();
  renderFormBuilder();
  setStudio("fields");
}

function cloneTemplateForm() {
  const source = state.forms.find((form) => form.id === "food-application");
  const clone = {
    ...source,
    id: `food-application-copy-${Date.now()}`,
    title: "Food service application copy",
    source: "Copied from Food Service Agency template",
    status: "template copy",
    fields: source.fields.map((field) => ({ ...field, id: `${field.id}-copy-${Date.now()}-${Math.random().toString(16).slice(2, 6)}` }))
  };
  state.forms.push(clone);
  state.activeFormId = clone.id;
  markDirty();
  renderFormBuilder();
  setStudio("fields");
}

function renderFormList() {
  formList.innerHTML = state.forms.map((form) => `
    <button class="form-card ${form.id === state.activeFormId ? "active" : ""}" type="button" data-form-id="${form.id}">
      <span class="pill ${statusTone(form.status)}">${form.status}</span>
      <strong>${form.title}</strong>
      <p>${form.fields.length} fields · ${form.source}</p>
    </button>
  `).join("");

  formList.querySelectorAll("[data-form-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFormId = button.dataset.formId;
      renderFormBuilder();
    });
  });
}

function renderFields() {
  const form = activeForm();
  activeFormTitle.textContent = form.title;
  activeFormMeta.innerHTML = `
    <span class="pill ${statusTone(form.status)}">${form.status}</span>
    <span class="pill">${form.fields.length} fields</span>
    <span class="pill">v${form.version || 0}</span>
    <span class="pill">${form.source}</span>
    ${form.publishedAt ? `<span class="pill good">published ${new Date(form.publishedAt).toLocaleDateString()}</span>` : ""}
  `;

  fieldList.innerHTML = form.fields.length ? form.fields.map((field) => `
    <article class="field-card">
      <div>
        <div class="field-card-head">
          <span class="pill">${field.section}</span>
          <span class="pill ${field.required === "true" ? "warn" : ""}">${field.required === "true" ? "required" : field.required === "conditional" ? "conditional" : "optional"}</span>
          <span class="pill">${field.type}</span>
          <span class="pill">${field.visibility || "Public and staff"}</span>
        </div>
        <strong>${field.label}</strong>
        <p>${field.helpText || "No help text yet."}</p>
        <p>${field.key || keyify(field.label, field.section)} · ${field.recordMap || "Application"} · ${field.auditLevel || "Standard"} audit</p>
      </div>
      <div class="field-actions">
        <button class="text-button" type="button" data-edit-field="${field.id}">Edit</button>
        <button class="text-button" type="button" data-duplicate-field="${field.id}">Duplicate</button>
        <button class="text-button" type="button" data-delete-field="${field.id}">Delete</button>
      </div>
    </article>
  `).join("") : `
    <article class="field-card">
      <div>
        <div class="field-card-head"><span class="pill">blank slate</span></div>
        <strong>No fields yet</strong>
        <p>Add the first field to define what this agency form collects.</p>
      </div>
      <div class="field-actions">
        <button class="text-button" type="button" data-add-empty-field="true">Add field</button>
      </div>
    </article>
  `;

  fieldList.querySelectorAll("[data-edit-field]").forEach((button) => {
    button.addEventListener("click", () => openFieldModal(button.dataset.editField));
  });
  fieldList.querySelectorAll("[data-duplicate-field]").forEach((button) => {
    button.addEventListener("click", () => duplicateField(button.dataset.duplicateField));
  });
  fieldList.querySelectorAll("[data-delete-field]").forEach((button) => {
    button.addEventListener("click", () => deleteField(button.dataset.deleteField));
  });
  fieldList.querySelectorAll("[data-add-empty-field]").forEach((button) => {
    button.addEventListener("click", () => openFieldModal());
  });
}

function renderFormBuilder() {
  renderFormList();
  renderFields();
}

function fieldFromAi([label, type, section, visibility], index) {
  return {
    id: `${slugify(label)}-${Date.now()}-${index}`,
    label,
    key: keyify(label, section),
    type,
    section,
    required: index < 4 ? "true" : "conditional",
    visibility,
    editRole: visibility === "Staff only" ? "Agency admin" : "Intake staff",
    helpText: `AI draft from ${state.activeAiMode === "agency" ? "agency template library" : "uploaded form/instructions"}. Admin must review before publishing.`,
    width: type === "Long text" || type === "Document upload" ? "Full" : "Half",
    recordMap: section,
    reportOutput: section === "Inspection" ? "Inspection report" : "Application summary",
    auditLevel: visibility === "Staff only" ? "High" : "Standard",
    sourceLink: section === "Inspection" ? "Food code source pack" : "None"
  };
}

function cleanExtractedLabel(value) {
  return value
    .replace(/^[\s•\-*]+/, "")
    .replace(/^\(?[0-9A-Za-z]{1,3}[\).:-]\s+/, "")
    .replace(/\s*\(?required\)?\s*$/i, "")
    .replace(/[:：]\s*$/, "")
    .replace(/[_]{2,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferFieldType(label) {
  const text = label.toLowerCase();
  if (text.includes("signature") || text.includes("signed by")) return "Signature";
  if (text.includes("upload") || text.includes("attach") || text.includes("document") || text.includes("photo")) return "Document upload";
  if (text.includes("date") || text.includes("dob") || text.includes("expiration")) return "Date";
  if (text.includes("number of") || text.includes("amount") || text.includes("fee") || text.includes("count")) return "Number";
  if (text.includes("address") || text.includes("location")) return "Address";
  if (text.includes("check all") || text.includes("select all")) return "Multi-select";
  if (text.includes("yes") && text.includes("no")) return "Checkbox";
  if (text.includes("describe") || text.includes("explain") || text.includes("narrative") || text.includes("comments") || text.includes("notes")) return "Long text";
  if (text.includes("type") || text.includes("category") || text.includes("status")) return "Select";
  return "Text";
}

function inferSection(label, currentSection) {
  const text = label.toLowerCase();
  if (text.includes("complaint")) return "Complaints";
  if (text.includes("inspection") || text.includes("violation") || text.includes("risk")) return "Inspection";
  if (text.includes("permit") || text.includes("license")) return "Permit";
  if (text.includes("invoice") || text.includes("fee") || text.includes("payment")) return "Billing";
  if (text.includes("facility") || text.includes("address") || text.includes("location")) return "Facility";
  if (text.includes("internal") || text.includes("staff only")) return "Internal review";
  return currentSection || "Application";
}

function detectDelimitedRows(text) {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return { headers: [], rows: [], delimiter: "\t" };
  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim());
  const firstLine = lines[0] || "";
  const delimiter = firstLine.includes("\t") ? "\t" : ",";
  const parseLine = (line) => {
    const values = [];
    let current = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];
      if (char === "\"" && quoted && next === "\"") {
        current += "\"";
        index += 1;
      } else if (char === "\"") {
        quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };
  const headers = parseLine(lines[0]).map((header) => header.replace(/^\uFEFF/, "").trim());
  const rows = lines.slice(1).map((line) => {
    const values = parseLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
  return { headers, rows, delimiter };
}

function isHsTemplateFlatfile(text) {
  const { headers } = detectDelimitedRows(text);
  const headerSet = new Set(headers.map((header) => header.toLowerCase()));
  return ["type", "required", "label", "field id"].every((header) => headerSet.has(header));
}

function mapHsFieldType(type, label, options) {
  const normalizedType = type.toLowerCase();
  const normalizedLabel = label.toLowerCase();
  if (normalizedType.includes("email")) return "Email";
  if (normalizedType.includes("phone")) return "Phone";
  if (normalizedType.includes("textarea")) return "Long text";
  if (normalizedType.includes("signature")) return "Signature";
  if (normalizedType.includes("number")) return "Number";
  if (normalizedType.includes("date")) return "Date";
  if (normalizedType.includes("checkbox")) return "Checkbox";
  if (normalizedType.includes("drop down") || normalizedType.includes("assigned") || normalizedType.includes("embedded form search")) {
    return options.trim() ? "Select" : "Text";
  }
  if (normalizedType.includes("information box")) return "Long text";
  if (normalizedType.includes("reload")) return options.trim() ? "Select" : "Text";
  if (normalizedLabel.includes("address")) return "Address";
  return "Text";
}

function mapHsFieldSection(label, group, type) {
  const source = `${group} ${label} ${type}`.toLowerCase();
  if (source.includes("inspection")) return "Inspection";
  if (source.includes("permit") || source.includes("construction") || source.includes("plan review")) return "Permit";
  if (source.includes("fee") || source.includes("payment") || source.includes("billing")) return "Billing";
  if (source.includes("complaint")) return "Complaints";
  if (source.includes("assigned") || source.includes("status") || source.includes("review")) return "Internal review";
  return "Application";
}

function normalizeHsOptions(options) {
  return options
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((option) => option.replace(/^"|"$/g, "").trim())
    .filter(Boolean)
    .join("\n");
}

function hsConditionalRule(row) {
  const rules = [];
  if (row["Show On"]?.trim()) rules.push(`Show on: ${row["Show On"].trim()}`);
  if (row["Hide On"]?.trim()) rules.push(`Hide on: ${row["Hide On"].trim()}`);
  if (row["Use On List Screen"]?.toLowerCase() === "true") rules.push("Use on list screen");
  if (row["Filter On List Screen"]?.toLowerCase() === "true") rules.push("Filter on list screen");
  return rules.join("; ");
}

function fieldFromHsRow(row, index) {
  const label = row.Label?.trim() || row["Field ID"]?.trim() || `Imported field ${index + 1}`;
  const fieldId = row["Field ID"]?.trim() || slugify(label);
  const type = mapHsFieldType(row.Type || "", label, row.Options || "");
  const group = row["Field Group"]?.trim();
  const section = mapHsFieldSection(label, group || "", row.Type || "");
  const notes = [
    group ? `HS group: ${group}` : "",
    fieldId ? `HS variable: ${fieldId}` : "",
    row["Config Notes"]?.trim() ? `Notes: ${row["Config Notes"].trim()}` : "",
    row.Type?.trim() ? `Original HS type: ${row.Type.trim()}` : ""
  ].filter(Boolean);
  return {
    id: `${slugify(fieldId)}-${Date.now()}-${index}`,
    label,
    key: `hs.${fieldId.replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || slugify(label)}`,
    type,
    section,
    required: row.Required?.toLowerCase() === "true" ? "true" : "false",
    visibility: section === "Internal review" ? "Staff only" : "Public and staff",
    editRole: section === "Internal review" ? "Agency admin" : "Intake staff",
    helpText: notes.join(" | ") || "Imported from HealthSpace field export. Admin should review before publishing.",
    placeholder: row["Config Notes"]?.trim() || "",
    validation: type === "Email" ? "email" : type === "Phone" ? "phone" : "",
    options: normalizeHsOptions(row.Options || ""),
    conditionalRule: hsConditionalRule(row),
    defaultValue: "",
    width: type === "Long text" || type === "Document upload" || type === "Signature" ? "Full" : "Half",
    position: "Next available",
    publicLabel: label,
    staffLabel: label,
    recordMap: section === "Billing" ? "Invoice" : section === "Complaints" ? "Complaint" : ["Permit", "Inspection", "Application"].includes(section) ? section : "Application",
    reportOutput: section === "Billing" ? "Invoice" : section === "Inspection" ? "Inspection report" : "Application summary",
    auditLevel: row.Required?.toLowerCase() === "true" || section === "Internal review" ? "High" : "Standard",
    sourceLink: "Agency SOP"
  };
}

function fieldsFromHsTemplateFlatfile(text) {
  const parsed = detectDelimitedRows(text);
  const requiredHeaders = ["Type", "Required", "Label", "Field ID"];
  const missingHeaders = requiredHeaders.filter((header) => !parsed.headers.includes(header));
  if (missingHeaders.length) {
    return {
      fields: [],
      findings: [["HS flatfile not recognized", `Missing required column(s): ${missingHeaders.join(", ")}.`]]
    };
  }
  const skippedRows = [];
  const reviewRows = [];
  const fields = parsed.rows.flatMap((row, index) => {
    const type = row.Type?.trim() || "";
    if (!row.Label?.trim() && !row["Field ID"]?.trim()) {
      skippedRows.push(`Row ${index + 2}: blank field`);
      return [];
    }
    if (type.toLowerCase() === "spacer") {
      skippedRows.push(`${row.Label || row["Field ID"]}: layout spacer`);
      return [];
    }
    if (["information box", "reload - child fields", "embedded form search"].includes(type.toLowerCase())) {
      reviewRows.push(`${row.Label}: ${type}`);
    }
    return [fieldFromHsRow(row, index)];
  });
  const requiredCount = fields.filter((field) => field.required === "true").length;
  const optionCount = fields.filter((field) => field.options).length;
  return {
    fields,
    findings: [
      ["HS flatfile import", `Read ${parsed.rows.length} rows and proposed ${fields.length} configurable fields from ${parsed.delimiter === "\t" ? "tab-delimited" : "comma-delimited"} source data.`],
      ["Attributes preserved", `Imported labels, variable IDs, field types, required flags, option lists, groups, list-screen flags, show/hide rules, and config notes when present.`],
      ["Required and option fields", `${requiredCount} fields are marked required and ${optionCount} fields include option lists.`],
      ...(skippedRows.length ? [["Layout rows skipped", skippedRows.join("; ")]] : []),
      ...(reviewRows.length ? [["Admin review items", `${reviewRows.length} platform-specific fields were imported but should be checked: ${reviewRows.slice(0, 12).join("; ")}${reviewRows.length > 12 ? "..." : ""}`]] : []),
      ["Reliability boundary", "This is much more reliable than PDF extraction for fields included in the export, but it cannot infer attributes not present in the flatfile, such as exact page layout, external lookup behavior, legal rules, or advanced validation."]
    ]
  };
}

function isLikelySection(line) {
  const cleaned = line.trim();
  return cleaned.length > 3
    && cleaned.length < 48
    && !cleaned.includes("?")
    && !cleaned.includes(":")
    && /^[A-Z0-9 &/,-]+$/.test(cleaned);
}

function isLikelyQuestion(line) {
  const cleaned = line.trim();
  if (cleaned.length < 3) return false;
  if (/[?]/.test(cleaned)) return true;
  if (/[:：]\s*$/.test(cleaned)) return true;
  if (/_{2,}/.test(cleaned)) return true;
  if (/^[\s•\-*]*(\(?[0-9A-Za-z]{1,3}[\).:-])\s+/.test(cleaned)) return true;
  if (/[☐□○◯]/.test(cleaned)) return true;
  return /\b(name|address|phone|email|date|signature|permit|facility|owner|applicant|contact|type|category|description|upload|attach)\b/i.test(cleaned);
}

function splitPossibleQuestions(line) {
  return line
    .split(/\t+|\s{3,}|[|]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function looksGarbledText(text) {
  const visible = text.replace(/\s/g, "");
  if (visible.length < 12) return false;
  const oddChars = (visible.match(/[^\x20-\x7E]/g) || []).length;
  const replacementChars = (visible.match(/[�□\uFFFD]/g) || []).length;
  const symbolRuns = (visible.match(/[¥§¤¶◊�□]{2,}/g) || []).length;
  const asciiLetters = (visible.match(/[A-Za-z]/g) || []).length;
  return oddChars / visible.length > 0.18
    || replacementChars > 3
    || symbolRuns > 1
    || (visible.length > 40 && asciiLetters / visible.length < 0.28);
}

function normalizePdfText(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line && !looksGarbledText(line))
    .join("\n");
}

function fieldsFromExtractedText(text) {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[“”]/g, "\"")
    .replace(/[’]/g, "'")
    .replace(/[☐□○◯]/g, " checkbox ");
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^page\s+\d+/i.test(line));
  const fields = [];
  const reviewItems = [];
  let currentSection = "Application";

  lines.forEach((line) => {
    if (isLikelySection(line)) {
      currentSection = cleanExtractedLabel(line)
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
      return;
    }

    const parts = splitPossibleQuestions(line);
    const candidates = parts.length > 1 ? parts : [line];
    candidates.forEach((candidate) => {
      if (!isLikelyQuestion(candidate)) return;
      const label = cleanExtractedLabel(candidate);
      if (!label || label.length < 3) return;
      if (fields.some((field) => field.label.toLowerCase() === label.toLowerCase())) return;
      const section = inferSection(label, currentSection);
      const type = inferFieldType(label);
      fields.push(fieldFromAi([label, type, section, "Public and staff"], fields.length));
      if (candidate.length > 120 || /checkbox checkbox/i.test(candidate)) {
        reviewItems.push([label, "Complex line detected. Admin should confirm options, grouping, and conditional logic."]);
      }
    });
  });

  return { fields, lineCount: lines.length, reviewItems };
}

async function extractTextFromPdfBuffer(buffer) {
  const pdfjs = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.mjs";
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pageTexts = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = [];
    let currentY = null;
    let currentLine = [];
    content.items.forEach((item) => {
      const y = Math.round(item.transform?.[5] || 0);
      if (currentY !== null && Math.abs(y - currentY) > 3) {
        lines.push(currentLine.join(" ").trim());
        currentLine = [];
      }
      currentY = y;
      if (item.str?.trim()) currentLine.push(item.str.trim());
    });
    if (currentLine.length) lines.push(currentLine.join(" ").trim());
    pageTexts.push(lines.join("\n"));
  }
  return normalizePdfText(pageTexts.join("\n"));
}

async function readUploadedFormText() {
  const file = aiSourceFile.files?.[0];
  if (!file) return { text: "", source: "instructions", warning: "No file uploaded." };
  const extension = file.name.split(".").pop().toLowerCase();
  if (["txt", "csv", "tsv"].includes(extension)) {
    return { text: await file.text(), source: file.name, warning: "" };
  }
  if (extension === "pdf") {
    let text = "";
    try {
      text = await extractTextFromPdfBuffer(await file.arrayBuffer());
    } catch (error) {
      return {
        text: "",
        source: file.name,
        warning: "PDF text extraction failed in the browser. This file likely needs OCR or server-side document processing before fields can be identified reliably."
      };
    }
    const garbled = looksGarbledText(text);
    const cleanText = garbled ? "" : text;
    return {
      text: cleanText,
      source: file.name,
      warning: cleanText.trim()
        ? "PDF text layer extracted with PDF.js. Admin should compare against the original form."
        : "This PDF did not expose clean readable form text. OCR or server-side extraction is required before all questions can be captured."
    };
  }
  return {
    text: "",
    source: file.name,
    warning: `${extension.toUpperCase()} extraction is not available in this browser-only prototype yet. Paste the form text into Admin instructions or use a text/PDF file with a readable text layer.`
  };
}

async function generateDraftFields() {
  if (state.activeAiMode === "agency") {
    const template = agencyTemplateLibrary[agencyTemplateSelect.value];
    return {
      fields: template.fields.map(fieldFromAi),
      source: template.title,
      findings: []
    };
  }

  const uploaded = ["scan", "hs-template"].includes(state.activeAiMode) ? await readUploadedFormText() : { text: "", source: "instructions", warning: "" };
  const sourceText = `${uploaded.text}\n${aiInstructions.value || ""}`.trim();
  if (state.activeAiMode === "hs-template" || isHsTemplateFlatfile(sourceText)) {
    const hsDraft = fieldsFromHsTemplateFlatfile(sourceText);
    const hsWarnings = uploaded.warning && !(uploaded.warning === "No file uploaded." && aiInstructions.value.trim())
      ? [["Extraction warning", uploaded.warning]]
      : [];
    if (hsDraft.fields.length) {
      return {
        fields: hsDraft.fields,
        source: uploaded.text.trim() ? uploaded.source : "HS flatfile text",
        findings: [
          ...hsWarnings,
          ...hsDraft.findings
        ]
      };
    }
    return {
      fields: [],
      source: uploaded.text.trim() ? uploaded.source : "HS flatfile text",
      findings: [
        ...hsWarnings,
        ...hsDraft.findings,
        ["No fields created", "Upload or paste a HealthSpace field export with Type, Required, Label, and Field ID columns."]
      ]
    };
  }
  const extracted = fieldsFromExtractedText(sourceText);

  if (extracted.fields.length) {
    return {
      fields: extracted.fields,
      source: uploaded.source,
      findings: [
        ["Full extraction pass", `Scanned ${extracted.lineCount} text lines and proposed ${extracted.fields.length} fields. No artificial field limit was applied.`],
        ...(uploaded.warning ? [["Extraction warning", uploaded.warning]] : []),
        ...extracted.reviewItems
      ]
    };
  }

  const base = [
    ["Applicant legal name", "Text", "Application", "Public and staff"],
    ["Facility address", "Address", "Application", "Public and staff"],
    ["Permit type", "Select", "Permit", "Staff only"],
    ["Document upload", "Document upload", "Application", "Public and staff"],
    ["Owner signature", "Signature", "Application", "Public and staff"],
    ["Internal review notes", "Long text", "Internal review", "Staff only"]
  ];
  const text = aiInstructions.value.toLowerCase();
  if (text.includes("pool")) {
    base.splice(3, 0, ["Pool type", "Select", "Permit", "Public and staff"], ["Certified operator", "Text", "Permit", "Public and staff"]);
  }
  if (text.includes("grease")) {
    base.splice(4, 0, ["Grease trap service date", "Date", "Application", "Public and staff"]);
  }
  if (text.includes("floor plan")) {
    base.splice(4, 0, ["Floor plan upload", "Document upload", "Application", "Public and staff"]);
  }
  return {
    fields: base.map(fieldFromAi),
    source: uploaded.source,
    findings: [
      ["Extraction review required", "No readable form questions were detected. The draft uses a starter scaffold and should not be treated as a complete extraction."],
      ...(uploaded.warning ? [["Extraction warning", uploaded.warning]] : [])
    ]
  };
}

function renderAiDraft() {
  if (!state.aiDraft) {
    aiDraftStatus.textContent = "waiting";
    aiDraftStatus.className = "pill";
    sendAiDraftToBuilder.disabled = true;
    aiDraftSummary.className = "ai-draft-empty";
    aiDraftSummary.innerHTML = `
      <strong>No draft generated yet</strong>
      <p>Choose a mode, add instructions, and generate a draft. Nothing becomes live until an admin sends it to the builder and approves it.</p>
    `;
    return;
  }
  aiDraftStatus.textContent = state.aiDraft.sent ? "sent to builder" : "draft ready";
  aiDraftStatus.className = state.aiDraft.sent ? "pill good" : "pill warn";
  sendAiDraftToBuilder.disabled = Boolean(state.aiDraft.sent);
  aiDraftSummary.className = "ai-draft-card";
  aiDraftSummary.innerHTML = `
    <div>
      <span class="pill ${state.aiDraft.sent ? "good" : "warn"}">${state.aiDraft.sent ? "ready for field edits" : "needs admin review"}</span>
      <h3>${state.aiDraft.title}</h3>
      <p>${state.aiDraft.source}</p>
    </div>
    <div class="ai-draft-stats">
      <div><strong>${state.aiDraft.fields.length}</strong><span>fields proposed</span></div>
      <div><strong>${state.aiDraft.sections}</strong><span>sections detected</span></div>
      <div><strong>${state.aiDraft.staffOnly}</strong><span>staff-only fields</span></div>
    </div>
    <div class="ai-finding-list">
      ${state.aiDraft.findings.map((finding) => `
        <article class="ai-finding">
          <strong>${finding[0]}</strong>
          <p>${finding[1]}</p>
        </article>
      `).join("")}
    </div>
  `;
}

async function createAiDraft() {
  const partner = agencyTemplateLibrary[agencyTemplateSelect.value];
  if (state.activeAiMode !== "agency") {
    agencyTemplateSelect.value = "union-food";
  }
  const modeTitle = {
    scan: "AI draft from uploaded form",
    instructions: "AI draft from written instructions",
    agency: `AI draft from ${partner.agency}`,
    "hs-template": "AI draft from HS template"
  }[state.activeAiMode];
  generateAiDraft.disabled = true;
  generateAiDraft.textContent = "Reading form...";
  const draft = await generateDraftFields();
  const fields = draft.fields;
  generateAiDraft.disabled = false;
  generateAiDraft.textContent = "Generate draft";
  state.aiDraft = {
    title: state.activeAiMode === "agency" ? `${partner.title} localized draft` : modeTitle,
    source: state.activeAiMode === "agency"
      ? `Borrowed from ${partner.agency}. Assumption: shared rules/requirements; admin must localize labels, fees, and approval rules before use.`
      : `Generated from ${draft.source || aiSourceFile.files?.[0]?.name || "instructions"} plus admin prompt.`,
    fields,
    sections: new Set(fields.map((field) => field.section)).size,
    staffOnly: fields.filter((field) => field.visibility === "Staff only").length,
    findings: [
      ["Review required fields", "AI marked likely core fields as required or conditional. Admin should confirm local ordinance requirements."],
      ["No silent drop rule", "If extraction is uncertain, the item is flagged for review instead of being treated as complete."],
      ["Record mappings", "Fields are mapped to application, facility, permit, inspection, or complaint records for downstream workflow."],
      ["Neighbor agency localization", state.activeAiMode === "agency" ? "Borrowed forms should be compared against local fees, labels, and approval authority before publishing." : "No partner-agency template was used for this draft."],
      ...(draft.findings || [])
    ]
  };
  renderAiDraft();
}

function sendDraftToBuilder() {
  if (!state.aiDraft) return;
  const form = {
    id: `ai-draft-${Date.now()}`,
    title: state.aiDraft.title,
    source: state.aiDraft.source,
    status: "AI draft",
    description: "Generated by AI Assist; requires admin review before publishing.",
    fields: state.aiDraft.fields.map((field, index) => ({ ...field, id: `${field.id}-review-${index}` }))
  };
  state.forms.push(form);
  state.activeFormId = form.id;
  state.aiDraft.sent = true;
  markDirty();
  renderAiDraft();
  renderFormBuilder();
  setStudio("fields");
}

function setModalTab(tab) {
  state.activeModalTab = tab;
  modalTabs.forEach((button) => button.classList.toggle("active", button.dataset.modalTab === tab));
  modalPages.forEach((page) => page.classList.toggle("hidden", page.dataset.modalPage !== tab));
}

function openFieldModal(fieldId = null) {
  state.editingFieldId = fieldId;
  const field = activeField();
  const defaults = {
    label: "",
    key: "",
    type: "Text",
    section: "Application",
    helpText: "",
    visibility: "Public and staff",
    editRole: "Agency admin",
    required: "false",
    defaultValue: "",
    conditionalRule: "",
    min: "",
    max: "",
    pattern: "",
    unique: "false",
    options: "",
    width: "Full",
    position: "Normal",
    publicLabel: "",
    staffLabel: "",
    placeholder: "",
    recordMap: "Application",
    reportOutput: "Do not print",
    auditLevel: "Standard",
    sourceLink: "None"
  };
  const values = { ...defaults, ...field };
  Object.entries(values).forEach(([key, value]) => {
    const control = fieldModalForm.elements.namedItem(key);
    if (control) control.value = value ?? "";
  });
  fieldModalTitle.textContent = field ? `Edit ${field.label}` : "Add field";
  deleteFieldButton.classList.toggle("hidden", !field);
  setModalTab("general");
  fieldModal.classList.remove("hidden");
}

function closeModal() {
  fieldModal.classList.add("hidden");
  state.editingFieldId = null;
}

function formValuesToField() {
  const data = new FormData(fieldModalForm);
  const label = (data.get("label") || "New field").trim();
  const section = data.get("section") || "Application";
  return {
    id: state.editingFieldId || `${slugify(label)}-${Date.now()}`,
    label,
    key: (data.get("key") || keyify(label, section)).trim(),
    type: data.get("type"),
    section,
    helpText: data.get("helpText"),
    visibility: data.get("visibility"),
    editRole: data.get("editRole"),
    required: data.get("required"),
    defaultValue: data.get("defaultValue"),
    conditionalRule: data.get("conditionalRule"),
    min: data.get("min"),
    max: data.get("max"),
    pattern: data.get("pattern"),
    unique: data.get("unique"),
    options: data.get("options"),
    width: data.get("width"),
    position: data.get("position"),
    publicLabel: data.get("publicLabel"),
    staffLabel: data.get("staffLabel"),
    placeholder: data.get("placeholder"),
    recordMap: data.get("recordMap"),
    reportOutput: data.get("reportOutput"),
    auditLevel: data.get("auditLevel"),
    sourceLink: data.get("sourceLink")
  };
}

function saveField(event) {
  event.preventDefault();
  const form = activeForm();
  const field = formValuesToField();
  const existingIndex = form.fields.findIndex((item) => item.id === state.editingFieldId);
  if (existingIndex >= 0) {
    form.fields[existingIndex] = field;
  } else {
    form.fields.push(field);
  }
  form.status = form.status === "published" ? "admin draft" : form.status;
  markDirty();
  closeModal();
  renderFormBuilder();
}

function duplicateField(fieldId) {
  const form = activeForm();
  const field = form.fields.find((item) => item.id === fieldId);
  if (!field) return;
  form.fields.push({
    ...field,
    id: `${field.id}-copy-${Date.now()}`,
    label: `${field.label} copy`,
    key: `${field.key || keyify(field.label, field.section)}_copy`
  });
  form.status = form.status === "published" ? "admin draft" : form.status;
  markDirty();
  renderFormBuilder();
}

function deleteField(fieldId = state.editingFieldId) {
  const form = activeForm();
  form.fields = form.fields.filter((field) => field.id !== fieldId);
  form.status = form.status === "published" ? "admin draft" : form.status;
  markDirty();
  closeModal();
  renderFormBuilder();
}

function groupedFields(form) {
  return form.fields.reduce((groups, field) => {
    const section = field.section || "General";
    if (!groups[section]) groups[section] = [];
    groups[section].push(field);
    return groups;
  }, {});
}

function inputForField(field) {
  const name = field.key || field.id;
  const required = field.required === "true" ? "required" : "";
  const placeholder = field.placeholder || field.helpText || "";
  if (field.type === "Long text") {
    return `<textarea name="${name}" rows="4" ${required} placeholder="${placeholder}"></textarea>`;
  }
  if (field.type === "Select" || field.type === "Multi-select") {
    const options = (field.options || "Option A\nOption B").split("\n").filter(Boolean);
    const multiple = field.type === "Multi-select" ? "multiple" : "";
    return `
      <select name="${name}" ${required} ${multiple}>
        <option value="">Choose</option>
        ${options.map((option) => `<option>${option}</option>`).join("")}
      </select>
    `;
  }
  if (field.type === "Checkbox") {
    return `<label class="inline-check"><input name="${name}" type="checkbox" value="Yes" /> Yes</label>`;
  }
  if (field.type === "Date") {
    return `<input name="${name}" type="date" ${required} />`;
  }
  if (field.type === "Number") {
    return `<input name="${name}" type="number" ${required} placeholder="${placeholder}" />`;
  }
  if (field.type === "Document upload") {
    return `<input name="${name}" type="file" ${required} />`;
  }
  if (field.type === "Signature") {
    return `<input name="${name}" type="text" ${required} placeholder="Typed signature for test submission" />`;
  }
  if (field.type === "Address") {
    return `<input name="${name}" type="text" ${required} placeholder="${placeholder || "Street, city, state, ZIP"}" />`;
  }
  return `<input name="${name}" type="text" ${required} placeholder="${placeholder}" />`;
}

function openFullFormPreview() {
  const form = activeForm();
  const groups = groupedFields(form);
  const preview = document.createElement("div");
  preview.className = "modal-backdrop";
  preview.id = "fullFormPreview";
  preview.innerHTML = `
    <section class="field-modal full-form-modal">
      <div class="modal-header">
        <div>
          <p class="eyebrow">Full form test</p>
          <h2>${form.title}</h2>
          <p>${form.fields.length} fields across ${Object.keys(groups).length} sections. This preview renders the entire configured schema.</p>
        </div>
        <button class="icon-button" type="button" data-close-preview aria-label="Close preview">x</button>
      </div>
      <form id="fullFormPreviewForm" class="full-form-preview">
        ${Object.entries(groups).map(([section, fields]) => `
          <section class="preview-section">
            <div class="preview-section-head">
              <h3>${section}</h3>
              <span class="pill">${fields.length} fields</span>
            </div>
            <div class="preview-field-grid">
              ${fields.map((field) => `
                <label class="preview-field ${field.width === "Full" ? "wide" : ""}">
                  <span>${field.publicLabel || field.label}${field.required === "true" ? " *" : ""}</span>
                  ${inputForField(field)}
                  <small>${field.helpText || field.visibility || ""}</small>
                </label>
              `).join("")}
            </div>
          </section>
        `).join("")}
        <div class="modal-actions">
          <button class="ghost-button" type="button" data-close-preview>Close</button>
          <button class="primary-button" type="submit">Save full test submission</button>
        </div>
      </form>
    </section>
  `;
  document.body.appendChild(preview);
  preview.querySelectorAll("[data-close-preview]").forEach((button) => {
    button.addEventListener("click", () => preview.remove());
  });
  preview.addEventListener("click", (event) => {
    if (event.target === preview) preview.remove();
  });
  preview.querySelector("#fullFormPreviewForm").addEventListener("submit", submitFullFormPreview);
}

async function submitFullFormPreview(event) {
  event.preventDefault();
  const form = activeForm();
  const data = new FormData(event.currentTarget);
  const answers = {};
  form.fields.forEach((field) => {
    const key = field.key || field.id;
    if (field.type === "Document upload") {
      const file = data.get(key);
      answers[key] = file?.name ? { fileName: file.name, localOnly: true } : null;
    } else if (field.type === "Checkbox") {
      answers[key] = data.get(key) || "No";
    } else if (field.type === "Multi-select") {
      answers[key] = data.getAll(key);
    } else {
      answers[key] = data.get(key) || "";
    }
  });
  const record = await window.AgencyDataStore.saveTestSubmission(form, answers, state.activeAgencyId);
  await refreshLocalSnapshotStatus();
  document.querySelector("#fullFormPreview")?.remove();
  updateDataStatus(`Saved full test submission ${record.id.slice(0, 18)}`, "good");
}

function renderWorkflow() {
  workflowBoard.innerHTML = workflows.map(([title, statuses]) => `
    <section class="workflow-lane">
      <h3>${title}</h3>
      <ul>
        ${statuses.map((status) => `<li>${status}</li>`).join("")}
      </ul>
    </section>
  `).join("");
}

function renderFees() {
  feeList.innerHTML = fees.map(([name, amount, rule]) => `
    <article class="fee-row">
      <div>
        <strong>${name}</strong>
        <p>${rule}</p>
      </div>
      <span class="fee-amount">${amount}</span>
      <span class="pill good">active</span>
    </article>
  `).join("");
}

function renderSetupList(target, rows) {
  target.innerHTML = rows.map(([name, text, status]) => `
    <article class="setup-row">
      <div>
        <strong>${name}</strong>
        <p>${text}</p>
      </div>
      <span class="pill ${status === "planned" || status === "draft" ? "warn" : "good"}">${status}</span>
      <button class="ghost-button" type="button">Configure</button>
    </article>
  `).join("");
}

function renderRoles() {
  roleList.innerHTML = roles.map(([name, text, scope]) => `
    <article class="role-row">
      <div>
        <strong>${name}</strong>
        <p>${text}</p>
      </div>
      <span class="pill">${scope}</span>
      <button class="ghost-button" type="button">Edit role</button>
    </article>
  `).join("");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

studioTabs.forEach((button) => {
  button.addEventListener("click", () => setStudio(button.dataset.studio));
});

aiModeButtons.forEach((button) => {
  button.addEventListener("click", () => setAiMode(button.dataset.aiMode));
});

aiSourceFile.addEventListener("change", () => {
  aiFileName.textContent = aiSourceFile.files?.[0]?.name || "Drop a form, scan, or worksheet";
});

generateAiDraft.addEventListener("click", createAiDraft);
sendAiDraftToBuilder.addEventListener("click", sendDraftToBuilder);
openAiAssistSource.addEventListener("click", () => setStudio("ai"));

modalTabs.forEach((button) => {
  button.addEventListener("click", () => setModalTab(button.dataset.modalTab));
});

fieldModalForm.addEventListener("submit", saveField);
closeFieldModal.addEventListener("click", closeModal);
cancelFieldButton.addEventListener("click", closeModal);
deleteFieldButton.addEventListener("click", () => deleteField());
fieldModal.addEventListener("click", (event) => {
  if (event.target === fieldModal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !fieldModal.classList.contains("hidden")) closeModal();
});

useTemplateForm.addEventListener("click", cloneTemplateForm);
createBlankForm.addEventListener("click", createBlankFormRecord);
newBlankForm.addEventListener("click", createBlankFormRecord);
addFieldButton.addEventListener("click", () => openFieldModal());
saveDraftButton.addEventListener("click", () => saveConfiguration());
publishFormButton.addEventListener("click", publishActiveForm);
resetLocalDataButton.addEventListener("click", async () => {
  if (!window.confirm(`Reset local test data for ${activeAgency().name} and return to the starter forms?`)) return;
  await window.AgencyDataStore.clearAgency(state.activeAgencyId);
  window.location.reload();
});
previewFormButton.addEventListener("click", openFullFormPreview);
agencySelector.addEventListener("change", () => switchAgencyEnvironment(agencySelector.value));
addAgencyButton.addEventListener("click", addAgencyEnvironment);

document.querySelector("#openInspectionModule").addEventListener("click", () => setView("inspections"));
document.querySelector("#configureAgency").addEventListener("click", () => setView("configuration"));

await loadPersistedState();
renderModules();
renderTimeline();
renderTemplates();
renderBlueprint();
renderFormBuilder();
renderWorkflow();
renderFees();
renderSetupList(inspectionSetupList, inspectionSetup);
renderSetupList(portalSetupList, portalSetup);
renderRoles();
renderAiDraft();
updateDataStatus();
setView("command");
setStudio("templates");
setAiMode("scan");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootAgencyOS);
} else {
  bootAgencyOS();
}
