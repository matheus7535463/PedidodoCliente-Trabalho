/* ==========================================================
   HACKATHON MANAGER
   SCRIPT.JS
   Arquivo único, organizado por seções. Cada bloco abaixo
   corresponde a uma responsabilidade da aplicação:
   constantes, utilitários, estado, storage, toast, modal,
   validação, gráficos, renderização, equipes, participantes,
   exportação e, por fim, a inicialização (app).
   ========================================================== */



/* ==========================================================
   CONSTANTS
   Shared, static values used across the app.
   ========================================================== */

const STORAGE_KEYS = {
  participantes: "hackathon_participantes",
  equipes: "hackathon_equipes",
};

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
  <rect width="100%" height="100%" fill="#ececee"/>
  <circle cx="60" cy="42" r="22" fill="#a1a1aa"/>
  <path d="M20 108c5-24 26-36 40-36s35 12 40 36" fill="#a1a1aa"/>
</svg>
`);

const DEFAULT_TEAM_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
  <rect width="100%" height="100%" fill="#ececee"/>
  <rect x="30" y="30" width="60" height="60" rx="14" fill="#a1a1aa"/>
</svg>
`);

/* Names must start with an uppercase letter, contain only letters and single
   spaces between words, and every word must be capitalized (natural writing). */
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

const TOAST_DURATION_MS = 3200;

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB


/* ==========================================================
   UTILS
   Small, dependency-free helpers reused across modules.
   ========================================================== */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/** Escapes text before it is placed inside innerHTML, preventing markup injection. */
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

