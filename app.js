const emotions = [
  "\uBD84\uB178",
  "\uC2AC\uD514",
  "\uC218\uCE58\uC2EC",
  "\uC9C8\uD22C\uC2EC",
  "\uC5B5\uC6B8\uD568",
  "\uBB34\uB825\uAC10",
  "\uB450\uB824\uC6C0",
  "\uD53C\uB85C",
  "\uC678\uB85C\uC6C0",
  "\uD63C\uB780",
  "\uC778\uC815\uBC1B\uACE0 \uC2F6\uC740 \uB9C8\uC74C",
  "\uBE44\uAD50\uC2EC",
  "\uC0C1\uC2E4\uAC10",
];

const selfImages = [
  "\uB098\uB294 \uC9C4\uC2EC\uC774\uB2E4",
  "\uB098\uB294 \uC774\uB9CC\uD07C \uD588\uB2E4",
  "\uC774 \uC77C\uC740 \uC758\uBBF8 \uC788\uC5B4\uC57C \uD55C\uB2E4",
  "\uB098\uB294 \uC778\uC815\uBC1B\uC544\uC57C \uD55C\uB2E4",
  "\uB098\uB294 \uC9C8\uD22C\uD558\uBA74 \uC548 \uB418\uB294 \uC0AC\uB78C\uC774\uB2E4",
  "\uB098\uB294 \uC2E4\uD328\uD558\uBA74 \uC548 \uB41C\uB2E4",
  "\uB098\uB294 \uC88B\uC740 \uC0AC\uB78C\uC774\uC5B4\uC57C \uD55C\uB2E4",
  "\uB098\uB294 \uB4A4\uCC98\uC9C0\uBA74 \uC548 \uB41C\uB2E4",
  "\uB0B4 \uBC29\uC2DD\uC740 \uC633\uC544\uC57C \uD55C\uB2E4",
  "\uB098\uB294 \uB3C4\uC6C0\uC774 \uB418\uB294 \uC0AC\uB78C\uC774\uC5B4\uC57C \uD55C\uB2E4",
];

const crisisSignals = [
  "\uC8FD\uACE0 \uC2F6\uB2E4",
  "\uC0AC\uB77C\uC9C0\uACE0 \uC2F6\uB2E4",
  "\uB098\uB97C \uD574\uCE58\uACE0 \uC2F6\uB2E4",
  "\uB204\uAD70\uAC00\uB97C \uD574\uCE58\uACE0 \uC2F6\uB2E4",
  "\uB354 \uC774\uC0C1 \uC0B4 \uC218 \uC5C6\uB2E4",
  "\uC790\uD574\uD558\uACE0 \uC2F6\uB2E4",
];

const state = {
  step: 0,
  emotions: new Map(),
  selfImages: new Set(),
};

const form = document.querySelector("#mindForm");
const steps = [...document.querySelectorAll(".step")];
const railItems = [...document.querySelectorAll(".rail-item")];
const stepIndex = document.querySelector("#stepIndex");
const backBtn = document.querySelector("#backBtn");
const nextBtn = document.querySelector("#nextBtn");
const buildBtn = document.querySelector("#buildBtn");
const aiBtn = document.querySelector("#aiBtn");
const pdfBtn = document.querySelector("#pdfBtn");
const saveBtn = document.querySelector("#saveBtn");
const mapOutput = document.querySelector("#mapOutput");
const crisisNotice = document.querySelector("#crisisNotice");
const aiReflectionPanel = document.querySelector("#aiReflectionPanel");
const aiReflectionState = document.querySelector("#aiReflectionState");
const aiReflectionOutput = document.querySelector("#aiReflectionOutput");
const savedList = document.querySelector("#savedList");

function setupChoices() {
  const emotionGrid = document.querySelector("#emotionGrid");
  emotionGrid.innerHTML = emotions.map((emotion) => emotionTemplate(emotion)).join("");

  const selfImageGrid = document.querySelector("#selfImageGrid");
  selfImageGrid.innerHTML = selfImages.map((item) => selfImageTemplate(item)).join("");
}

function emotionTemplate(emotion) {
  const buttons = [1, 2, 3, 4, 5]
    .map((level) => `<button type="button" data-intensity="${level}" aria-label="${emotion} \uAC15\uB3C4 ${level}">${level}</button>`)
    .join("");

  return `
    <article class="emotion-card" data-emotion="${emotion}">
      <button type="button" class="emotion-top" data-toggle-emotion="${emotion}">
        <span class="emotion-name">${emotion}</span>
        <span class="toggle-dot" aria-hidden="true"></span>
      </button>
      <div class="intensity-row">${buttons}</div>
    </article>
  `;
}

