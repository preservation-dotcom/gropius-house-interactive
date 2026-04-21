const source = window.GROPIUS_SOURCE;

const atlasData = source.atlasData;
const repairsData = source.repairs;
const latestImages = source.latestImages;
const pestData = source.pestData;

const state = {
  heroMode: "atlas",
  periodMode: "all",
  periodKey: "all",
  metric: "rh_mean",
  unitStyle: "full",
  visible: {
    interior: true,
    wall: true,
    outside: true,
  },
  selected: null,
  showAllLabels: false,
  repairFilter: "All categories",
  imageFilter: "All images",
  pestDate: Object.keys(pestData)[0],
};

const floorMap = {
  first: document.getElementById("firstFloor"),
  second: document.getElementById("secondFloor"),
  basement: document.getElementById("basementFloor"),
};

const planMap = {
  first: document.getElementById("firstPlan"),
  second: document.getElementById("secondPlan"),
  basement: document.getElementById("basementPlan"),
};

const metricSelect = document.getElementById("metricSelect");
const periodMode = document.getElementById("periodMode");
const periodSelect = document.getElementById("periodSelect");
const unitStyle = document.getElementById("unitStyle");

function getYearBounds() {
  const years = [];

  Object.values(atlasData.agg).forEach((dataset) => {
    Object.keys(dataset.year || {}).forEach((key) => years.push(Math.round(Number(key))));
  });

  return {
    firstYear: Math.min(...years),
    lastYear: Math.max(...years),
  };
}

function getArchiveCount() {
  return latestImages.length + Object.values(pestData).reduce((count, items) => count + items.length, 0);
}

function getPestBoardCount() {
  return Object.values(pestData).reduce((count, items) => count + items.length, 0);
}

function getRepairCategoryCount() {
  return new Set(repairsData.map((item) => item.feature)).size;
}

