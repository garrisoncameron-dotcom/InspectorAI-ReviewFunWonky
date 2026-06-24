const state = {
  activeView: "command",
  activeStudio: "templates",
  activeTemplate: "food-service",
  fields: [
    { label: "Legal business name", type: "Text", required: true, section: "Application" },
    { label: "Facility address", type: "Address", required: true, section: "Application" },
    { label: "Permit class", type: "Select", required: true, section: "Permit" },
    { label: "Risk category", type: "Select", required: true, section: "Inspection" },
    { label: "Annual permit fee", type: "Currency", required: true, section: "Billing" },
    { label: "Complaint source", type: "Select", required: false, section: "Complaints" }
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
const addFieldForm = document.querySelector("#addFieldForm");
const activeTemplateName = document.querySelector("#activeTemplateName");
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

function renderFields() {
  fieldList.innerHTML = state.fields.map((field, index) => `
    <article class="field-row">
      <label>
        Field label
        <input value="${field.label}" data-field="${index}" data-prop="label" />
      </label>
      <label>
        Type
        <select data-field="${index}" data-prop="type">
          ${["Text", "Address", "Select", "Currency", "Date", "Number", "Document", "Signature"].map((type) => `
            <option ${field.type === type ? "selected" : ""}>${type}</option>
          `).join("")}
        </select>
      </label>
      <label>
        Applies to
        <select data-field="${index}" data-prop="section">
          ${["Application", "Permit", "Billing", "Inspection", "Complaints"].map((section) => `
            <option ${field.section === section ? "selected" : ""}>${section}</option>
          `).join("")}
        </select>
      </label>
      <label>
        Required
        <select data-field="${index}" data-prop="required">
          <option value="true" ${field.required ? "selected" : ""}>Yes</option>
          <option value="false" ${!field.required ? "selected" : ""}>No</option>
        </select>
      </label>
    </article>
  `).join("");

  fieldList.querySelectorAll("[data-field]").forEach((control) => {
    control.addEventListener("change", () => {
      const field = state.fields[Number(control.dataset.field)];
      const prop = control.dataset.prop;
      field[prop] = prop === "required" ? control.value === "true" : control.value;
      renderFields();
    });
  });
}

addFieldForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(addFieldForm);
  state.fields.push({
    label: form.get("label").trim() || "New custom field",
    type: form.get("type"),
    required: form.get("required") === "true",
    section: form.get("section")
  });
  addFieldForm.reset();
  renderFields();
});

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

document.querySelector("#openInspectionModule").addEventListener("click", () => setView("inspections"));
document.querySelector("#configureAgency").addEventListener("click", () => setView("configuration"));

renderModules();
renderTimeline();
renderTemplates();
renderBlueprint();
renderFields();
renderWorkflow();
renderFees();
renderSetupList(inspectionSetupList, inspectionSetup);
renderSetupList(portalSetupList, portalSetup);
renderRoles();
setView("command");
setStudio("templates");
