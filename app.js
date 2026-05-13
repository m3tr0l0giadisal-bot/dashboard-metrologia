const rawRows = window.METROLOGIA_DATA.instrumentos || [];
const updatesStorageKey = "disal_metrologia_actualizaciones_vencimientos";

const fields = {
  sede: "Sede",
  codigo: "Codigo",
  codigoReal: "Código",
  tipo: "Tipo de instrumento",
  planta: "Planta / Edificio",
  linea: "Ubicación / Línea",
  estadoInstrumento: "Estado del instrumento",
  estadoCalibracion: "Estado de la calibración",
  fechaCalibracion: "Fecha de calibración",
  vencimiento: "Vencimiento de la calibración",
  dias: "Días para el vencimiento",
  categoria: "Categ.",
  responsable: "Responsable",
  marca: "Marca / Fabricante",
  serie: "N° de serie",
  riesgo: "RIESGO"
};

const colors = {
  CONFORME: "#16805d",
  "POR VENCER": "#c97916",
  VENCIDO: "#c43e3e",
  "-": "#777d83",
  "SIN DATO": "#777d83",
  CALIBRADO: "#16805d",
  "NO CALIBRADO": "#c43e3e",
  "FUERA DE SERV.": "#777d83"
};

const els = {
  filters: {
    sede: document.getElementById("filterSede"),
    planta: document.getElementById("filterPlanta"),
    linea: document.getElementById("filterLinea"),
    tipo: document.getElementById("filterTipo"),
    estadoInstrumento: document.getElementById("filterEstadoInstrumento"),
    estadoCalibracion: document.getElementById("filterEstadoCalibracion"),
    categoria: document.getElementById("filterCategoria")
  },
  search: document.getElementById("searchBox"),
  activeCount: document.getElementById("activeCount"),
  reset: document.getElementById("resetFilters"),
  export: document.getElementById("exportCsv"),
  table: document.getElementById("instrumentTable"),
  rowCount: document.getElementById("rowCount"),
  criticalCount: document.getElementById("criticalCount"),
  criticalList: document.getElementById("criticalList"),
  kpiTotal: document.getElementById("kpiTotal"),
  kpiConforme: document.getElementById("kpiConforme"),
  kpiPorVencer: document.getElementById("kpiPorVencer"),
  kpiVencido: document.getElementById("kpiVencido"),
  kpiFueraServicio: document.getElementById("kpiFueraServicio"),
  pctConforme: document.getElementById("pctConforme"),
  pctPorVencer: document.getElementById("pctPorVencer"),
  pctVencido: document.getElementById("pctVencido"),
  pctFueraServicio: document.getElementById("pctFueraServicio"),
  statusLegend: document.getElementById("statusLegend"),
  admin: {
    open: document.getElementById("openAdminDates"),
    modal: document.getElementById("adminDatesModal"),
    close: document.getElementById("closeAdminDates"),
    code: document.getElementById("adminCode"),
    codeList: document.getElementById("adminCodeList"),
    calDate: document.getElementById("adminCalDate"),
    dueDate: document.getElementById("adminDueDate"),
    calibrationStatus: document.getElementById("adminCalibrationStatus"),
    file: document.getElementById("bulkDateFile"),
    applyBulk: document.getElementById("applyBulkUpdate"),
    saveSingle: document.getElementById("saveSingleUpdate"),
    download: document.getElementById("downloadUpdatedData"),
    clear: document.getElementById("clearLocalUpdates"),
    status: document.getElementById("adminUpdateStatus")
  }
};

let localUpdates = loadLocalUpdates();
let rows = buildRows();

function value(row, key) {
  const val = row[key];
  return val && String(val).trim() ? String(val).trim() : "Sin dato";
}