function getHeroModes() {
  const { firstYear, lastYear } = getYearBounds();
  const repairCategories = getRepairCategoryCount();
  const archiveCount = getArchiveCount();
  const pestBoards = getPestBoardCount();
  const exteriorImage = latestImages.find((item) => item.label === "Downspout / Base Condition") || latestImages.find((item) => item.group === "Exterior");
  const monitoringImage = latestImages.find((item) => item.group === "Monitoring");

  return [
    {
      id: "atlas",
      label: "Spatial Atlas",
      kicker: "Primary entry point",
      title: "Begin with location before interpreting performance.",
      body:
        "Use the mapped plans to move between rooms, wall cavities, and exterior points, then compare year and month views before drawing preservation conclusions.",
      badges: ["Floor-based reading", "Validated markers", "Year/month filters"],
      jumpLabel: "Open The Atlas",
      jumpTarget: "#atlas",
      feature: {
        kicker: "Mapped Plan View",
        title: "First-floor sensor context",
        text:
          "Start with the plan layer so the question remains spatial: where is the reading located, and what else is immediately adjacent to it?",
        note:
          "The atlas links recovered plans to interior, wall cavity, and exterior datasets so comparison starts with position rather than file names.",
        image: recoveredDrawingSources.first,
        fit: "contain",
      },
      context: {
        kicker: "Suggested reading sequence",
        title: "Locate -> Compare -> Interpret",
        body:
          "This mode is the best starting point when you need to separate a local condition from a broader building pattern.",
        steps: [
          {
            label: "Locate the point",
            text: "Start with the mapped room, cavity, or exterior position on the recovered plans.",
          },
          {
            label: "Compare over time",
            text: "Switch between all-data, yearly, and monthly views before attaching significance to a spike.",
          },
          {
            label: "Cross-reference later",
            text: "Move to repairs and image archives only after the location and time relationship are clear.",
          },
        ],
      },
      evidence: [
        {
          label: "Mapped Points",
          value: String(atlasData.markers.length),
          note: "Interior rooms, wall cavities, and exterior points are spatially verified in the current atlas.",
        },
        {
          label: "Monitoring Span",
          value: `${firstYear}-${lastYear}`,
          note: "Long-term coverage remains available through the atlas period controls.",
        },
        {
          label: "Primary Question",
          value: "Where is this reading situated?",
          note: "This is the strongest mode for distinguishing local behavior from systemic behavior.",
        },
        {
          label: "Best Next Step",
          value: "Select a mapped point",
          note: "Use a room or cavity marker, then compare the values across available temporal views.",
        },
      ],
    },
    {
      id: "repairs",
      label: "Repairs Timeline",
      kicker: "Intervention context",
      title: "Place present conditions against recorded interventions.",
      body:
        "Use the repairs layer to understand what the building has already undergone, which components were addressed, and where linked conservation documents provide additional context.",
      badges: ["Chronology", "Component filters", "Linked PDFs"],
      jumpLabel: "Open Repairs",
      jumpTarget: "#repairs",
      feature: {
        kicker: "Condition And Intervention",
        title: "Repair history as interpretive context",
        text:
          "The timeline is most useful when read against a material concern, room condition, or component already identified elsewhere in the site.",
        note:
          "Repair cards now open related conservation PDFs directly, making the timeline a working reference rather than a detached list.",
        image: exteriorImage?.src || recoveredDrawingSources.site,
        fit: "cover",
      },
      context: {
        kicker: "How to use this mode",
        title: "Read by feature, then by date",
        body:
          "This is not where diagnosis begins; it is where a current observation is checked against known interventions and documentary context.",
        steps: [
          {
            label: "Identify the component",
            text: "Filter first by doors, interiors, chimneys, stone walls, or garage/visitor center.",
          },
          {
            label: "Scan the chronology",
            text: "Read the sequence of interventions before assuming the present condition is new.",
          },
          {
            label: "Open the source PDF",
            text: "Use the linked documents when the brief timeline needs to be traced back to contract or conservation material.",
          },
        ],
      },
      evidence: [
        {
          label: "Recorded Entries",
          value: String(repairsData.length),
          note: "Repair events are retained as a chronological reference layer across the house and site.",
        },
        {
          label: "Feature Groups",
          value: String(repairCategories),
          note: "The timeline is grouped into recurring categories so a room concern can be matched to a material system.",
        },
        {
          label: "Primary Question",
          value: "What has already been done here?",
          note: "Use this mode to frame a condition, not to infer a cause by itself.",
        },
        {
          label: "Best Next Step",
          value: "Filter by component",
          note: "Start with the feature category closest to the current room, surface, or assembly under review.",
        },
      ],
    },
    {
      id: "archives",
      label: "Visual Archives",
      kicker: "Field imagery",
      title: "Compare inspection boards and field photographs in one pass.",
      body:
        "Use the archives when the question is visual: recent field photography, monitoring equipment views, and pest inspection boards can be reviewed without leaving the main research interface.",
      badges: ["Pest comparison", "Recent images", "Room-by-room review"],
      jumpLabel: "Open Archives",
      jumpTarget: "#archives",
      feature: {
        kicker: "Visual Record",
        title: "Inspection boards and field imagery",
        text:
          "This mode brings together the latest site images and the dated pest inspection boards so visual evidence can be compared by room and campaign.",
        note:
          "It works best after a room or material question has already been framed in the atlas or repairs timeline.",
        image: monitoringImage?.src || "images/img_021.webp",
        fit: "cover",
      },
      context: {
        kicker: "What this mode adds",
        title: "Visual corroboration for mapped and documentary evidence",
        body:
          "Use the archives to compare visible condition, monitoring setup, and inspection records after the research question is already defined.",
        steps: [
          {
            label: "Choose the image set",
            text: "Switch between the pest inspection date filters or the grouped recent-image filters depending on the question.",
          },
          {
            label: "Compare by room",
            text: "Look at whether the same room appears across inspection boards, monitoring imagery, and general field photographs.",
          },
          {
            label: "Return to the atlas",
            text: "Move back to the mapped reading once the visual evidence clarifies where to look more closely.",
          },
        ],
      },
      evidence: [
        {
          label: "Archive Cards",
          value: String(archiveCount),
          note: "Recent images and pest boards remain on the homepage as browseable evidence modules.",
        },
        {
          label: "Pest Boards",
          value: String(pestBoards),
          note: "Inspection boards remain grouped by date so room-to-room differences can still be compared.",
        },
        {
          label: "Recent Images",
          value: String(latestImages.length),
          note: "Interior, exterior, and monitoring photographs are preserved as supporting visual context.",
        },
        {
          label: "Best Next Step",
          value: "Review by image group",
          note: "Use filters to isolate exterior, interior, or monitoring images before returning to the relevant section below.",
        },
      ],
    },
  ];
}

const guideCards = [
  {
    label: "Reference Tool",
    title: "This interface organizes evidence before it makes claims.",
    body:
      "The atlas helps locate patterns, compare time periods, and collect supporting context. It does not identify a single cause or prescribe a repair on its own.",
  },
  {
    label: "Color Logic",
    title: "Marker color signals sensor category, not good or bad condition.",
    body:
      "Red marks interior long-term loggers, blue marks wall cavity loggers, and green marks exterior points. The purpose is comparison across systems.",
  },
  {
    label: "Reading Sequence",
    title: "Start with where, then ask when, then ask whether it is local or systemic.",
    body:
      "Use room, floor, cavity, and exterior comparisons before interpreting a spike as a material problem. The timing view matters as much as the point itself.",
  },
  {
    label: "Cross-Reference",
    title: "Pair the atlas with repairs, pest images, and field photography.",
    body:
      "Environmental readings become more legible when placed beside past interventions, inspection dates, and current site images rather than being read in isolation.",
  },
];

