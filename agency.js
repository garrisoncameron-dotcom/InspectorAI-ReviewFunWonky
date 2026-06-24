const state = {
  activeView: "command",
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
    text: "Public portal submissions, staff review, correction requests, approval, and conversion to permits."
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

const views = {
  command: document.querySelector("#view-command"),
  configuration: document.querySelector("#view-configuration"),
  inspections: document.querySelector("#view-inspections")
};

const navButtons = [...document.querySelectorAll(".nav-button")];
const moduleGrid = document.querySelector("#moduleGrid");
const timelineList = document.querySelector("#timelineList");
const templateList = document.querySelector("#templateList");
const fieldList = document.querySelector("#fieldList");
const addFieldForm = document.querySelector("#addFieldForm");
const activeTemplateName = document.querySelector("#activeTemplateName");

function setView(view) {
  state.activeView = view;
  Object.entries(views).forEach(([key, element]) => element.classList.toggle("hidden", key !== view));
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
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
    });
  });
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

navButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#openInspectionModule").addEventListener("click", () => setView("inspections"));
document.querySelector("#configureAgency").addEventListener("click", () => setView("configuration"));

renderModules();
renderTimeline();
renderTemplates();
renderFields();
setView("command");