function selfImageTemplate(item) {
  return `
    <article class="choice-card" data-self-image="${item}">
      <button type="button" class="choice-top" data-toggle-self-image="${item}">
        <span class="choice-name">${item}</span>
        <span class="toggle-dot" aria-hidden="true"></span>
      </button>
    </article>
  `;
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const emotionToggle = event.target.closest("[data-toggle-emotion]");
    const intensityButton = event.target.closest("[data-intensity]");
    const selfImageToggle = event.target.closest("[data-toggle-self-image]");
    const railJump = event.target.closest("[data-step-jump]");

    if (emotionToggle) toggleEmotion(emotionToggle.dataset.toggleEmotion);
    if (intensityButton) setEmotionIntensity(intensityButton);
    if (selfImageToggle) toggleSelfImage(selfImageToggle.dataset.toggleSelfImage);
    if (railJump) goToStep(Number(railJump.dataset.stepJump));
  });

  backBtn.addEventListener("click", () => goToStep(Math.max(0, state.step - 1)));
  nextBtn.addEventListener("click", handleNext);
  buildBtn.addEventListener("click", buildMap);
  aiBtn.addEventListener("click", requestAIReflection);
  pdfBtn.addEventListener("click", downloadPdf);
  saveBtn.addEventListener("click", saveAwareness);
  form.addEventListener("input", () => {
    if (state.step === 6) buildMap();
  });
}

function toggleEmotion(emotion) {
  if (state.emotions.has(emotion)) {
    state.emotions.delete(emotion);
  } else {
    state.emotions.set(emotion, 3);
  }
  renderSelections();
}

function setEmotionIntensity(button) {
  const card = button.closest("[data-emotion]");
  const emotion = card.dataset.emotion;
  state.emotions.set(emotion, Number(button.dataset.intensity));
  renderSelections();
}

function toggleSelfImage(item) {
  if (state.selfImages.has(item)) {
    state.selfImages.delete(item);
  } else {
    state.selfImages.add(item);
  }
  renderSelections();
}

function renderSelections() {
  document.querySelectorAll("[data-emotion]").forEach((card) => {
    const emotion = card.dataset.emotion;
    const selected = state.emotions.has(emotion);
    card.classList.toggle("selected", selected);
    card.querySelectorAll("[data-intensity]").forEach((button) => {
      button.classList.toggle("active", selected && Number(button.dataset.intensity) <= state.emotions.get(emotion));
    });
  });

  document.querySelectorAll("[data-self-image]").forEach((card) => {
    card.classList.toggle("selected", state.selfImages.has(card.dataset.selfImage));
  });
}

function goToStep(step) {
  state.step = step;
  steps.forEach((item, index) => item.classList.toggle("active", index === step));
  railItems.forEach((item, index) => item.classList.toggle("active", index === step));
  stepIndex.textContent = String(step + 1);
  backBtn.disabled = step === 0;
  nextBtn.textContent = step === steps.length - 1 ? "\uCC98\uC74C\uC73C\uB85C" : "\uB2E4\uC74C";
  saveBtn.classList.toggle("hidden", step !== 7);
  buildBtn.classList.toggle("hidden", step < 6);
  aiBtn.classList.toggle("hidden", step !== 6);
  pdfBtn.classList.toggle("hidden", step !== 6);

  if (step === 6) buildMap();
  if (step === 7) seedAwareness();
}

function handleNext() {
  if (state.step === steps.length - 1) {
    goToStep(0);
    return;
  }

  if (state.step === 5) buildMap();
  if (state.step === 6) seedAwareness();
  goToStep(Math.min(steps.length - 1, state.step + 1));
}

function formData() {
  return Object.fromEntries(new FormData(form).entries());
}

function allText(data) {
  return [
    ...Object.values(data),
    ...[...state.emotions.keys()],
    ...[...state.selfImages],
  ].join(" ");
}

function hasCrisisSignal(data) {
  const text = allText(data).replace(/\s+/g, " ").toLowerCase();
  return crisisSignals.some((signal) => text.includes(signal.toLowerCase()));
}