const recoveredDrawingSources = {
  first: "assets/gropius-first-floor-plan.png",
  second: "assets/gropius-second-floor-plan.png",
  basement: "assets/gropius-basement-floor-plan.png",
  site: "assets/gropius-site-plan.png",
};

const drawingCards = [
  {
    title: "First Floor Plan",
    text: "Updated first-floor plan used as the primary orientation layer for room, wall cavity, and exterior comparisons.",
    src: recoveredDrawingSources.first,
  },
  {
    title: "Second Floor Plan",
    text: "Updated second-floor plan used to read upper-level room relationships and logger context.",
    src: recoveredDrawingSources.second,
  },
  {
    title: "Basement Plan",
    text: "Updated basement reference used for basement logger position and service-space context.",
    src: recoveredDrawingSources.basement,
  },
  {
    title: "Site Plan / Plant List",
    text: "Updated landscape plan showing house siting, contours, and plant inventory around the property.",
    src: recoveredDrawingSources.site,
  },
];

const legacyGraphMeta = {
  coverage: [
    {
      label: "Full export window",
      value: "April 14, 2018 to April 14, 2026",
      note: "Multi-year comparison used in the earlier PG graph export for indoor room loggers across temperature and RH.",
    },
    {
      label: "Focused export window",
      value: "April 14, 2021 to April 14, 2026",
      note: "Recent-year comparison previously used to isolate shorter-term overlap and divergence among indoor logger series.",
    },
    {
      label: "Series structure",
      value: "7 temperature + 7 RH traces",
      note: "Each interior logger family appeared twice in the graph exports: once as temperature and once as relative humidity.",
    },
    {
      label: "Atlas accuracy note",
      value: "Spatial only where validated",
      note: "Study Office and Sewing Room remain reference-only here because recovered plan data did not include validated marker coordinates for them.",
    },
  ],
  series: [
    {
      status: "Mapped in atlas",
      room: "Basement",
      summary:
        "Use this as the basement interior comparison series carried forward from the earlier chart exports.",
      source: "Source reference: GRO-Basement-2374607",
    },
    {
      status: "Mapped in atlas",
      room: "Dressing Room",
      summary:
        "Use this as the second-floor dressing room series included in both the full and focused comparison windows.",
      source: "Source reference: GRO-DressingRoom-2374606",
    },
    {
      status: "Mapped in atlas",
      room: "Living Room",
      summary:
        "Use this as the main first-floor interior reference series; it remains spatially plotted in the current atlas.",
      source: "Source reference: GRO-LivingRoom-2374605",
    },
    {
      status: "Reference only",
      room: "Sewing Room",
      summary:
        "This series appears in the earlier chart exports but is not placed on the plan because its recovered location could not be verified.",
      source: "Source reference: GRO-SewingRoom-1076435",
    },
    {
      status: "Reference only",
      room: "Study Office",
      summary:
        "This room is retained as comparison context from the earlier exports, but its precise plan position was not confirmed in the recovered materials.",
      source: "Source reference: logger ID not confirmed in the recovered export naming",
    },
    {
      status: "Repeated campaign",
      room: "Living Room Chamber",
      summary:
        "Read this as two separate chamber monitoring campaigns rather than one continuous sensor record.",
      source: "Source references: logger IDs 1255433 and 20459088",
    },
  ],
  notes: [
    {
      label: "What changed",
      title: "The old graph screenshots are removed, but their date windows remain explicit.",
      body:
        "The atlas now carries the earlier chart coverage ranges directly so the viewer can still interpret what the long-range and focused exports represented without opening static screenshots.",
    },
    {
      label: "Why this is more accurate",
      title: "Only validated sensors are plotted on the plan.",
      body:
        "The current atlas keeps floor markers only for datasets whose plan positions were recovered with confidence. Legacy graph-only series are listed as reference inventory instead of being guessed onto the drawings.",
    },
    {
      label: "How to read it",
      title: "Use the atlas for location, then use the legacy inventory for comparison context.",
      body:
        "Start with the mapped room, wall cavity, and exterior positions. Then use the legacy graph series list to remember which indoor logger families were part of the former export comparisons.",
    },
  ],
};

