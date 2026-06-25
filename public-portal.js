const PublicPortal = (() => {
  const agencies = {
    "mecklenburg-county-nc": "Mecklenburg County NC",
    "union-county-nc": "Union County NC",
    "wake-county-nc": "Wake County NC",
    "demo-agency": "Demo Agency"
  };
  const params = new URLSearchParams(window.location.search);
  const agencyId = params.get("agency") || "union-county-nc";
  const agencyName = agencies[agencyId] || agencyId.replace(/-/g, " ");
  const portalAgencyName = document.querySelector("#portalAgencyName");
  const publicFormChoices = document.querySelector("#publicFormChoices");
  const publicFormTitle = document.querySelector("#publicFormTitle");
  const publicFormMeta = document.querySelector("#publicFormMeta");
  const publicSubmissionForm = document.querySelector("#publicSubmissionForm");
  const portalDataStatus = document.querySelector("#portalDataStatus");
  let activeForm = null;

  const fallbackForms = [
    {
      id: "public-application",
      title: "New permit application",
      description: "Basic public intake until published agency forms are connected.",
      fields: [
        { label: "Applicant name", key: "public.applicant_name", type: "Text", required: "true" },
        { label: "Email", key: "public.email", type: "Email", required: "true" },
        { label: "Phone", key: "public.phone", type: "Phone", required: "false" },
        { label: "Facility name", key: "public.facility_name", type: "Text", required: "true" },
        { label: "Facility address", key: "public.facility_address", type: "Address lookup", required: "true" },
        { label: "Tell us what you are applying for", key: "public.description", type: "Long text", required: "true" }
      ]
    },
    {
      id: "public-complaint",
      title: "File a complaint",
      description: "Public complaint intake routed to agency staff.",
      recordType: "complaint",
      fields: [
        { label: "Complaint location or facility", key: "public.complaint_location", type: "Text", required: "true" },
        { label: "Complaint details", key: "public.narrative", type: "Long text", required: "true" },
        { label: "Your name", key: "public.reporter_name", type: "Text", required: "false" },
        { label: "Email or phone", key: "public.reporter_contact", type: "Text", required: "false" }
      ]
    }
  ];

  function seedForms() {
    const seeds = window.AgencySeedFlatfiles?.[agencyId]?.forms || [];
    const publicSafe = seeds
      .filter((seed) => seed.id.includes("permit") || seed.id.includes("complaint"))
      .map((seed) => {
        const rows = parseSeedRows(seed.flatfile || "");
        const fields = rows
          .filter((row) => row.Type?.toLowerCase() !== "spacer")
          .filter((row) => !/assigned|internal|state id|county code|signature/i.test(`${row.Label} ${row["Field ID"]}`))
          .slice(0, seed.id.includes("complaint") ? 16 : 18)
          .map((row) => ({
            label: row.Label,
            key: `hs.${(row["Field ID"] || row.Label).replace(/[^A-Za-z0-9_]+/g, "_")}`,
            type: mapType(row.Type || "", row.Label || "", row.Options || ""),
            required: row.Required?.toLowerCase() === "true" ? "true" : "false",
            options: (row.Options || "").split(",").map((item) => item.replace(/\|.*$/, "").trim()).filter(Boolean).join("\n")
          }));
        return {
          id: seed.id,
          title: seed.title.replace("Union ", "").replace(" Manager", ""),
          description: seed.description,
          recordType: seed.id.includes("complaint") ? "complaint" : "application",
          fields
        };
      });
    return publicSafe.length ? publicSafe : fallbackForms;
  }

  function parseSeedRows(text) {
    const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter(Boolean);
    const headers = (lines.shift() || "").split("\t");
    return lines.map((line) => {
      const values = line.split("\t");
      return headers.reduce((row, header, index) => {
        row[header] = values[index] || "";
        return row;
      }, {});
    });
  }

  function mapType(type, label, options) {
    const source = `${type} ${label}`.toLowerCase();
    if (source.includes("email")) return "Email";
    if (source.includes("phone")) return "Phone";
    if (source.includes("date")) return "Date";
    if (source.includes("textarea")) return "Long text";
    if (source.includes("number")) return "Number";
    if (source.includes("address")) return "Address lookup";
    if (source.includes("drop down") || options) return "Select";
    return "Text";
  }

  function inputForField(field) {
    const required = field.required === "true" ? "required" : "";
    const name = field.key || field.label;
    if (field.type === "Long text") return `<textarea name="${name}" rows="4" ${required}></textarea>`;
    if (field.type === "Select") {
      const options = (field.options || "Yes\nNo").split("\n").filter(Boolean);
      return `<select name="${name}" ${required}><option value="">Choose</option>${options.map((option) => `<option>${option}</option>`).join("")}</select>`;
    }
    if (field.type === "Date") return `<input name="${name}" type="date" ${required} />`;
    if (field.type === "Number") return `<input name="${name}" type="number" ${required} />`;
    if (field.type === "Address lookup") return `<input name="${name}" type="search" ${required} placeholder="Start typing an address" />`;
    return `<input name="${name}" type="${field.type === "Email" ? "email" : "text"}" ${required} />`;
  }

  function renderChoices(forms) {
    publicFormChoices.innerHTML = forms.map((form) => `
      <button class="portal-card" type="button" data-public-form="${form.id}">
        <span class="pill ${form.recordType === "complaint" ? "warn" : "good"}">${form.recordType || "application"}</span>
        <strong>${form.title}</strong>
        <p>${form.description}</p>
      </button>
    `).join("");
    publicFormChoices.querySelectorAll("[data-public-form]").forEach((button) => {
      button.addEventListener("click", () => renderForm(forms.find((form) => form.id === button.dataset.publicForm)));
    });
  }

  function renderForm(form) {
    activeForm = form;
    publicFormTitle.textContent = form.title;
    publicFormMeta.textContent = `${form.fields.length} public fields`;
    publicSubmissionForm.innerHTML = `
      <div class="preview-field-grid">
        ${form.fields.map((field) => `
          <label class="preview-field ${field.type === "Long text" || field.type === "Address lookup" ? "wide" : ""}">
            <span>${field.label}${field.required === "true" ? " *" : ""}</span>
            ${inputForField(field)}
          </label>
        `).join("")}
      </div>
      <div class="modal-actions">
        <button class="primary-button" type="submit">Submit to agency</button>
      </div>
    `;
  }

  async function submit(event) {
    event.preventDefault();
    if (!activeForm) return;
    const data = new FormData(publicSubmissionForm);
    const answers = {};
    activeForm.fields.forEach((field) => {
      answers[field.key || field.label] = data.get(field.key || field.label) || "";
    });
    const record = await window.AgencyDataStore.saveTestSubmission(activeForm, answers, agencyId, {
      recordType: activeForm.recordType || "application",
      status: "public portal submission",
      portalSource: "public"
    });
    portalDataStatus.textContent = record.syncStatus === "synced" ? "submitted" : "saved offline";
    portalDataStatus.className = `pill ${record.syncStatus === "synced" ? "good" : "warn"}`;
    publicSubmissionForm.reset();
  }

  function init() {
    portalAgencyName.textContent = `${agencyName} public portal`;
    portalDataStatus.textContent = window.InspectAidSupabase?.enabled ? "Supabase ready" : "local/offline ready";
    portalDataStatus.className = `pill ${window.InspectAidSupabase?.enabled ? "good" : "warn"}`;
    const forms = seedForms();
    renderChoices(forms);
    renderForm(forms[0]);
    publicSubmissionForm.addEventListener("submit", submit);
  }

  return { init };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", PublicPortal.init);
} else {
  PublicPortal.init();
}