function buildMap() {
  const data = formData();

  if (hasCrisisSignal(data)) {
    crisisNotice.classList.remove("hidden");
    crisisNotice.innerHTML = `
      \uC9C0\uAE08 \uC785\uB825\uC5D0\uB294 \uC704\uAE30 \uC2E0\uD638\uAC00 \uD3EC\uD568\uB418\uC5B4 \uC788\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC774 \uD654\uBA74\uC740 \uC758\uB8CC\u00B7\uC2EC\uB9AC\uCE58\uB8CC \uC11C\uBE44\uC2A4\uB97C
      \uB300\uC2E0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD63C\uC790 \uACAC\uB514\uAE30 \uC5B4\uB835\uB2E4\uBA74 \uC989\uC2DC \uC8FC\uBCC0\uC758 \uBBFF\uC744 \uC218 \uC788\uB294 \uC0AC\uB78C\uC5D0\uAC8C \uC54C\uB9AC\uACE0,
      \uC9C0\uC5ED \uC751\uAE09\uC2E4\uC774\uB098 \uC0C1\uB2F4\uC804\uD654, \uC804\uBB38\uAE30\uAD00\uC5D0 \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694. \uC9C0\uAE08\uC740 \uB9C8\uC74C\uC9C0\uB3C4\uB97C \uACC4\uC18D \uC791\uC131\uD558\uAE30\uBCF4\uB2E4
      \uC548\uC804\uC744 \uBA3C\uC800 \uD655\uBCF4\uD558\uB294 \uAC83\uC774 \uC911\uC694\uD569\uB2C8\uB2E4.
    `;
    mapOutput.innerHTML = "";
    aiReflectionPanel.classList.add("hidden");
    aiReflectionOutput.innerHTML = "";
    return;
  }

  crisisNotice.classList.add("hidden");
  crisisNotice.innerHTML = "";

  const map = createMindMap(data);
  state.latestMindMap = map;
  mapOutput.innerHTML = renderMap(map);
}