const repairDocumentMap = {
  "Doors & Hardware": [
    {
      title: "Interior Features Catalogue",
      href: "assets/docs/gro-cmp-interior-features-catalogue.pdf",
      type: "PDF",
    },
    {
      title: "CMP Intro and Supporting Docs",
      href: "assets/docs/gro-cmp-aa-intro-and-supporting-documents.pdf",
      type: "PDF",
    },
  ],
  "Overall Interiors": [
    {
      title: "Interior Features Catalogue",
      href: "assets/docs/gro-cmp-interior-features-catalogue.pdf",
      type: "PDF",
    },
    {
      title: "CMP Intro and Supporting Docs",
      href: "assets/docs/gro-cmp-aa-intro-and-supporting-documents.pdf",
      type: "PDF",
    },
  ],
  "Stone Walls": [
    {
      title: "Landscape Features Catalogue",
      href: "assets/docs/gro-cmp-landscape-features-catalogue.pdf",
      type: "PDF",
    },
    {
      title: "Exterior Features Catalogue",
      href: "assets/docs/gro-cmp-exterior-features-catalogue.pdf",
      type: "PDF",
    },
  ],
  "Garage / Visitor Center": [
    {
      title: "Exterior Features Catalogue",
      href: "assets/docs/gro-cmp-exterior-features-catalogue.pdf",
      type: "PDF",
    },
    {
      title: "CMP Intro and Supporting Docs",
      href: "assets/docs/gro-cmp-aa-intro-and-supporting-documents.pdf",
      type: "PDF",
    },
  ],
  Chimneys: [
    {
      title: "Exterior Features Catalogue",
      href: "assets/docs/gro-cmp-exterior-features-catalogue.pdf",
      type: "PDF",
    },
    {
      title: "CMP Intro and Supporting Docs",
      href: "assets/docs/gro-cmp-aa-intro-and-supporting-documents.pdf",
      type: "PDF",
    },
  ],
};

function formatValue(metric, value, compact = false) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  const rounded = Number(value).toFixed(1);
  if (compact) {
    return rounded;
  }

  return metric.startsWith("temp") ? `${rounded} °F` : `${rounded} %`;
}

function metricLabel(metric) {
  const labels = {
    temp_mean: "Temperature mean",
    temp_max: "Temperature max",
    temp_min: "Temperature min",
    temp_std: "Temperature std dev",
    rh_mean: "Relative humidity mean",
    rh_max: "Relative humidity max",
    rh_min: "Relative humidity min",
    rh_std: "Relative humidity std dev",
  };

  return labels[metric] || metric;
}

function getRecord(datasetName) {
  if (state.periodMode === "all") {
    const overall = atlasData.overall[datasetName];
    if (!overall) {
      return null;
    }

    return {
      temp_mean: overall.temp.mean,
      temp_max: overall.temp.max,
      temp_min: overall.temp.min,
      temp_std: overall.temp.std,
      rh_mean: overall.rh.mean,
      rh_max: overall.rh.max,
      rh_min: overall.rh.min,
      rh_std: overall.rh.std,
    };
  }

  const bucket = atlasData.agg[datasetName]?.[state.periodMode];
  if (!bucket) {
    return null;
  }

  return bucket[state.periodKey] || null;
}

function formatOptionText(mode, key) {
  if (mode === "year") {
    return String(Math.round(Number(key)));
  }

  if (mode === "year_month") {
    const [year, month] = key.split("-");
    const monthName = atlasData.months[Number(month) - 1];
    return `${monthName} ${year}`;
  }

  return key;
}

function getPeriodOptions() {
  const keys = new Set();

  atlasData.markers.forEach((marker) => {
    const bucket = atlasData.agg[marker.dataset]?.[state.periodMode];
    if (!bucket) {
      return;
    }
    Object.keys(bucket).forEach((key) => keys.add(key));
  });

  const options = Array.from(keys);

  if (state.periodMode === "year") {
    options.sort((a, b) => Number(a) - Number(b));
  }

  if (state.periodMode === "month") {
    options.sort((a, b) => atlasData.months.indexOf(a) - atlasData.months.indexOf(b));
  }

  if (state.periodMode === "year_month") {
    options.sort();
  }

  return options;
}

function refreshPeriodSelect() {
  periodSelect.innerHTML = "";

  if (state.periodMode === "all") {
    const option = document.createElement("option");
    option.value = "all";
    option.textContent = "All data";
    periodSelect.appendChild(option);
    periodSelect.disabled = true;
    state.periodKey = "all";
    return;
  }

  const options = getPeriodOptions();
  periodSelect.disabled = false;

  options.forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = formatOptionText(state.periodMode, key);
    periodSelect.appendChild(option);
  });

  if (!options.includes(state.periodKey)) {
    state.periodKey = options[0];
  }

  periodSelect.value = state.periodKey;
}

function addKV(container, label, value) {
  const row = document.createElement("div");
  row.className = "kv";
  row.innerHTML = `<div>${label}</div><div><strong>${value}</strong></div>`;
  container.appendChild(row);
}

function updateChipStates() {
  document.getElementById("toggleInterior").classList.toggle("is-active", state.visible.interior);
  document.getElementById("toggleWall").classList.toggle("is-active", state.visible.wall);
  document.getElementById("toggleOutside").classList.toggle("is-active", state.visible.outside);
  document.getElementById("showAllBtn").classList.toggle("is-active", state.showAllLabels);
}