/** Reads a <input type="file"> image as a base64 data URL. Rejects oversized/non-image files. */
function readImageAsDataUrl(file, maxBytes) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Nenhum arquivo selecionado."));
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selecione um arquivo de imagem válido."));
      return;
    }
    if (maxBytes && file.size > maxBytes) {
      reject(new Error("A imagem é muito grande. Selecione um arquivo de até 3 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

/** Generates a resilient unique id, with a fallback for environments without crypto.randomUUID. */
function generateId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}


/* ==========================================================
   STATE
   Single source of truth for the app's in-memory data.
   Other modules import `App` and mutate it directly, then call
   the relevant render/save functions — kept intentionally simple
   (no framework) but isolated in one place for clarity.
   ========================================================== */

const App = {
  participantes: [],
  equipes: [],
  participanteEditando: null, // id being edited, or null
  equipeEditando: null,       // id being edited, or null
  modalCallback: null,
  charts: {
    habilidades: null,
    equipes: null,
  },
};


/* ==========================================================
   STORAGE
   Reads and writes App state to localStorage. Isolated so the
   persistence mechanism can change later without touching
   business logic elsewhere.
   ========================================================== */



function carregarDados() {
  try {
    App.participantes = JSON.parse(localStorage.getItem(STORAGE_KEYS.participantes)) || [];
  } catch {
    App.participantes = [];
  }

  try {
    App.equipes = JSON.parse(localStorage.getItem(STORAGE_KEYS.equipes)) || [];
  } catch {
    App.equipes = [];
  }
}

function salvarDados() {
  localStorage.setItem(STORAGE_KEYS.participantes, JSON.stringify(App.participantes));
  localStorage.setItem(STORAGE_KEYS.equipes, JSON.stringify(App.equipes));
}


/* ==========================================================
   TOAST
   Lightweight, stacked toast notifications with an accessible
   live region.
   ========================================================== */



function mostrarToast(texto, tipo = "sucesso") {
  const region = $("#toastRegion");
  if (!region) return;

  const toast = document.createElement("div");
  toast.className = `toast${tipo === "erro" ? " error" : ""}`;
  toast.setAttribute("role", "status");

  const icon = tipo === "erro" ? "fa-circle-exclamation" : "fa-circle-check";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span></span>`;
  toast.querySelector("span").textContent = texto;

  region.appendChild(toast);

  const remover = () => {
    toast.classList.add("leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  };

  setTimeout(remover, TOAST_DURATION_MS);
}


/* ==========================================================
   MODAL
   Generic confirmation dialog. Callers pass a title, a message
   and a callback to run if the user confirms.
   ========================================================== */



function abrirModal(titulo, mensagem, callback) {
  const dialog = $("#modalConfirmacao");
  if (!dialog) return;

  $("#modalTitulo").textContent = titulo;
  $("#modalMensagem").textContent = mensagem;
  App.modalCallback = callback;

  dialog.showModal();

  const confirmBtn = $("#confirmarModal", dialog);
  confirmBtn?.focus();
}

function configurarModal() {
  const dialog = $("#modalConfirmacao");
  if (!dialog) return;

  $("#confirmarModal")?.addEventListener("click", () => {
    dialog.close();
    App.modalCallback?.();
    App.modalCallback = null;
  });

  $("#cancelarModal")?.addEventListener("click", () => {
    dialog.close();
    App.modalCallback = null;
  });

  // Clicking the backdrop closes the dialog without confirming.
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) {
      dialog.close();
      App.modalCallback = null;
    }
  });
}


/* ==========================================================
   VALIDATION
   Name validation rules + real-time field feedback.
   Rule: must start with an uppercase letter, contain only
   letters/spaces, every word capitalized, and not be fully
   upper- or lower-case.
   ========================================================== */


function validarNome(nomeBruto) {
  const nome = (nomeBruto ?? "").trim();

  if (nome.length === 0) {
    return { valido: false, mensagem: "O nome é obrigatório." };
  }

  if (nome.length < 2) {
    return { valido: false, mensagem: "Informe um nome com pelo menos 2 letras." };
  }

  if (!NAME_REGEX.test(nome)) {
    return { valido: false, mensagem: "Utilize apenas letras e espaços simples entre as palavras." };
  }

  if (nome === nome.toUpperCase()) {
    return { valido: false, mensagem: "O nome não pode estar totalmente em maiúsculas." };
  }

  if (nome === nome.toLowerCase()) {
    return { valido: false, mensagem: "O nome deve começar com letra maiúscula." };
  }

  const palavraInvalida = nome
    .split(" ")
    .find((palavra) => palavra[0] !== palavra[0].toUpperCase());

  if (palavraInvalida) {
    return { valido: false, mensagem: "Cada palavra do nome deve iniciar com letra maiúscula." };
  }

  return { valido: true, mensagem: "" };
}

function mostrarErro(campo, mensagem) {
  if (!campo) return;
  campo.classList.remove("input-valid");
  campo.classList.add("input-invalid");
  campo.setAttribute("aria-invalid", "true");

  const erro = campo.closest(".form-group")?.querySelector(".field-error");
  if (erro) erro.textContent = mensagem;
}

function limparErro(campo, { marcarValido = true } = {}) {
  if (!campo) return;
  campo.classList.remove("input-invalid");
  campo.classList.toggle("input-valid", marcarValido && campo.value.trim().length > 0);
  campo.removeAttribute("aria-invalid");

  const erro = campo.closest(".form-group")?.querySelector(".field-error");
  if (erro) erro.textContent = "";
}

function resetCampo(campo) {
  if (!campo) return;
  campo.classList.remove("input-invalid", "input-valid");
  campo.removeAttribute("aria-invalid");
  const erro = campo.closest(".form-group")?.querySelector(".field-error");
  if (erro) erro.textContent = "";
}

/** Wires up live (on-input) validation for a name field. Returns a function
 *  that re-runs validation on demand (used on submit). */
function configurarValidacaoNome(campo) {
  if (!campo) return () => ({ valido: false, mensagem: "" });

  const validar = () => {
    const resultado = validarNome(campo.value);
    if (campo.value.trim() === "") {
      resetCampo(campo);
    } else if (resultado.valido) {
      limparErro(campo);
    } else {
      mostrarErro(campo, resultado.mensagem);
    }
    return resultado;
  };

  campo.addEventListener("input", validar);
  campo.addEventListener("blur", validar);

  return validar;
}


/* ==========================================================
   CHARTS
   Monochromatic Chart.js visualizations for skills & teams.
   ========================================================== */



const MONO_SHADES = ["#18181b", "#52525b", "#8a8a92", "#a1a1aa", "#c4c4c9", "#dadade"];

function atualizarGraficos() {
  atualizarGraficoHabilidades();
  atualizarGraficoEquipes();
}

function atualizarGraficoHabilidades() {
  const ctx = $("#graficoHabilidades");
  if (!ctx || typeof Chart === "undefined") return;

  App.charts.habilidades?.destroy();

  const mapa = {};
  App.participantes.forEach((p) => {
    if (!p.habilidade) return;
    mapa[p.habilidade] = (mapa[p.habilidade] || 0) + 1;
  });

  App.charts.habilidades = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(mapa),
      datasets: [{
        data: Object.values(mapa),
        backgroundColor: "#18181b",
        borderRadius: 6,
        maxBarThickness: 34,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#ececee" } },
        x: { grid: { display: false } },
      },
    },
  });
}

function atualizarGraficoEquipes() {
  const ctx = $("#graficoEquipes");
  if (!ctx || typeof Chart === "undefined") return;

  App.charts.equipes?.destroy();

  App.charts.equipes = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: App.equipes.map((e) => e.nome),
      datasets: [{
        data: App.equipes.map((e) => e.integrantes.length),
        backgroundColor: App.equipes.map((_, i) => MONO_SHADES[i % MONO_SHADES.length]),
        borderColor: "#ffffff",
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 14 } } },
    },
  });
}


/* ==========================================================
   RENDER
   Pure(ish) DOM rendering. Reads from App state and paints the
   UI; does not mutate state itself.
   ========================================================== */





function atualizarTudo() {
  atualizarDashboard();
  atualizarListaParticipantes();
  atualizarListaEquipes();
  atualizarSemEquipe();
  atualizarFiltros();
}

/* ---------------- Dashboard ---------------- */

function atualizarDashboard() {
  const totalParticipantes = App.participantes.length;
  const totalEquipes = App.equipes.length;
  const equipesCompletas = App.equipes.filter(equipeCompleta).length;
  const equipesComVagas = App.equipes.filter((e) => !equipeCompleta(e)).length;
  const semEquipe = App.participantes.filter((p) => p.equipe === null).length;

  const set = (id, value) => { const el = $(id); if (el) el.textContent = value; };

  set("#totalParticipantes", totalParticipantes);
  set("#totalEquipes", totalEquipes);
  set("#equipesCompletas", equipesCompletas);
  set("#equipesComVagas", equipesComVagas);
  set("#semEquipeTotal", semEquipe);
}

/* ---------------- Participants table ---------------- */

function atualizarListaParticipantes() {
  const tbody = $("#listaParticipantes");
  if (!tbody) return;

  const pesquisa = ($("#pesquisaParticipante")?.value || "").trim().toLowerCase();
  const habilidade = $("#filtroHabilidade")?.value || "";
  const situacao = $("#filtroSituacao")?.value || "todos";

  let participantes = [...App.participantes];

  if (pesquisa) {
    participantes = participantes.filter((p) => p.nome.toLowerCase().includes(pesquisa));
  }
  if (habilidade) {
    participantes = participantes.filter((p) => p.habilidade === habilidade);
  }
  if (situacao === "comEquipe") {
    participantes = participantes.filter((p) => p.equipe !== null);
  }
  if (situacao === "semEquipe") {
    participantes = participantes.filter((p) => p.equipe === null);
  }

  $("#participantesVazio")?.classList.toggle("hidden", participantes.length !== 0);
  tbody.innerHTML = "";

  participantes.forEach((participante) => {
    const equipe = App.equipes.find((e) => e.id === participante.equipe);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="Participante">
        <div class="cell-person">
          <img src="${participante.foto || DEFAULT_AVATAR}" class="avatar" alt="" loading="lazy">
          <strong>${escapeHtml(participante.nome)}</strong>
        </div>
      </td>
      <td data-label="Habilidade">${escapeHtml(participante.habilidade) || "—"}</td>
      <td data-label="Equipe">${equipe ? escapeHtml(equipe.nome) : "Sem equipe"}</td>
      <td data-label="Status"><span class="badge ${equipe ? "success" : "warning"}">${equipe ? "Alocado" : "Disponível"}</span></td>
      <td data-label="Ações">
        <div class="cell-actions">
          <button class="btn-icon" type="button" data-action="edit-participant" data-id="${participante.id}" aria-label="Editar ${escapeHtml(participante.nome)}">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-icon danger" type="button" data-action="delete-participant" data-id="${participante.id}" aria-label="Excluir ${escapeHtml(participante.nome)}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------------- Without team ---------------- */

function atualizarSemEquipe() {
  const tbody = $("#listaSemEquipe");
  if (!tbody) return;

  const livres = App.participantes.filter((p) => p.equipe === null);
  $("#semEquipeVazio")?.classList.toggle("hidden", livres.length !== 0);
  tbody.innerHTML = "";

  const opcoesEquipes = App.equipes.filter((e) => !equipeCompleta(e));

  livres.forEach((participante) => {
    const tr = document.createElement("tr");
    const options = opcoesEquipes
      .map((e) => `<option value="${e.id}">${escapeHtml(e.nome)} (${vagasDisponiveis(e)} vaga${vagasDisponiveis(e) === 1 ? "" : "s"})</option>`)
      .join("");

    tr.innerHTML = `
      <td data-label="Participante">
        <div class="cell-person">
          <img src="${participante.foto || DEFAULT_AVATAR}" class="avatar" alt="" loading="lazy">
          <strong>${escapeHtml(participante.nome)}</strong>
        </div>
      </td>
      <td data-label="Habilidade">${escapeHtml(participante.habilidade) || "—"}</td>
      <td data-label="Alocar em uma equipe">
        <div class="cell-actions" style="justify-content:flex-start; flex-wrap:wrap;">
          <select data-role="select-equipe" data-participant-id="${participante.id}" aria-label="Escolher equipe para ${escapeHtml(participante.nome)}" ${opcoesEquipes.length === 0 ? "disabled" : ""}>
            ${opcoesEquipes.length === 0 ? '<option value="">Nenhuma equipe com vaga</option>' : `<option value="">Selecionar equipe…</option>${options}`}
          </select>
          <button class="btn btn-secondary" type="button" data-action="allocate-participant" data-id="${participante.id}" ${opcoesEquipes.length === 0 ? "disabled" : ""}>
            <i class="fa-solid fa-user-plus"></i> Adicionar
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------------- Teams ---------------- */

function atualizarListaEquipes() {
  const container = $("#listaEquipes");
  if (!container) return;

  $("#equipesVazio")?.classList.toggle("hidden", App.equipes.length !== 0);
  container.innerHTML = "";

  App.equipes.forEach((equipe) => {
    const integrantes = equipe.integrantes
      .map((id) => App.participantes.find((p) => p.id === id))
      .filter(Boolean);

    const outrasEquipesComVaga = App.equipes.filter(
      (e) => e.id !== equipe.id && !equipeCompleta(e)
    );

    const pct = equipe.capacidade > 0
      ? Math.min(100, Math.round((integrantes.length / equipe.capacidade) * 100))
      : 0;

    const membrosHtml = integrantes.length
      ? integrantes.map((p) => `
        <div class="team-member">
          <img src="${p.foto || DEFAULT_AVATAR}" alt="" loading="lazy">
          <div class="member-name-row">
            <div style="min-width:0;">
              <strong>${escapeHtml(p.nome)}</strong>
              <small>${escapeHtml(p.habilidade) || "—"}</small>
            </div>
          </div>
          ${equipe.lider === p.id ? '<span class="badge leader"><i class="fa-solid fa-star"></i> Líder</span>' : ""}
          <div class="cell-actions">
            ${equipe.lider !== p.id ? `<button class="btn-icon" type="button" data-action="set-leader" data-team-id="${equipe.id}" data-participant-id="${p.id}" aria-label="Definir ${escapeHtml(p.nome)} como líder"><i class="fa-solid fa-star"></i></button>` : ""}
            ${outrasEquipesComVaga.length ? `
            <select class="transfer-select" data-role="transfer" data-team-id="${equipe.id}" data-participant-id="${p.id}" aria-label="Transferir ${escapeHtml(p.nome)} para outra equipe">
              <option value="">Transferir…</option>
              ${outrasEquipesComVaga.map((e) => `<option value="${e.id}">${escapeHtml(e.nome)}</option>`).join("")}
            </select>` : ""}
            <button class="btn-icon danger" type="button" data-action="remove-member" data-team-id="${equipe.id}" data-participant-id="${p.id}" aria-label="Remover ${escapeHtml(p.nome)} da equipe">
              <i class="fa-solid fa-user-minus"></i>
            </button>
          </div>
        </div>
      `).join("")
      : '<div class="team-members-empty">Nenhum integrante ainda.</div>';

    const article = document.createElement("article");
    article.className = "team-card";
    article.innerHTML = `
      <div class="team-header">
        <img src="${equipe.logo || DEFAULT_TEAM_AVATAR}" class="team-logo" alt="" loading="lazy">
        <div class="team-info">
          <h3>${escapeHtml(equipe.nome)}</h3>
          <span>${integrantes.length}/${equipe.capacidade} integrantes${equipeCompleta(equipe) ? " · completa" : ""}</span>
        </div>
      </div>
      <div class="team-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Ocupação da equipe ${escapeHtml(equipe.nome)}">
        <div class="team-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="team-members">${membrosHtml}</div>
      <div class="team-actions">
        <button class="btn btn-secondary" type="button" data-action="edit-team" data-id="${equipe.id}">
          <i class="fa-solid fa-pen"></i> Editar
        </button>
        <button class="btn btn-danger-ghost" type="button" data-action="delete-team" data-id="${equipe.id}">
          <i class="fa-solid fa-trash"></i> Excluir
        </button>
      </div>
    `;
    container.appendChild(article);
  });
}

/* ---------------- Filters ---------------- */

function atualizarFiltros() {
  const select = $("#filtroHabilidade");
  if (!select) return;

  const atual = select.value;
  const habilidades = [...new Set(App.participantes.map((p) => p.habilidade).filter(Boolean))].sort();

  select.innerHTML = '<option value="">Todas as habilidades</option>' +
    habilidades.map((h) => `<option value="${escapeHtml(h)}">${escapeHtml(h)}</option>`).join("");

  select.value = atual;
}


/* ==========================================================
   TEAMS
   Team CRUD plus member allocation (add / remove / transfer /
   set leader). Pure logic — rendering happens elsewhere.
   ========================================================== */











function vagasDisponiveis(equipe) {
  return Math.max(0, equipe.capacidade - equipe.integrantes.length);
}

function equipeCompleta(equipe) {
  return equipe.integrantes.length >= equipe.capacidade;
}

function refrescarTudo() {
  salvarDados();
  atualizarTudo();
  atualizarGraficos();
}

/* ---------------- Create / update ---------------- */

function salvarEquipe() {
  const campoNome = $("#nomeEquipe");
  const campoCapacidade = $("#capacidade");
  const resultado = validarNome(campoNome.value);

  if (!resultado.valido) {
    mostrarErro(campoNome, resultado.mensagem);
    campoNome.focus();
    return;
  }

  const nome = campoNome.value.trim();
  const capacidade = Number(campoCapacidade.value);
  const logo = $("#previewEquipe")?.dataset.hasImage === "true"
    ? $("#previewEquipe").src
    : null;

  if (!Number.isFinite(capacidade) || capacidade <= 0) {
    campoCapacidade.classList.add("input-invalid");
    campoCapacidade.setAttribute("aria-invalid", "true");
    mostrarToast("A capacidade deve ser maior que zero.", "erro");
    campoCapacidade.focus();
    return;
  }

  campoCapacidade.classList.remove("input-invalid");
  campoCapacidade.removeAttribute("aria-invalid");

  const duplicada = App.equipes.find(
    (equipe) =>
      equipe.id !== App.equipeEditando &&
      equipe.nome.toLowerCase() === nome.toLowerCase()
  );

  if (duplicada) {
    mostrarErro(campoNome, "Já existe uma equipe com esse nome.");
    return;
  }

  if (App.equipeEditando === null) {
    App.equipes.push({
      id: generateId(),
      nome,
      capacidade,
      logo,
      lider: null,
      integrantes: [],
    });
    mostrarToast("Equipe criada.");
  } else {
    const equipe = App.equipes.find((e) => e.id === App.equipeEditando);
    if (!equipe) return;

    if (capacidade < equipe.integrantes.length) {
      mostrarToast("A capacidade não pode ser menor que a quantidade de integrantes atuais.", "erro");
      return;
    }

    equipe.nome = nome;
    equipe.capacidade = capacidade;
    if (logo) equipe.logo = logo;

    App.equipeEditando = null;
    $("#btnSalvarEquipe").innerHTML = '<i class="fa-solid fa-plus"></i> Criar equipe';
    $("#btnCancelarEquipe")?.classList.add("hidden");
    mostrarToast("Equipe atualizada.");
  }

  refrescarTudo();
  limparFormularioEquipe();
}

function limparFormularioEquipe() {
  const nome = $("#nomeEquipe");
  const capacidade = $("#capacidade");
  if (nome) nome.value = "";
  if (capacidade) capacidade.value = "";
  resetCampo(nome);

  const preview = $("#previewEquipe");
  if (preview) {
    preview.src = DEFAULT_TEAM_AVATAR;
    preview.dataset.hasImage = "false";
  }
  const filename = $("#logoEquipeFilename");
  if (filename) filename.textContent = "Nenhum arquivo selecionado";
}

function editarEquipe(id) {
  const equipe = App.equipes.find((e) => e.id === id);
  if (!equipe) return;

  App.equipeEditando = id;
  $("#nomeEquipe").value = equipe.nome;
  $("#capacidade").value = equipe.capacidade;
  resetCampo($("#nomeEquipe"));

  const preview = $("#previewEquipe");
  if (preview) {
    preview.src = equipe.logo || DEFAULT_TEAM_AVATAR;
    preview.dataset.hasImage = equipe.logo ? "true" : "false";
  }

  $("#btnSalvarEquipe").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações';
  $("#btnCancelarEquipe")?.classList.remove("hidden");
  $("#teamForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  $("#nomeEquipe")?.focus();
}

function cancelarEdicaoEquipe() {
  App.equipeEditando = null;
  limparFormularioEquipe();
  $("#btnSalvarEquipe").innerHTML = '<i class="fa-solid fa-plus"></i> Criar equipe';
  $("#btnCancelarEquipe")?.classList.add("hidden");
}

function excluirEquipe(id) {
  const equipe = App.equipes.find((e) => e.id === id);
  if (!equipe) return;

  if (equipe.integrantes.length > 0) {
    mostrarToast("Remova todos os integrantes antes de excluir a equipe.", "erro");
    return;
  }

  abrirModal("Excluir equipe", `Deseja realmente excluir a equipe "${equipe.nome}"? Essa ação não pode ser desfeita.`, () => {
    App.equipes = App.equipes.filter((e) => e.id !== id);
    if (App.equipeEditando === id) cancelarEdicaoEquipe();
    refrescarTudo();
    mostrarToast("Equipe removida.");
  });
}

/* ---------------- Allocation ---------------- */

function adicionarParticipanteEquipe(participanteId, equipeId) {
  const participante = App.participantes.find((p) => p.id === participanteId);
  const equipe = App.equipes.find((e) => e.id === equipeId);
  if (!participante || !equipe) return;

  if (participante.equipe !== null) {
    mostrarToast("Este participante já pertence a uma equipe.", "erro");
    return;
  }
  if (equipeCompleta(equipe)) {
    mostrarToast("A equipe atingiu sua capacidade máxima.", "erro");
    return;
  }

  equipe.integrantes.push(participante.id);
  participante.equipe = equipe.id;
  if (!equipe.lider) equipe.lider = participante.id;

  refrescarTudo();
  mostrarToast(`${participante.nome} foi adicionado à equipe ${equipe.nome}.`);
}

function removerParticipanteEquipe(participanteId) {
  const participante = App.participantes.find((p) => p.id === participanteId);
  if (!participante) return;

  const equipe = App.equipes.find((e) => e.id === participante.equipe);
  if (!equipe) return;

  equipe.integrantes = equipe.integrantes.filter((id) => id !== participanteId);
  participante.equipe = null;

  if (equipe.lider === participanteId) {
    equipe.lider = equipe.integrantes[0] || null;
  }

  refrescarTudo();
  mostrarToast("Participante removido da equipe.");
}

function transferirParticipante(participanteId, novaEquipeId) {
  const participante = App.participantes.find((p) => p.id === participanteId);
  if (!participante) return;

  const equipeAtual = App.equipes.find((e) => e.id === participante.equipe);
  const novaEquipe = App.equipes.find((e) => e.id === novaEquipeId);
  if (!novaEquipe) return;

  if (equipeCompleta(novaEquipe)) {
    mostrarToast("A equipe de destino está cheia.", "erro");
    return;
  }

  if (equipeAtual) {
    equipeAtual.integrantes = equipeAtual.integrantes.filter((id) => id !== participante.id);
    if (equipeAtual.lider === participante.id) {
      equipeAtual.lider = equipeAtual.integrantes[0] || null;
    }
  }

  novaEquipe.integrantes.push(participante.id);
  participante.equipe = novaEquipe.id;
  if (!novaEquipe.lider) novaEquipe.lider = participante.id;

  refrescarTudo();
  mostrarToast(`${participante.nome} foi transferido para ${novaEquipe.nome}.`);
}

function definirLider(equipeId, participanteId) {
  const equipe = App.equipes.find((e) => e.id === equipeId);
  if (!equipe) return;

  if (!equipe.integrantes.includes(participanteId)) {
    mostrarToast("O participante não pertence à equipe.", "erro");
    return;
  }

  equipe.lider = participanteId;
  refrescarTudo();
  mostrarToast("Líder da equipe atualizado.");
}

/* ---------------- Image preview ---------------- */

async function previewLogoEquipe(event) {
  const file = event.target.files?.[0];
  const preview = $("#previewEquipe");
  const filename = $("#logoEquipeFilename");
  if (!file || !preview) return;

  try {
    const dataUrl = await readImageAsDataUrl(file, MAX_IMAGE_SIZE_BYTES);
    preview.src = dataUrl;
    preview.dataset.hasImage = "true";
    if (filename) filename.textContent = file.name;
  } catch (error) {
    mostrarToast(error.message, "erro");
    event.target.value = "";
  }
}


/* ==========================================================
   PARTICIPANTS
   Participant CRUD. Pure logic — rendering happens elsewhere.
   ========================================================== */










function salvarParticipante() {
  const campoNome = $("#nome");
  const campoHabilidade = $("#habilidade");
  const resultado = validarNome(campoNome.value);

  if (!resultado.valido) {
    mostrarErro(campoNome, resultado.mensagem);
    campoNome.focus();
    return;
  }

  const nome = campoNome.value.trim();
  const habilidade = campoHabilidade.value.trim();

  if (!habilidade) {
    mostrarToast("Informe a habilidade principal do participante.", "erro");
    campoHabilidade.focus();
    return;
  }

  const preview = $("#previewParticipante");
  const foto = preview?.dataset.hasImage === "true" ? preview.src : null;

  const duplicado = App.participantes.find(
    (p) => p.id !== App.participanteEditando && p.nome.toLowerCase() === nome.toLowerCase()
  );

  if (duplicado) {
    mostrarToast("Já existe um participante com esse nome.", "erro");
    mostrarErro(campoNome, "Nome já cadastrado.");
    return;
  }

  if (App.participanteEditando === null) {
    App.participantes.push({
      id: generateId(),
      nome,
      habilidade,
      equipe: null,
      foto,
    });
    mostrarToast("Participante cadastrado.");
  } else {
    const participante = App.participantes.find((p) => p.id === App.participanteEditando);
    if (!participante) return;

    participante.nome = nome;
    participante.habilidade = habilidade;
    if (foto) participante.foto = foto;

    App.participanteEditando = null;
    $("#btnSalvarParticipante").innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar';
    $("#btnCancelarParticipante")?.classList.add("hidden");
    mostrarToast("Participante atualizado.");
  }

  refrescarTudo();
  limparFormularioParticipante();
}

function limparFormularioParticipante() {
  const nome = $("#nome");
  const habilidade = $("#habilidade");
  if (nome) nome.value = "";
  if (habilidade) habilidade.value = "";
  resetCampo(nome);

  const preview = $("#previewParticipante");
  if (preview) {
    preview.src = DEFAULT_AVATAR;
    preview.dataset.hasImage = "false";
  }
  const filename = $("#fotoParticipanteFilename");
  if (filename) filename.textContent = "Nenhum arquivo selecionado";
}

function editarParticipante(id) {
  const participante = App.participantes.find((p) => p.id === id);
  if (!participante) return;

  App.participanteEditando = id;
  $("#nome").value = participante.nome;
  $("#habilidade").value = participante.habilidade;
  resetCampo($("#nome"));

  const preview = $("#previewParticipante");
  if (preview) {
    preview.src = participante.foto || DEFAULT_AVATAR;
    preview.dataset.hasImage = participante.foto ? "true" : "false";
  }

  $("#btnSalvarParticipante").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações';
  $("#btnCancelarParticipante")?.classList.remove("hidden");
  $("#participantForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  $("#nome")?.focus();
}

function cancelarEdicaoParticipante() {
  App.participanteEditando = null;
  limparFormularioParticipante();
  $("#btnSalvarParticipante").innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar';
  $("#btnCancelarParticipante")?.classList.add("hidden");
}

function excluirParticipante(id) {
  const participante = App.participantes.find((p) => p.id === id);
  if (!participante) return;

  if (participante.equipe) {
    mostrarToast("Remova o participante da equipe antes de excluí-lo.", "erro");
    return;
  }

  abrirModal("Excluir participante", `Deseja realmente excluir ${participante.nome}? Essa ação não pode ser desfeita.`, () => {
    App.participantes = App.participantes.filter((p) => p.id !== id);
    if (App.participanteEditando === id) cancelarEdicaoParticipante();
    refrescarTudo();
    mostrarToast("Participante removido.");
  });
}

async function previewFotoParticipante(event) {
  const file = event.target.files?.[0];
  const preview = $("#previewParticipante");
  const filename = $("#fotoParticipanteFilename");
  if (!file || !preview) return;

  try {
    const dataUrl = await readImageAsDataUrl(file, MAX_IMAGE_SIZE_BYTES);
    preview.src = dataUrl;
    preview.dataset.hasImage = "true";
    if (filename) filename.textContent = file.name;
  } catch (error) {
    mostrarToast(error.message, "erro");
    event.target.value = "";
  }
}


/* ==========================================================
   EXPORT
   CSV and PDF export of participants and teams.
   ========================================================== */



function baixarArquivo(nome, conteudo, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob(["\ufeff" + conteudo], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function exportarCSV() {
  if (App.participantes.length === 0) {
    mostrarToast("Não há participantes para exportar.", "erro");
    return;
  }
  let csv = "Nome,Habilidade,Equipe\n";
  App.participantes.forEach((p) => {
    const equipe = App.equipes.find((e) => e.id === p.equipe);
    csv += [p.nome, p.habilidade, equipe ? equipe.nome : "Sem equipe"].map(csvEscape).join(",") + "\n";
  });
  baixarArquivo("participantes.csv", csv);
  mostrarToast("Exportação de participantes concluída.");
}

function exportarEquipesCSV() {
  if (App.equipes.length === 0) {
    mostrarToast("Não há equipes para exportar.", "erro");
    return;
  }
  let csv = "Equipe,Capacidade,Integrantes\n";
  App.equipes.forEach((e) => {
    csv += [e.nome, e.capacidade, e.integrantes.length].map(csvEscape).join(",") + "\n";
  });
  baixarArquivo("equipes.csv", csv);
  mostrarToast("Exportação de equipes concluída.");
}

function exportarPDF() {
  if (typeof jspdf === "undefined") {
    mostrarToast("Não foi possível carregar o gerador de PDF.", "erro");
    return;
  }
  if (App.participantes.length === 0) {
    mostrarToast("Não há participantes para exportar.", "erro");
    return;
  }

  const pdf = new jspdf.jsPDF();
  pdf.setFontSize(16);
  pdf.text("Lista de Participantes", 15, 20);
  pdf.setFontSize(11);

  let y = 34;
  App.participantes.forEach((p) => {
    const equipe = App.equipes.find((e) => e.id === p.equipe);
    pdf.text(`${p.nome} — ${p.habilidade} — ${equipe ? equipe.nome : "Sem equipe"}`, 15, y);
    y += 8;
    if (y > 280) { pdf.addPage(); y = 20; }
  });

  pdf.save("participantes.pdf");
  mostrarToast("PDF de participantes gerado.");
}

function exportarEquipesPDF() {
  if (typeof jspdf === "undefined") {
    mostrarToast("Não foi possível carregar o gerador de PDF.", "erro");
    return;
  }
  if (App.equipes.length === 0) {
    mostrarToast("Não há equipes para exportar.", "erro");
    return;
  }

  const pdf = new jspdf.jsPDF();
  pdf.setFontSize(16);
  pdf.text("Lista de Equipes", 15, 20);
  pdf.setFontSize(11);

  let y = 34;
  App.equipes.forEach((e) => {
    pdf.text(`${e.nome} (${e.integrantes.length}/${e.capacidade})`, 15, y);
    y += 8;
    if (y > 280) { pdf.addPage(); y = 20; }
  });

  pdf.save("equipes.pdf");
  mostrarToast("PDF de equipes gerado.");
}


/* ==========================================================
   APP
   Entry point: boots the app and wires DOM events to the
   feature modules. Keep this file about *wiring*, not logic.
   ========================================================== */










document.addEventListener("DOMContentLoaded", iniciarSistema);

function iniciarSistema() {
  carregarDados();
  configurarEventos();
  configurarValidacaoNome($("#nome"));
  configurarValidacaoNome($("#nomeEquipe"));
  configurarModal();
  limparFormularioParticipante();
  limparFormularioEquipe();
  atualizarTudo();
  atualizarGraficos();
}

function configurarEventos() {
  // Participants form
  $("#btnSalvarParticipante")?.addEventListener("click", salvarParticipante);
  $("#btnCancelarParticipante")?.addEventListener("click", cancelarEdicaoParticipante);
  $("#fotoParticipante")?.addEventListener("change", previewFotoParticipante);
  $("#participantForm")?.addEventListener("submit", (e) => e.preventDefault());

  // Teams form
  $("#btnSalvarEquipe")?.addEventListener("click", salvarEquipe);
  $("#btnCancelarEquipe")?.addEventListener("click", cancelarEdicaoEquipe);
  $("#logoEquipe")?.addEventListener("change", previewLogoEquipe);
  $("#teamForm")?.addEventListener("submit", (e) => e.preventDefault());

  // Search & filters
  $("#pesquisaParticipante")?.addEventListener("input", atualizarTudo);
  $("#filtroHabilidade")?.addEventListener("change", atualizarTudo);
  $("#filtroSituacao")?.addEventListener("change", atualizarTudo);

  // Export
  $("#btnCSVParticipantes")?.addEventListener("click", exportarCSV);
  $("#btnPDFParticipantes")?.addEventListener("click", exportarPDF);
  $("#btnCSVEquipes")?.addEventListener("click", exportarEquipesCSV);
  $("#btnPDFEquipes")?.addEventListener("click", exportarEquipesPDF);

  // Mobile menu
  $("#menuToggle")?.addEventListener("click", alternarMenu);
  $("#sidebarOverlay")?.addEventListener("click", fecharMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharMenu();
  });

  // Close mobile menu after choosing a nav link
  document.querySelectorAll(".sidebar-nav a").forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });

  // Delegated events: participants table
  $("#listaParticipantes")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === "edit-participant") editarParticipante(id);
    if (action === "delete-participant") excluirParticipante(id);
  });

  // Delegated events: "without team" table
  $("#listaSemEquipe")?.addEventListener("click", (e) => {
    const btn = e.target.closest('button[data-action="allocate-participant"]');
    if (!btn) return;
    const participantId = btn.dataset.id;
    const row = btn.closest("tr");
    const select = row?.querySelector('[data-role="select-equipe"]');
    const equipeId = select?.value;
    if (!equipeId) {
      select?.focus();
      return;
    }
    adicionarParticipanteEquipe(participantId, equipeId);
  });

  // Delegated events: teams grid
  $("#listaEquipes")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { action, id, teamId, participantId } = btn.dataset;
    if (action === "edit-team") editarEquipe(id);
    if (action === "delete-team") excluirEquipe(id);
    if (action === "remove-member") removerParticipanteEquipe(participantId);
    if (action === "set-leader") definirLider(teamId, participantId);
  });

  $("#listaEquipes")?.addEventListener("change", (e) => {
    const select = e.target.closest('[data-role="transfer"]');
    if (!select || !select.value) return;
    const { participantId } = select.dataset;
    transferirParticipante(participantId, select.value);
    select.value = "";
  });
}

function alternarMenu() {
  $("#sidebar")?.classList.toggle("open");
  $("#sidebarOverlay")?.classList.toggle("show");
  document.body.classList.toggle("no-scroll", $("#sidebar")?.classList.contains("open"));
}

function fecharMenu() {
  $("#sidebar")?.classList.remove("open");
  $("#sidebarOverlay")?.classList.remove("show");
  document.body.classList.remove("no-scroll");
}