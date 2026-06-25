function bootAgencyOS() {
const state = {
  activeView: "command",
  activeStudio: "templates",
  activeTemplate: "food-service",
  activeFormId: "food-application",
  editingFieldId: null,
  activeModalTab: "general",
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
  renderFormBuilder();
  setStudio("fields");
}

function renderFormList() {
  formList.innerHTML = state.forms.map((form) => `
    <button class="form-card ${form.id === state.activeFormId ? "active" : ""}" type="button" data-form-id="${form.id}">
      <span class="pill ${form.status === "blank" ? "" : "good"}">${form.status}</span>
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
    <span class="pill ${form.status === "blank" ? "" : "good"}">${form.status}</span>
    <span class="pill">${form.fields.length} fields</span>
    <span class="pill">${form.source}</span>
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
  renderFormBuilder();
}

function deleteField(fieldId = state.editingFieldId) {
  const form = activeForm();
  form.fields = form.fields.filter((field) => field.id !== fieldId);
  closeModal();
  renderFormBuilder();
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
previewFormButton.addEventListener("click", () => {
  const form = activeForm();
  alert(`${form.title}\n${form.fields.length} configured fields\n\nPreview rendering comes next; this confirms the selected schema is ready.`);
});

document.querySelector("#openInspectionModule").addEventListener("click", () => setView("inspections"));
document.querySelector("#configureAgency").addEventListener("click", () => setView("configuration"));

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
setView("command");
setStudio("templates");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootAgencyOS);
} else {
  bootAgencyOS();
}