function parseDays(text) {
  const match = String(text || "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function buildRows() {
  return rawRows.map((row) => {
    const code = normalizeCode(row[fields.codigoReal]);
    return prepareRow({
      ...row,
      ...(localUpdates[code] || {})
    });
  });
}

function prepareRow(row) {
  return {
    ...row,
    _diasNum: parseDays(row[fields.dias]),
    _search: [
      row[fields.codigoReal],
      row["Código viejo"],
      row[fields.sede],
      row[fields.tipo],
      row[fields.planta],
      row[fields.linea],
      row[fields.responsable],
      row[fields.marca],
      row[fields.serie],
      row[fields.estadoCalibracion]
    ].join(" ").toLowerCase()
  };
}

function normalizeCode(code) {
  const raw = String(code || "").trim();
  const digits = raw.replace(/\D/g, "");
  return digits ? digits.padStart(5, "0") : raw;
}

function loadLocalUpdates() {
  try {
    return JSON.parse(localStorage.getItem(updatesStorageKey) || "{}");
  } catch {
    return {};
  }
}

function saveLocalUpdates() {
  localStorage.setItem(updatesStorageKey, JSON.stringify(localUpdates));
}

function parseDateDMY(text) {
  const value = String(text || "").trim();
  const match = value.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (!match) return null;
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const month = Number(match[2]) - 1;
  const day = Number(match[1]);
  const date = new Date(year, month, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateDMY(date) {
  if (!date) return "";
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function inputDateToDMY(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return formatDateDMY(new Date(year, month - 1, day));
}

function dmyToInputDate(value) {
  const date = parseDateDMY(value);
  if (!date) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysUntil(dateText) {
  const date = parseDateDMY(dateText);
  if (!date) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((date - start) / 86400000);
}

function calibrationStatusFromDueDate(dueDateText) {
  const days = daysUntil(dueDateText);
  if (days === null) return "";
  if (days < 0) return "VENCIDO";
  if (days <= 30) return "POR VENCER";
  return "CONFORME";
}

function daysLabel(days) {
  if (days === null) return "";
  return `${days} días`;
}

function percent(part, total) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function groupCount(data, key) {
  return data.reduce((acc, row) => {
    const name = value(row, key).toUpperCase();
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
}

function sortedEntries(counts, limit = Infinity) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function getFilterState() {
  return {
    sede: els.filters.sede.value,
    planta: els.filters.planta.value,
    linea: els.filters.linea.value,
    tipo: els.filters.tipo.value,
    estadoInstrumento: els.filters.estadoInstrumento.value,
    estadoCalibracion: els.filters.estadoCalibracion.value,
    categoria: els.filters.categoria.value,
    search: els.search.value.trim().toLowerCase()
  };
}

function rowMatches(row, state) {
  const checks = [
    ["sede", fields.sede],
    ["planta", fields.planta],
    ["linea", fields.linea],
    ["tipo", fields.tipo],
    ["estadoInstrumento", fields.estadoInstrumento],
    ["estadoCalibracion", fields.estadoCalibracion],
    ["categoria", fields.categoria]
  ];
  return checks.every(([filterKey, fieldKey]) => !state[filterKey] || value(row, fieldKey) === state[filterKey])
    && (!state.search || row._search.includes(state.search));
}

function populateSelect(select, data, field, selected) {
  const options = [...new Set(data.map((row) => value(row, field)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));
  select.innerHTML = `<option value="">Todos</option>` + options.map((option) => {
    const safe = escapeHtml(option);
    return `<option value="${safe}" ${option === selected ? "selected" : ""}>${safe}</option>`;
  }).join("");
}

function refreshFilterOptions(state) {
  const map = [
    ["sede", fields.sede],
    ["planta", fields.planta],
    ["linea", fields.linea],
    ["tipo", fields.tipo],
    ["estadoInstrumento", fields.estadoInstrumento],
    ["estadoCalibracion", fields.estadoCalibracion],
    ["categoria", fields.categoria]
  ];

  map.forEach(([filterKey, fieldKey]) => {
    const scopedState = { ...state, [filterKey]: "" };
    const scopedRows = rows.filter((row) => rowMatches(row, scopedState));
    populateSelect(els.filters[filterKey], scopedRows, fieldKey, state[filterKey]);
  });
}

function renderKpis(data) {
  const total = data.length;
  const calibration = groupCount(data, fields.estadoCalibracion);
  const instrument = groupCount(data, fields.estadoInstrumento);
  const conforme = calibration.CONFORME || 0;
  const porVencer = calibration["POR VENCER"] || 0;
  const vencido = calibration.VENCIDO || 0;
  const fueraServicio = instrument["FUERA DE SERV."] || 0;

  els.kpiTotal.textContent = total.toLocaleString("es-AR");
  els.kpiConforme.textContent = conforme.toLocaleString("es-AR");
  els.kpiPorVencer.textContent = porVencer.toLocaleString("es-AR");
  els.kpiVencido.textContent = vencido.toLocaleString("es-AR");
  els.kpiFueraServicio.textContent = fueraServicio.toLocaleString("es-AR");
  els.pctConforme.textContent = percent(conforme, total);
  els.pctPorVencer.textContent = percent(porVencer, total);
  els.pctVencido.textContent = percent(vencido, total);
  els.pctFueraServicio.textContent = percent(fueraServicio, total);
}

function drawDonut(canvas, entries) {
  const ctx = canvas.getContext("2d");
  const size = Math.min(canvas.width, canvas.height);
  const center = size / 2;
  const radius = size * 0.42;
  const inner = radius * 0.58;
  const total = entries.reduce((sum, item) => sum + item[1], 0);
  let angle = -Math.PI / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!total) return;

  entries.forEach(([label, count]) => {
    const slice = (count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[label] || "#2f6fb0";
    ctx.fill();
    angle += slice;
  });

  ctx.beginPath();
  ctx.arc(center, center, inner, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.fillStyle = "#202423";
  ctx.font = "800 30px Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.fillText(total.toLocaleString("es-AR"), center, center - 2);
  ctx.fillStyle = "#66706c";
  ctx.font = "700 12px Segoe UI, Arial";
  ctx.fillText("equipos", center, center + 20);
}

function drawBarChart(canvas, entries, options = {}) {
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth;
  const height = Number(canvas.getAttribute("height"));
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  const left = 126;
  const right = 36;
  const top = 18;
  const rowH = Math.max(24, (height - top - 20) / Math.max(entries.length, 1));
  const max = Math.max(...entries.map((entry) => entry[1]), 1);

  ctx.font = "700 12px Segoe UI, Arial";
  entries.forEach(([label, count], index) => {
    const y = top + index * rowH;
    const barW = ((width - left - right) * count) / max;
    ctx.fillStyle = "#4d5752";
    ctx.textAlign = "right";
    ctx.fillText(trimLabel(label, 18), left - 12, y + 16);
    ctx.fillStyle = options.color || "#2f6fb0";
    ctx.fillRect(left, y + 3, Math.max(3, barW), 15);
    ctx.fillStyle = "#202423";
    ctx.textAlign = "left";
    ctx.fillText(String(count), left + barW + 8, y + 16);
  });
}

function trimLabel(label, size) {
  return label.length > size ? `${label.slice(0, size - 1)}.` : label;
}

function renderCharts(data) {
  const statusEntries = sortedEntries(groupCount(data, fields.estadoCalibracion));
  drawDonut(document.getElementById("statusDonut"), statusEntries);
  els.statusLegend.innerHTML = statusEntries.map(([label, count]) => `
    <div class="legend-row">
      <span class="dot" style="background:${colors[label] || "#2f6fb0"}"></span>
      <span>${escapeHtml(label)}</span>
      <strong>${count} (${percent(count, data.length)})</strong>
    </div>
  `).join("");

  drawBarChart(document.getElementById("sedeChart"), sortedEntries(groupCount(data, fields.sede), 10), { color: "#2f6fb0" });
  drawBarChart(document.getElementById("tipoChart"), sortedEntries(groupCount(data, fields.tipo), 12), { color: "#16805d" });
}

function renderCritical(data) {
  const critical = data
    .filter((row) => row._diasNum !== null && row._diasNum <= 30 && value(row, fields.estadoInstrumento).toUpperCase() !== "FUERA DE SERV.")
    .sort((a, b) => a._diasNum - b._diasNum)
    .slice(0, 12);

  els.criticalCount.textContent = `${critical.length} equipos`;
  if (!critical.length) {
    els.criticalList.innerHTML = `<div class="empty">No hay equipos vencidos o por vencer en 30 dias para la vista actual.</div>`;
    return;
  }

  els.criticalList.innerHTML = critical.map((row) => {
    const status = value(row, fields.estadoCalibracion).toUpperCase();
    const tone = status === "VENCIDO" ? "danger" : status === "POR VENCER" ? "warn" : "ok";
    const days = row._diasNum < 0 ? `${Math.abs(row._diasNum)} dias vencido` : `${row._diasNum} dias`;
    return `
      <div class="critical-row">
        <span class="code">${escapeHtml(value(row, fields.codigoReal))}</span>
        <div class="critical-main">
          <strong>${escapeHtml(value(row, fields.tipo))}</strong>
          <span>${escapeHtml(value(row, fields.sede))} · ${escapeHtml(value(row, fields.planta))} · ${escapeHtml(value(row, fields.linea))}</span>
        </div>
        <span class="status-pill ${tone}">${escapeHtml(status)} · ${days}</span>
      </div>
    `;
  }).join("");
}

function renderTable(data) {
  els.rowCount.textContent = `${data.length.toLocaleString("es-AR")} registros`;
  const visible = data.slice(0, 250);
  els.table.innerHTML = visible.map((row) => {
    const status = value(row, fields.estadoCalibracion).toUpperCase();
    const tone = status === "VENCIDO" ? "danger" : status === "POR VENCER" ? "warn" : status === "CONFORME" ? "ok" : "neutral";
    return `
      <tr>
        <td><strong>${escapeHtml(value(row, fields.codigoReal))}</strong></td>
        <td>${escapeHtml(value(row, fields.sede))}</td>
        <td>${escapeHtml(value(row, fields.planta))}</td>
        <td>${escapeHtml(value(row, fields.linea))}</td>
        <td>${escapeHtml(value(row, fields.tipo))}</td>
        <td>${escapeHtml(value(row, fields.estadoInstrumento))}</td>
        <td><span class="status-pill ${tone}">${escapeHtml(status)}</span></td>
        <td>${escapeHtml(value(row, fields.vencimiento))}</td>
        <td>${escapeHtml(value(row, fields.dias))}</td>
        <td>${escapeHtml(value(row, fields.responsable))}</td>
      </tr>
    `;
  }).join("");
}

function updateDashboard() {
  const state = getFilterState();
  const data = rows.filter((row) => rowMatches(row, state));
  const active = Object.values(state).filter(Boolean).length;

  els.activeCount.textContent = `${active} ${active === 1 ? "activo" : "activos"}`;
  refreshFilterOptions(state);
  renderKpis(data);
  renderCharts(data);
  renderCritical(data);
  renderTable(data);
}

function resetFilters() {
  Object.values(els.filters).forEach((select) => {
    select.value = "";
  });
  els.search.value = "";
  updateDashboard();
}

function exportCsv() {
  const state = getFilterState();
  const data = rows.filter((row) => rowMatches(row, state));
  const headers = [
    fields.codigoReal,
    fields.sede,
    fields.planta,
    fields.linea,
    fields.tipo,
    fields.estadoInstrumento,
    fields.estadoCalibracion,
    fields.vencimiento,
    fields.dias,
    fields.responsable,
    fields.categoria,
    fields.riesgo
  ];
  const csv = [headers, ...data.map((row) => headers.map((header) => row[header] || ""))]
    .map((line) => line.map(csvCell).join(";"))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vista-dashboard-metrologia.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function openAdminDates() {
  populateAdminCodeList();
  els.admin.modal.classList.remove("hidden");
  els.admin.modal.setAttribute("aria-hidden", "false");
  els.admin.code.focus();
  setAdminStatus(`${Object.keys(localUpdates).length} equipos con cambios locales guardados.`);
}

function closeAdminDates() {
  els.admin.modal.classList.add("hidden");
  els.admin.modal.setAttribute("aria-hidden", "true");
}

function setAdminStatus(message) {
  els.admin.status.textContent = message;
}

function findRowByCode(code) {
  const normalized = normalizeCode(code);
  return rows.find((row) => normalizeCode(row[fields.codigoReal]) === normalized);
}

function populateAdminCodeList() {
  const options = rows
    .map((row) => ({
      code: normalizeCode(row[fields.codigoReal]),
      tipo: value(row, fields.tipo),
      planta: value(row, fields.planta),
      linea: value(row, fields.linea)
    }))
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((item) => `<option value="${escapeHtml(item.code)}" label="${escapeHtml(`${item.tipo} - ${item.planta} - ${item.linea}`)}"></option>`)
    .join("");
  els.admin.codeList.innerHTML = options;
}

function saveSingleUpdate() {
  const code = normalizeCode(els.admin.code.value);
  const row = findRowByCode(code);
  if (!row) {
    setAdminStatus(`No se encontro el equipo ${code}.`);
    return;
  }
  const calDate = inputDateToDMY(els.admin.calDate.value);
  const dueDate = inputDateToDMY(els.admin.dueDate.value);
  const calibrationStatus = normalizeCalibrationStatus(els.admin.calibrationStatus.value);
  if (!calDate && !dueDate && !calibrationStatus) {
    setAdminStatus("Ingresar al menos una fecha o estado para actualizar.");
    return;
  }
  applyDateUpdate(code, calDate || row[fields.fechaCalibracion], dueDate || row[fields.vencimiento], calibrationStatus);
  setAdminStatus(`Equipo ${code} actualizado.`);
}

function applyDateUpdate(code, calDate, dueDate, calibrationStatus = "") {
  const normalized = normalizeCode(code);
  const days = daysUntil(dueDate);
  localUpdates[normalized] = {
    [fields.fechaCalibracion]: calDate,
    [fields.vencimiento]: dueDate,
    [fields.dias]: daysLabel(days),
    [fields.estadoCalibracion]: calibrationStatus || calibrationStatusFromDueDate(dueDate)
  };
  saveLocalUpdates();
  rows = buildRows();
  updateDashboard();
}

async function applyBulkUpdate() {
  const file = els.admin.file.files[0];
  if (!file) {
    setAdminStatus("Seleccionar un archivo Excel o CSV.");
    return;
  }
  try {
    const records = await readUpdateFile(file);
    let applied = 0;
    let skipped = 0;
    records.forEach((record) => {
      const mapped = mapUpdateRecord(record);
      if (!mapped.code || !findRowByCode(mapped.code) || (!mapped.calDate && !mapped.dueDate)) {
        skipped++;
        return;
      }
      const existing = findRowByCode(mapped.code);
      applyDateUpdate(
        mapped.code,
        mapped.calDate || existing[fields.fechaCalibracion],
        mapped.dueDate || existing[fields.vencimiento],
        mapped.calibrationStatus
      );
      applied++;
    });
    setAdminStatus(`Carga masiva aplicada: ${applied} equipos actualizados, ${skipped} filas omitidas.`);
  } catch (error) {
    setAdminStatus(error.message);
  }
}

function readUpdateFile(file) {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv")) {
    return file.text().then(parseCsvRows);
  }
  if (!window.XLSX) {
    return Promise.reject(new Error("Para leer Excel se necesita conexion a internet para cargar la libreria XLSX. Alternativa: guardar el archivo como CSV y subirlo."));
  }
  return file.arrayBuffer().then((buffer) => {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  });
}

function parseCsvRows(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const separator = lines[0].includes(";") ? ";" : ",";
  const headers = splitCsvLine(lines[0], separator);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line, separator);
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] || "";
      return acc;
    }, {});
  });
}

function splitCsvLine(line, separator) {
  const result = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === separator && !quoted) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

function mapUpdateRecord(record) {
  const entries = Object.entries(record).reduce((acc, [key, val]) => {
    acc[normalizeHeader(key)] = String(val || "").trim();
    return acc;
  }, {});
  return {
    code: normalizeCode(entries.codigo || entries.cod || entries.id || entries.equipo),
    calDate: normalizeUploadedDate(entries.fechacalibracion || entries.fechacal || entries.calibracion || entries.ultimacalibracion),
    dueDate: normalizeUploadedDate(entries.vencimiento || entries.fechavencimiento || entries.vencimientocalibracion || entries.fechavenc),
    calibrationStatus: normalizeCalibrationStatus(entries.estadocalibracion || entries.estadodecalibracion || entries.estado)
  };
}

function normalizeCalibrationStatus(status) {
  const normalized = String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
  if (!normalized) return "";
  if (normalized === "-" || normalized === "NO APLICA" || normalized === "NA" || normalized === "N/A") return "-";
  if (normalized === "CONFORME" || normalized === "CALIBRADO") return "CONFORME";
  if (normalized === "POR VENCER" || normalized === "PROXIMO A VENCER" || normalized === "PROXIMO") return "POR VENCER";
  if (normalized === "VENCIDO") return "VENCIDO";
  return "";
}

function normalizeHeader(header) {
  return String(header || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function normalizeUploadedDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(raw)) {
    const [year, month, day] = raw.slice(0, 10).split("-").map(Number);
    return formatDateDMY(new Date(year, month - 1, day));
  }
  if (parseDateDMY(raw)) return raw;
  if (!Number.isNaN(Number(raw)) && Number(raw) > 20000) {
    const excelEpoch = new Date(1899, 11, 30);
    return formatDateDMY(new Date(excelEpoch.getTime() + Number(raw) * 86400000));
  }
  return raw;
}

function downloadUpdatedData() {
  const payload = {
    ...window.METROLOGIA_DATA,
    generado: new Date().toISOString(),
    instrumentos: rows.map(({ _diasNum, _search, ...row }) => row)
  };
  const blob = new Blob([`window.METROLOGIA_DATA = ${JSON.stringify(payload, null, 2)};\n`], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "instrumentos_actualizado.js";
  link.click();
  URL.revokeObjectURL(url);
}

function clearLocalUpdates() {
  if (!confirm("Esto borra las fechas actualizadas guardadas en este navegador. ¿Continuar?")) return;
  localUpdates = {};
  saveLocalUpdates();
  rows = buildRows();
  updateDashboard();
  setAdminStatus("Cambios locales borrados.");
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

Object.values(els.filters).forEach((select) => select.addEventListener("change", updateDashboard));
els.search.addEventListener("input", updateDashboard);
els.reset.addEventListener("click", resetFilters);
els.export.addEventListener("click", exportCsv);
els.admin.open.addEventListener("click", openAdminDates);
els.admin.close.addEventListener("click", closeAdminDates);
els.admin.saveSingle.addEventListener("click", saveSingleUpdate);
els.admin.applyBulk.addEventListener("click", applyBulkUpdate);
els.admin.download.addEventListener("click", downloadUpdatedData);
els.admin.clear.addEventListener("click", clearLocalUpdates);
els.admin.modal.addEventListener("click", (event) => {
  if (event.target === els.admin.modal) closeAdminDates();
});
els.admin.code.addEventListener("change", () => {
  const row = findRowByCode(els.admin.code.value);
  if (!row) {
    setAdminStatus(`No se encontro el equipo ${normalizeCode(els.admin.code.value)}.`);
    return;
  }
  els.admin.calDate.value = dmyToInputDate(row[fields.fechaCalibracion]);
  els.admin.dueDate.value = dmyToInputDate(row[fields.vencimiento]);
  els.admin.calibrationStatus.value = ["CONFORME", "POR VENCER", "VENCIDO", "-"].includes(value(row, fields.estadoCalibracion).toUpperCase())
    ? value(row, fields.estadoCalibracion).toUpperCase()
    : "";
  setAdminStatus(`${normalizeCode(row[fields.codigoReal])} seleccionado: ${value(row, fields.tipo)} - ${value(row, fields.planta)} - ${value(row, fields.linea)}.`);
});
window.addEventListener("resize", () => {
  window.clearTimeout(window._chartResize);
  window._chartResize = window.setTimeout(updateDashboard, 120);
});

updateDashboard();