function updateDetail() {
  const title = document.getElementById("detailTitle");
  const subtitle = document.getElementById("detailSubtitle");
  const tempMain = document.getElementById("tempMain");
  const tempSub = document.getElementById("tempSub");
  const rhMain = document.getElementById("rhMain");
  const rhSub = document.getElementById("rhSub");
  const table = document.getElementById("detailTable");
  const note = document.getElementById("detailNote");

  const marker = atlasData.markers.find((entry) => entry.id === state.selected) || atlasData.markers[0];
  if (!state.selected) {
    state.selected = marker.id;
  }

  const record = getRecord(marker.dataset);
  const overall = atlasData.overall[marker.dataset];

  title.textContent = marker.name;
  subtitle.textContent =
    state.periodMode === "all"
      ? `All-data summary · ${marker.dataset}`
      : `${formatOptionText(state.periodMode, state.periodKey)} · ${marker.dataset}`;

  tempMain.textContent = record ? formatValue("temp_mean", record.temp_mean, false) : "—";
  tempSub.textContent = record
    ? `max ${formatValue("temp_max", record.temp_max, false)} · min ${formatValue("temp_min", record.temp_min, false)} · std ${formatValue("temp_std", record.temp_std, false)}`
    : "—";
  rhMain.textContent = record ? formatValue("rh_mean", record.rh_mean, false) : "—";
  rhSub.textContent = record
    ? `max ${formatValue("rh_max", record.rh_max, false)} · min ${formatValue("rh_min", record.rh_min, false)} · std ${formatValue("rh_std", record.rh_std, false)}`
    : "—";

  table.innerHTML = "";
  addKV(
    table,
    "Category",
    marker.category === "interior"
      ? "Interior logger"
      : marker.category === "wall"
        ? "Wall cavity logger"
        : "Exterior logger"
  );
  addKV(table, "Current map label", metricLabel(state.metric));
  addKV(table, "Displayed value", record ? formatValue(state.metric, record[state.metric], false) : "—");
  addKV(table, "Data source", marker.dataset);

  if (overall) {
    addKV(table, "All-data temp mean", formatValue("temp_mean", overall.temp.mean, false));
    addKV(table, "All-data RH mean", formatValue("rh_mean", overall.rh.mean, false));
  }

  note.textContent =
    marker.dataset === "Living Room"
      ? "The Living Room panel retains the uploaded 2022–2023 summer comparison so those two summers can be read directly against each other."
      : "This atlas is rebuilt as a spatial reading interface: compare room, wall cavity, exterior elevation, and time slice before drawing a preservation conclusion.";

  updateSummerCompare(marker.dataset === "Living Room");
  draw();
}

function updateSummerCompare(isLivingRoom) {
  const container = document.getElementById("summerCompare");
  container.innerHTML = "";

  ["2022", "2023"].forEach((year) => {
    const entry = atlasData.summer_compare[year];
    const card = document.createElement("div");
    card.className = "proof-card";
    card.innerHTML = `
      <span>${isLivingRoom ? `Living Room Summer ${year}` : `Summer ${year}`}</span>
      <strong>${formatValue("temp_mean", entry.temp.mean, false)} / ${formatValue("rh_mean", entry.rh.mean, false)}</strong>
    `;
    container.appendChild(card);
  });
}

function makeMarker(marker) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "marker";
  element.dataset.id = marker.id;
  element.dataset.category = marker.category;
  element.style.left = `${marker.x}%`;
  element.style.top = `${marker.y}%`;
  element.style.background = marker.color;
  element.style.color = marker.color;
  element.title = marker.name;

  const value = document.createElement("div");
  value.className = "val";
  element.appendChild(value);

  element.addEventListener("click", () => {
    state.selected = marker.id;
    updateDetail();
  });

  floorMap[marker.floor].appendChild(element);
}

function draw() {
  document.querySelectorAll(".marker").forEach((markerElement) => {
    const marker = atlasData.markers.find((entry) => entry.id === markerElement.dataset.id);
    const record = getRecord(marker.dataset);
    const isHidden = !state.visible[marker.category];

    markerElement.classList.toggle("hidden", isHidden);
    markerElement.classList.toggle("selected", state.selected === marker.id);
    markerElement.querySelector(".val").textContent = record
      ? formatValue(state.metric, record[state.metric], state.unitStyle === "compact")
      : "—";
    markerElement.querySelector(".val").style.display =
      state.showAllLabels || state.selected === marker.id ? "block" : "none";
  });

  updateChipStates();
}

