const STORAGE_KEY = "inspectaid.reviewFunWonky.v1";

const defaults = [
  {
    id: "tone-check",
    title: "Friendly reviewer mode",
    status: "needs-review",
    severity: "general",
    summary: "Adds a lighter review voice while preserving citation discipline and inspector-facing clarity.",
    question: "Can the draft explanation be more approachable without weakening the inspection standard?",
    evidence: "Flag language that is technically correct but too stiff, unclear, or intimidating for field use.",
    citation: "InspectAid review pattern: trusted source + plain-language rewrite + approval history"
  },
  {
    id: "wonky-detector",
    title: "Wonky mapping detector",
    status: "needs-review",
    severity: "needs-review",
    summary: "Catches mapped labels that look plausible but do not belong on the selected report field.",
    question: "Does this mapped field match the inspection question, the evidence note, and the final report label?",
    evidence: "Compare selected dot label, form field, checklist item, and citation before approval.",
    citation: "Production reference: mapper labels, mapped rows, and final inspection package"
  },
  {
    id: "evidence-playback",
    title: "Evidence playback card",
    status: "approved",
    severity: "approved",
    summary: "Shows the short chain from source pack to reviewer note to final inspector-facing output.",
    question: "What should the inspector be able to replay before finalizing the package?",
    evidence: "Trusted source, reviewer note, supporting citation, and edited final copy should remain visible together.",
    citation: "Production reference: trusted sources, citation mapping, evidence capture"
  },
  {
    id: "extension-handoff",
    title: "Separate extension handoff",
    status: "approved",
    severity: "approved",
    summary: "Keeps this option deployable at its own URL while staying visually and conceptually tied to InspectAid.",
    question: "Can this option ship separately without confusing it with the production inspection workflow?",
    evidence: "Use separate GitHub Pages URL, clear lab labeling, and production-app linkback.",
    citation: "Deployment target: InspectorAI-ReviewFunWonky GitHub Pages project"
  }
];

let items = loadItems();
let selectedId = items[0]?.id;

const queue = document.querySelector("#reviewQueue");
const approvedCount = document.querySelector("#approvedCount");
const reviewCount = document.querySelector("#reviewCount");
const queueStatus = document.querySelector("#queueStatus");
const selectedTitle = document.querySelector("#selectedTitle");
const selectedSeverity = document.querySelector("#selectedSeverity");
const questionInput = document.querySelector("#questionInput");
const evidenceInput = document.querySelector("#evidenceInput");
const citationInput = document.querySelector("#citationInput");
const approveBtn = document.querySelector("#approveBtn");
const needsReviewBtn = document.querySelector("#needsReviewBtn");
const resetBtn = document.querySelector("#resetBtn");
const handoffSummary = document.querySelector("#handoffSummary");

function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaults;
  } catch {
    return defaults;
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function selectedItem() {
  return items.find((item) => item.id === selectedId) || items[0];
}

function statusLabel(status) {
  return status === "approved" ? "Approved" : "Needs review";
}

function severityClass(item) {
  if (item.status === "approved") return "approved";
  if (item.severity === "blocked") return "blocked";
  return "needs-review";
}

function renderQueue() {
  queue.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.className = "queue-item";
    button.type = "button";
    button.setAttribute("aria-selected", item.id === selectedId ? "true" : "false");
    button.innerHTML = `
      <div class="queue-title">
        <strong>${item.title}</strong>
        <span class="severity ${severityClass(item)}">${statusLabel(item.status)}</span>
      </div>
      <p>${item.summary}</p>
    `;
    button.addEventListener("click", () => {
      selectedId = item.id;
      render();
    });
    queue.appendChild(button);
  });
}

function renderSelected() {
  const item = selectedItem();
  selectedTitle.textContent = item.title;
  selectedSeverity.className = `severity ${severityClass(item)}`;
  selectedSeverity.textContent = statusLabel(item.status);
  questionInput.value = item.question;
  evidenceInput.value = item.evidence;
  citationInput.value = item.citation;
}

function renderCounts() {
  const approved = items.filter((item) => item.status === "approved").length;
  const needsReview = items.length - approved;
  approvedCount.textContent = approved;
  reviewCount.textContent = needsReview;
  queueStatus.textContent = needsReview ? `${needsReview} items need review` : "Ready for handoff";
}

function renderSummary() {
  const cards = [
    {
      title: "Deployment",
      text: "Static GitHub Pages package prepared for a separate InspectorAI-ReviewFunWonky URL."
    },
    {
      title: "Production Link",
      text: "Keeps InspectAid naming, colors, trusted-source framing, and mapped-review language intact."
    },
    {
      title: "Review State",
      text: `${items.filter((item) => item.status === "approved").length} approved, ${items.filter((item) => item.status !== "approved").length} still marked for review.`
    }
  ];
  handoffSummary.innerHTML = cards.map((card) => `
    <div class="handoff-card">
      <strong>${card.title}</strong>
      <p>${card.text}</p>
    </div>
  `).join("");
}

function updateSelected(changes) {
  items = items.map((item) => item.id === selectedId ? { ...item, ...changes } : item);
  saveItems();
  render();
}

questionInput.addEventListener("input", () => updateSelected({ question: questionInput.value }));
evidenceInput.addEventListener("input", () => updateSelected({ evidence: evidenceInput.value }));
citationInput.addEventListener("input", () => updateSelected({ citation: citationInput.value }));
approveBtn.addEventListener("click", () => updateSelected({ status: "approved", severity: "approved" }));
needsReviewBtn.addEventListener("click", () => updateSelected({ status: "needs-review", severity: "needs-review" }));
resetBtn.addEventListener("click", () => {
  items = structuredClone(defaults);
  selectedId = items[0].id;
  saveItems();
  render();
});

function render() {
  renderQueue();
  renderSelected();
  renderCounts();
  renderSummary();
}

render();