async function requestAIReflection() {
  buildMap();

  if (!state.latestMindMap || !crisisNotice.classList.contains("hidden")) {
    return;
  }

  aiReflectionPanel.classList.remove("hidden");
  aiReflectionState.textContent = "\uBC18\uC870 \uC911...";
  aiReflectionOutput.innerHTML = `<p>\uC785\uB825\uD55C \uAD00\uACC4\uB9DD\uC744 \uD568\uAED8 \uBE44\uCD94\uACE0 \uC788\uC2B5\uB2C8\uB2E4.</p>`;
  aiBtn.disabled = true;

  try {
    const response = await fetch("/api/indra-map", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        form: formData(),
        emotions: [...state.emotions.entries()].map(([emotion, intensity]) => ({ emotion, intensity })),
        self_images: [
          ...state.selfImages,
          ...(form.elements.custom_self_image.value.trim() ? [form.elements.custom_self_image.value.trim()] : []),
        ],
        local_map: state.latestMindMap,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "\uBC18\uC870\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    aiReflectionState.textContent = "\uC644\uB8CC";
    aiReflectionOutput.innerHTML = renderAIReflection(payload.reflection);
  } catch (error) {
    aiReflectionState.textContent = "\uD655\uC778 \uD544\uC694";
    aiReflectionOutput.innerHTML = `<p>${escapeHtml(error.message)}<br>Vercel \uD658\uACBD\uBCC0\uC218\uC5D0 OPENAI_API_KEY\uAC00 \uC124\uC815\uB418\uC5C8\uB294\uC9C0 \uD655\uC778\uD574 \uC8FC\uC138\uC694.</p>`;
  } finally {
    aiBtn.disabled = false;
  }
}

function downloadPdf() {
  buildMap();

  if (!crisisNotice.classList.contains("hidden")) {
    return;
  }

  document.body.classList.add("printing-map");
  window.print();
  window.setTimeout(() => {
    document.body.classList.remove("printing-map");
  }, 600);
}

function createMindMap(data) {
  const selectedEmotions = [...state.emotions.entries()].map(([emotion, intensity]) => ({ emotion, intensity }));
  const selectedSelfImages = [...state.selfImages];
  if (data.custom_self_image?.trim()) selectedSelfImages.push(data.custom_self_image.trim());

  const hiddenNeeds = inferNeeds(selectedEmotions, selectedSelfImages, data);
  const strongestEmotion = selectedEmotions.sort((a, b) => b.intensity - a.intensity)[0]?.emotion || "\uAC10\uC815";
  const event = data.event_description || "\uC544\uC9C1 \uC0AC\uAC74\uC774 \uCDA9\uBD84\uD788 \uC801\uD788\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.";

  return {
    event,
    emotions: selectedEmotions,
    time_axis: {
      past: data.past_memory || "\uC774 \uAC10\uC815\uC774 \uC624\uB798\uB41C \uAE30\uC5B5\uACFC \uC774\uC5B4\uC9C0\uB294\uC9C0\uB294 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
      present: data.strong_scene || data.first_thought || "\uC624\uB298\uC758 \uC7A5\uBA74\uACFC \uCCAB \uC0DD\uAC01\uC744 \uB354 \uC801\uC5B4\uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      future: data.future_fear || "\uBBF8\uB798\uC758 \uBD88\uC548\uC740 \uC544\uC9C1 \uB69C\uB837\uD558\uAC8C \uC801\uD788\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
    },
    space_axis: {
      place: data.place || "\uC7A5\uC18C\uAC00 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
      body: data.body_sensation || "\uBAB8 \uAC10\uAC01\uC774 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
      relationship_space: [data.people_present, data.role_context].filter(Boolean).join(" \uC548\uC5D0\uC11C ") || "\uB204\uAD6C \uC55E\uC5D0\uC11C \uC5B4\uB5A4 \uC704\uCE58\uC600\uB294\uC9C0 \uB354 \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    },
    relationship_axis: {
      self: data.my_interpretation || "\uB0B4\uAC00 \uBD99\uC778 \uD574\uC11D\uC740 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
      other: data.person_action || "\uC0C1\uB300\uC758 \uB9D0\uC774\uB098 \uD589\uB3D9\uC740 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
      work_or_issue: data.first_thought || "\uC774 \uC77C\uC774 \uAC74\uB4DC\uB9B0 \uD575\uC2EC \uC7C1\uC810\uC740 \uB354 \uC801\uC5B4\uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      structure: data.structural_limits || "\uAD6C\uC870\uC801 \uD55C\uACC4\uB294 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
      others_conditions: data.others_conditions || "\uC0C1\uB300\uC758 \uC870\uAC74\uC774\uB098 \uD55C\uACC4\uB294 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
    },
    self_images: selectedSelfImages,
    hidden_needs: hiddenNeeds,
    observer_reframe: `${strongestEmotion}\uC774 \uB098\uC758 \uBCF8\uC9C8\uC774\uB77C\uAE30\uBCF4\uB2E4, \uC0AC\uAC74\uACFC \uD574\uC11D, \uAD00\uACC4, \uBAB8\uC758 \uBC18\uC751, \uBD99\uC7A1\uACE0 \uC788\uB358 \uC0C1\uC774 \uB9CC\uB09C \uC790\uB9AC\uC5D0\uC11C \uC870\uAC74 \uB530\uB77C \uC77C\uC5B4\uB09C \uAC83\uC73C\uB85C \uBCF4\uC785\uB2C8\uB2E4.`,
    awareness_sentences: createAwarenessSentences(strongestEmotion, hiddenNeeds, selectedSelfImages),
  };
}

function inferNeeds(selectedEmotions, selectedSelfImages, data) {
  const emotionNames = selectedEmotions.map((item) => item.emotion);
  const needs = new Set();

  if (emotionNames.includes("\uC778\uC815\uBC1B\uACE0 \uC2F6\uC740 \uB9C8\uC74C") || emotionNames.includes("\uC218\uCE58\uC2EC") || selectedSelfImages.some((item) => item.includes("\uC778\uC815"))) {
    needs.add("\uC778\uC815\uBC1B\uACE0 \uC2F6\uC740 \uB9C8\uC74C");
  }
  if (emotionNames.includes("\uC9C8\uD22C\uC2EC") || emotionNames.includes("\uBE44\uAD50\uC2EC") || selectedSelfImages.some((item) => item.includes("\uB4A4\uCC98"))) {
    needs.add("\uBE44\uAD50 \uC18D\uC5D0\uC11C \uC791\uC544\uC9C0\uC9C0 \uC54A\uACE0 \uC2F6\uC740 \uB9C8\uC74C");
  }
  if (emotionNames.includes("\uB450\uB824\uC6C0") || selectedSelfImages.some((item) => item.includes("\uC2E4\uD328"))) {
    needs.add("\uC548\uC804\uD558\uAC8C \uC2E4\uD328\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uACE0 \uC2F6\uC740 \uB9C8\uC74C");
  }
  if (emotionNames.includes("\uBD84\uB178") || emotionNames.includes("\uC5B5\uC6B8\uD568")) {
    needs.add("\uB098\uC758 \uB178\uB825\uACFC \uACBD\uACC4\uB97C \uC874\uC911\uBC1B\uACE0 \uC2F6\uC740 \uB9C8\uC74C");
  }
  if (emotionNames.includes("\uC678\uB85C\uC6C0") || emotionNames.includes("\uC0C1\uC2E4\uAC10")) {
    needs.add("\uC5F0\uACB0\uAC10\uACFC \uC18C\uC18D\uAC10\uC744 \uD655\uC778\uD558\uACE0 \uC2F6\uC740 \uB9C8\uC74C");
  }
  if (emotionNames.includes("\uD53C\uB85C") || emotionNames.includes("\uBB34\uB825\uAC10")) {
    needs.add("\uC7A0\uC2DC \uBA48\uCD94\uACE0 \uD68C\uBCF5\uD560 \uC218 \uC788\uB294 \uC5EC\uBC31");
  }
  if (data.role_context || data.structural_limits) {
    needs.add("\uC5ED\uD560\uACFC \uCC45\uC784\uC758 \uBB34\uAC8C\uAC00 \uACF5\uC815\uD558\uAC8C \uB098\uB258\uAE38 \uBC14\uB77C\uB294 \uB9C8\uC74C");
  }

  if (needs.size === 0) needs.add("\uC544\uC9C1 \uC774\uB984 \uBD99\uC9C0 \uC54A\uC740 \uC695\uAD6C\uB97C \uCC9C\uCC9C\uD788 \uD655\uC778\uD558\uACE0 \uC2F6\uC740 \uB9C8\uC74C");
  return [...needs];
}

function createAwarenessSentences(strongestEmotion, hiddenNeeds, selectedSelfImages) {
  const sentences = [
    "\uC0C1\uCC98\uAC00 \uC77C\uC5B4\uB0A8\uC744 \uC54C\uC544\uCC28\uB9BC \uD569\uB2C8\uB2E4.",
    `${strongestEmotion}\uC774 \uC870\uAC74 \uB530\uB77C \uC77C\uC5B4\uB0AC\uC74C\uC744 \uC54C\uC544\uCC28\uB9BC \uD569\uB2C8\uB2E4.`,
  ];

  hiddenNeeds.slice(0, 2).forEach((need) => {
    sentences.push(`${need}\uC774 \uD568\uAED8 \uC788\uC5C8\uC74C\uC744 \uC54C\uC544\uCC28\uB9BC \uD569\uB2C8\uB2E4.`);
  });

  selectedSelfImages.slice(0, 2).forEach((image) => {
    sentences.push(`${image}\uB77C\uB294 \uC0C1\uC744 \uBD99\uC7A1\uACE0 \uC788\uC5C8\uC74C\uC744 \uC54C\uC544\uCC28\uB9BC \uD569\uB2C8\uB2E4.`);
  });

  sentences.push("\uC774 \uBAA8\uB4E0 \uB9C8\uC74C\uC774 \uC870\uAC74 \uB530\uB77C \uC77C\uC5B4\uB09C \uAC83\uC784\uC744 \uC54C\uC544\uCC28\uB9BC \uD569\uB2C8\uB2E4.");
  return sentences;
}

function renderMap(map) {
  const emotionsMarkup = map.emotions.length
    ? `<div class="bead-row">${map.emotions.map((item) => `<span class="bead">${item.emotion} ${item.intensity}</span>`).join("")}</div>`
    : "<p>\uC120\uD0DD\uB41C \uAC10\uC815 \uAD6C\uC2AC\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4.</p>";

  return `
    ${card("\uC0AC\uAC74", map.event, "wide")}
    ${card("\uAC10\uC815 \uAD6C\uC2AC", emotionsMarkup, "", true)}
    ${card("\uC2DC\uAC04\uCD95", lineMarkup([
      ["\uACFC\uAC70", map.time_axis.past],
      ["\uD604\uC7AC", map.time_axis.present],
      ["\uBBF8\uB798", map.time_axis.future],
    ]), "", true)}
    ${card("\uACF5\uAC04\uCD95", lineMarkup([
      ["\uC7A5\uC18C", map.space_axis.place],
      ["\uBAB8", map.space_axis.body],
      ["\uAD00\uACC4 \uACF5\uAC04", map.space_axis.relationship_space],
    ]), "", true)}
    ${card("\uAD00\uACC4\uCD95", lineMarkup([
      ["\uB098\uC758 \uD574\uC11D", map.relationship_axis.self],
      ["\uC0C1\uB300\uC758 \uB9D0/\uD589\uB3D9", map.relationship_axis.other],
      ["\uC0C1\uB300\uC758 \uC870\uAC74", map.relationship_axis.others_conditions],
      ["\uAD6C\uC870", map.relationship_axis.structure],
    ]), "", true)}
    ${card("\uBD99\uC7A1\uACE0 \uC788\uB358 \uC0C1", listMarkup(map.self_images), "", true)}
    ${card("\uC228\uC740 \uC695\uAD6C", listMarkup(map.hidden_needs), "", true)}
    ${card("\uAD00\uCC30\uC790 \uBB38\uC7A5", map.observer_reframe, "wide")}
    ${card("\uC624\uB298\uC758 \uC218\uD589\uBB38", listMarkup(map.awareness_sentences), "wide", true)}
  `;
}

function renderAIReflection(reflection) {
  if (!reflection) {
    return `<p>\uBC18\uC870 \uACB0\uACFC\uAC00 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.</p>`;
  }

  return `
    ${reflectionCard("\uC624\uB298\uC758 \uC778\uB4DC\uB77C\uB9DD \uC694\uC57D", reflection.indra_map_summary)}
    ${reflectionCard("\uC11C\uB85C \uBE44\uCD94\uB294 \uD575\uC2EC \uAD00\uACC4", listMarkup(reflection.key_relationships || []), true)}
    ${reflectionCard("\uBD99\uC7A1\uACE0 \uC788\uB358 \uC0C1\uC758 \uBC18\uC870", listMarkup(reflection.self_image_reflections || []), true)}
    ${reflectionCard("\uC228\uC740 \uC695\uAD6C", listMarkup(reflection.hidden_needs || []), true)}
    ${reflectionCard("\uAD00\uCC30\uC790 \uBB38\uC7A5", reflection.observer_reframe)}
    ${reflectionCard("\uC624\uB298\uC758 \uC54C\uC544\uCC28\uB9BC \uBB38\uC7A5", listMarkup(reflection.awareness_sentences || []), true)}
    ${reflectionCard("\uB354 \uBCFC \uC9C8\uBB38", listMarkup(reflection.next_questions || []), true)}
    ${reflection.safety_note ? reflectionCard("\uC548\uC804 \uC548\uB0B4", reflection.safety_note) : ""}
  `;
}

function reflectionCard(title, body, isHtml = false) {
  return `
    <article class="reflection-card">
      <h4>${title}</h4>
      ${isHtml ? body : `<p>${escapeHtml(body || "")}</p>`}
    </article>
  `;
}

function card(title, body, className = "", isHtml = false) {
  return `
    <article class="map-card ${className}">
      <h3>${title}</h3>
      ${isHtml ? body : `<p>${escapeHtml(body)}</p>`}
    </article>
  `;
}

function lineMarkup(lines) {
  return `<p>${lines.map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}`).join("<br>")}</p>`;
}

function listMarkup(items) {
  if (!items.length) return "<p>\uC544\uC9C1 \uC120\uD0DD\uB41C \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function seedAwareness() {
  const textarea = form.elements.saved_awareness;
  if (textarea.value.trim()) return;

  const data = formData();
  if (hasCrisisSignal(data)) return;

  const map = createMindMap(data);
  textarea.value = map.awareness_sentences.join("\n");
}

function saveAwareness() {
  const value = form.elements.saved_awareness.value.trim();
  if (!value) return;

  const saved = JSON.parse(localStorage.getItem("maeum-indra-awareness") || "[]");
  saved.unshift({
    text: value,
    date: new Date().toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }),
  });
  localStorage.setItem("maeum-indra-awareness", JSON.stringify(saved.slice(0, 20)));
  renderSaved();
}

function renderSaved() {
  const saved = JSON.parse(localStorage.getItem("maeum-indra-awareness") || "[]");
  savedList.innerHTML = saved.length
    ? saved.map((item) => `<div class="saved-item"><strong>${item.date}</strong><br>${escapeHtml(item.text).replace(/\n/g, "<br>")}</div>`).join("")
    : "<p>\uC544\uC9C1 \uC800\uC7A5\uB41C \uBB38\uC7A5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</p>";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

setupChoices();
bindEvents();
renderSelections();
renderSaved();
goToStep(0);