function buildHeroStats() {
  const years = [];
  Object.values(atlasData.agg).forEach((dataset) => {
    Object.keys(dataset.year || {}).forEach((key) => years.push(Math.round(Number(key))));
  });

  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  const archiveCount =
    latestImages.length +
    Object.values(pestData).reduce((count, items) => count + items.length, 0);

  const stats = [
    { label: "Active year span", value: `${firstYear}–${lastYear}` },
    { label: "Mapped sensor points", value: String(atlasData.markers.length) },
    { label: "Recorded repairs", value: String(repairsData.length) },
    { label: "Archive cards", value: String(archiveCount) },
  ];

  const container = document.getElementById("heroStats");
  container.innerHTML = "";

  stats.forEach((stat) => {
    const card = document.createElement("article");
    card.className = "stat-card";
    const displayValue = String(stat.value).replace("â€“", "-");
    card.innerHTML = `<span>${stat.label}</span><strong>${displayValue}</strong>`;
    container.appendChild(card);
  });
}

function scrollToTarget(targetSelector) {
  const target = document.querySelector(targetSelector);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildHeroLanding() {
  const heroModes = getHeroModes();
  const lenses = document.getElementById("heroLenses");
  lenses.innerHTML = "";

  heroModes.forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hero-lens";
    button.textContent = mode.label;
    button.classList.toggle("is-active", state.heroMode === mode.id);
    button.addEventListener("click", () => {
      state.heroMode = mode.id;
      buildHeroLanding();
    });
    lenses.appendChild(button);
  });

  renderHeroLanding(heroModes);
  bindHeroStageMotion();
}

function renderHeroLanding(heroModes) {
  const mode = heroModes.find((item) => item.id === state.heroMode) || heroModes[0];
  const summary = document.getElementById("heroModeSummary");
  const actions = document.getElementById("heroActions");
  const stage = document.getElementById("heroStage");
  const feature = document.getElementById("heroFeatureCard");
  const context = document.getElementById("heroContextCard");
  const evidence = document.getElementById("heroEvidenceGrid");

  summary.innerHTML = `
    <p class="panel-kicker">${mode.kicker}</p>
    <h2>${mode.title}</h2>
    <p>${mode.body}</p>
    <div class="hero-badge-row">
      ${mode.badges.map((badge) => `<span class="hero-badge">${badge}</span>`).join("")}
    </div>
  `;

  actions.innerHTML = "";

  const primary = document.createElement("button");
  primary.type = "button";
  primary.className = "primary-button";
  primary.textContent = mode.jumpLabel;
  primary.addEventListener("click", () => scrollToTarget(mode.jumpTarget));

  const secondary = document.createElement("button");
  secondary.type = "button";
  secondary.className = "ghost-button";
  secondary.textContent = "Read The Method";
  secondary.addEventListener("click", () => scrollToTarget("#logic"));

  actions.appendChild(primary);
  actions.appendChild(secondary);

  stage.dataset.mode = mode.id;

  feature.innerHTML = `
    <div class="hero-feature-copy">
      <p class="plan-card-topline">${mode.feature.kicker}</p>
      <h2>${mode.feature.title}</h2>
      <p>${mode.feature.text}</p>
    </div>
    <img
      src="${mode.feature.image}"
      alt="${mode.feature.title}"
      class="hero-feature-image"
      data-fit="${mode.feature.fit}"
      data-lightbox-src="${mode.feature.image}"
      data-lightbox-title="${mode.feature.title}"
    >
    <div class="plan-card-note">${mode.feature.note}</div>
  `;

  context.innerHTML = `
    <p class="panel-kicker">${mode.context.kicker}</p>
    <h3>${mode.context.title}</h3>
    <p>${mode.context.body}</p>
    <ul class="hero-context-list">
      ${mode.context.steps
        .map(
          (step) => `
            <li>
              <strong>${step.label}</strong>
              <span>${step.text}</span>
            </li>
          `
        )
        .join("")}
    </ul>
  `;

  evidence.innerHTML = "";
  mode.evidence.forEach((item) => {
    const card = document.createElement("article");
    card.className = "hero-evidence-card";
    card.innerHTML = `
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    `;
    evidence.appendChild(card);
  });
}

function bindHeroStageMotion() {
  const stage = document.getElementById("heroStage");

  if (!stage || stage.dataset.motionBound === "true") {
    return;
  }

  stage.dataset.motionBound = "true";

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    stage.style.setProperty("--pointer-x", `${x.toFixed(2)}%`);
    stage.style.setProperty("--pointer-y", `${y.toFixed(2)}%`);
  });

  stage.addEventListener("pointerleave", () => {
    stage.style.setProperty("--pointer-x", "72%");
    stage.style.setProperty("--pointer-y", "22%");
  });
}

function buildGuideCards() {
  const container = document.getElementById("guideGrid");
  container.innerHTML = "";

  guideCards.forEach((cardData) => {
    const card = document.createElement("article");
    card.className = "guide-card";
    card.innerHTML = `
      <p class="card-kicker">${cardData.label}</p>
      <h3>${cardData.title}</h3>
      <p>${cardData.body}</p>
    `;
    container.appendChild(card);
  });
}

function buildDrawingsGallery() {
  const container = document.getElementById("drawingsGallery");
  container.innerHTML = "";

  drawingCards.forEach((item) => {
    const card = document.createElement("article");
    card.className = "drawing-card";

    if (item.placeholder) {
      card.innerHTML = `
        <div class="drawing-placeholder">
          <div>
            <strong>${item.title}</strong>
            <div>${item.text}</div>
          </div>
        </div>
        <div class="card-copy">
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </div>
      `;
    } else {
      card.innerHTML = `
        <img src="${item.src}" alt="${item.title}" data-lightbox-src="${item.src}" data-lightbox-title="${item.title}">
        <div class="card-copy">
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </div>
      `;
    }

    container.appendChild(card);
  });
}

function buildGraphContext() {
  const coverage = document.getElementById("graphCoverageGrid");
  const series = document.getElementById("graphSeriesList");
  const notes = document.getElementById("graphNotesList");

  coverage.innerHTML = "";
  series.innerHTML = "";
  notes.innerHTML = "";

  legacyGraphMeta.coverage.forEach((item) => {
    const card = document.createElement("article");
    card.className = "graph-meta-tile";
    card.innerHTML = `
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    `;
    coverage.appendChild(card);
  });

  legacyGraphMeta.series.forEach((item) => {
    const card = document.createElement("article");
    card.className = "graph-series-item";
    card.innerHTML = `
      <span>${item.status}</span>
      <strong>${item.room}</strong>
      <p>${item.summary}</p>
      ${item.source ? `<div class="graph-source">${item.source}</div>` : ""}
    `;
    series.appendChild(card);
  });

  legacyGraphMeta.notes.forEach((item) => {
    const card = document.createElement("article");
    card.className = "graph-note";
    card.innerHTML = `
      <span>${item.label}</span>
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    `;
    notes.appendChild(card);
  });
}

function getRepairDocuments(item) {
  return repairDocumentMap[item.feature] || [];
}

function buildRepairFilters() {
  const categories = ["All categories", ...new Set(repairsData.map((item) => item.feature))];
  const container = document.getElementById("repairFilters");
  container.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-pill";
    button.textContent = category;
    button.classList.toggle("is-active", state.repairFilter === category);
    button.addEventListener("click", () => {
      state.repairFilter = category;
      buildRepairFilters();
      renderRepairs();
    });
    container.appendChild(button);
  });
}

function renderRepairs() {
  const container = document.getElementById("repairsList");
  container.innerHTML = "";

  const filtered = repairsData
    .filter((item) => state.repairFilter === "All categories" || item.feature === state.repairFilter)
    .sort((a, b) => Number(b.year) - Number(a.year));

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "repair-card";
    const documents = getRepairDocuments(item);
    const docsMarkup = documents.length
      ? `
        <div class="repair-docs">
          ${documents
            .map(
              (doc) => `
                <a class="doc-link" href="${doc.href}" target="_blank" rel="noreferrer">
                  <span>${doc.title}</span>
                  <small>${doc.type}</small>
                </a>
              `
            )
            .join("")}
        </div>
      `
      : "";

    card.innerHTML = `
      <div class="repair-meta">
        <span class="repair-year">${item.year}</span>
        <span class="repair-tag">${item.feature}</span>
      </div>
      <p>${item.text}</p>
      ${docsMarkup}
    `;
    container.appendChild(card);
  });
}

function buildPestFilters() {
  const container = document.getElementById("pestDateFilters");
  container.innerHTML = "";

  Object.keys(pestData).forEach((date) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-pill";
    button.textContent = date;
    button.classList.toggle("is-active", state.pestDate === date);
    button.addEventListener("click", () => {
      state.pestDate = date;
      buildPestFilters();
      renderPestGallery();
    });
    container.appendChild(button);
  });
}

function buildImageFilters() {
  const groups = ["All images", ...new Set(latestImages.map((item) => item.group))];
  const container = document.getElementById("imageFilters");
  container.innerHTML = "";

  groups.forEach((group) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-pill";
    button.textContent = group;
    button.classList.toggle("is-active", state.imageFilter === group);
    button.addEventListener("click", () => {
      state.imageFilter = group;
      buildImageFilters();
      renderLatestImages();
    });
    container.appendChild(button);
  });
}

function createImageCard({ label, note, src, kicker }) {
  const card = document.createElement("article");
  card.className = "image-card";

  const shell = document.createElement("div");
  shell.className = "image-shell";

  if (src) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = label;
    image.dataset.lightboxSrc = src;
    image.dataset.lightboxTitle = label;
    image.addEventListener("error", () => {
      image.classList.add("is-missing");
      fallback.hidden = false;
    });
    shell.appendChild(image);
  }

  const fallback = document.createElement("div");
  fallback.className = "missing-visual";
  fallback.hidden = Boolean(src);
  fallback.innerHTML = `
    <div>
      <strong>${label}</strong>
      <div>${note || "Image asset path is currently unavailable. The archive slot is preserved so the same image can be restored later."}</div>
    </div>
  `;
  shell.appendChild(fallback);

  const copy = document.createElement("div");
  copy.className = "card-copy";
  copy.innerHTML = `
    <p class="eyebrow">${kicker}</p>
    <h3>${label}</h3>
    <p>${note || "Image asset currently unavailable in this workspace; card structure retained for later restoration."}</p>
  `;

  card.appendChild(shell);
  card.appendChild(copy);
  return card;
}

function renderPestGallery() {
  const container = document.getElementById("pestGallery");
  container.innerHTML = "";

  (pestData[state.pestDate] || []).forEach((item) => {
    container.appendChild(
      createImageCard({
        label: item.label,
        note: `Inspection date ${state.pestDate}. This card preserves the room/date comparison slot from the original archive.`,
        src: item.src,
        kicker: "Inspection Board",
      })
    );
  });
}

function renderLatestImages() {
  const container = document.getElementById("imagesGallery");
  container.innerHTML = "";

  latestImages
    .filter((item) => state.imageFilter === "All images" || item.group === state.imageFilter)
    .forEach((item) => {
      container.appendChild(
        createImageCard({
          label: item.label,
          note: item.note,
          src: item.src,
          kicker: item.group,
        })
      );
    });
}

function bindControls() {
  metricSelect.addEventListener("change", (event) => {
    state.metric = event.target.value;
    updateDetail();
  });

  unitStyle.addEventListener("change", (event) => {
    state.unitStyle = event.target.value;
    draw();
  });

  periodMode.addEventListener("change", (event) => {
    state.periodMode = event.target.value;
    refreshPeriodSelect();
    updateDetail();
  });

  periodSelect.addEventListener("change", (event) => {
    state.periodKey = event.target.value;
    updateDetail();
  });

  document.getElementById("toggleInterior").addEventListener("click", () => {
    state.visible.interior = !state.visible.interior;
    draw();
  });

  document.getElementById("toggleWall").addEventListener("click", () => {
    state.visible.wall = !state.visible.wall;
    draw();
  });

  document.getElementById("toggleOutside").addEventListener("click", () => {
    state.visible.outside = !state.visible.outside;
    draw();
  });

  document.getElementById("showAllBtn").addEventListener("click", () => {
    state.showAllLabels = !state.showAllLabels;
    draw();
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    state.periodMode = "all";
    state.periodKey = "all";
    state.metric = "rh_mean";
    state.unitStyle = "full";
    state.visible = { interior: true, wall: true, outside: true };
    state.showAllLabels = false;

    metricSelect.value = "rh_mean";
    periodMode.value = "all";
    unitStyle.value = "full";
    refreshPeriodSelect();
    updateDetail();
  });

  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.scroll);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindLightbox() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightboxImage");
  const caption = document.getElementById("lightboxCaption");
  const close = document.getElementById("lightboxClose");

  function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    image.removeAttribute("src");
    image.alt = "";
    caption.textContent = "";
  }

  function openLightbox(src, title = "") {
    if (!src) {
      closeLightbox();
      return;
    }

    image.src = src;
    image.alt = title;
    caption.textContent = title;
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
  }

  closeLightbox();

  document.addEventListener("click", (event) => {
    if (event.target.closest("#lightbox")) {
      return;
    }

    const trigger = event.target.closest("[data-lightbox-src]");
    if (!trigger) {
      return;
    }

    openLightbox(trigger.dataset.lightboxSrc, trigger.dataset.lightboxTitle || "");
  });

  close.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeLightbox();
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  image.addEventListener("error", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

function bindReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function setFloorPlans() {
  planMap.first.src = recoveredDrawingSources.first;
  planMap.first.dataset.lightboxSrc = recoveredDrawingSources.first;
  planMap.first.dataset.lightboxTitle = "First Floor Plan";

  planMap.second.src = recoveredDrawingSources.second;
  planMap.second.dataset.lightboxSrc = recoveredDrawingSources.second;
  planMap.second.dataset.lightboxTitle = "Second Floor Plan";

  planMap.basement.src = recoveredDrawingSources.basement;
  planMap.basement.dataset.lightboxSrc = recoveredDrawingSources.basement;
  planMap.basement.dataset.lightboxTitle = "Basement Plan";
}

function initAtlas() {
  setFloorPlans();
  atlasData.markers.forEach(makeMarker);
  refreshPeriodSelect();
  updateDetail();
}

function init() {
  buildHeroStats();
  buildHeroLanding();
  buildGuideCards();
  buildDrawingsGallery();
  buildGraphContext();
  buildRepairFilters();
  renderRepairs();
  buildPestFilters();
  renderPestGallery();
  buildImageFilters();
  renderLatestImages();
  bindControls();
  bindLightbox();
  bindReveal();
  initAtlas();
}

init();
