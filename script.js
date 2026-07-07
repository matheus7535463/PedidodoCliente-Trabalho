/* =====================================================
   HACKATHON MANAGER — LÓGICA DA APLICAÇÃO
===================================================== */

/* ---------- ESTADO ---------- */
let participantes = JSON.parse(localStorage.getItem("hm_participantes")) || [];
let equipes = JSON.parse(localStorage.getItem("hm_equipes")) || [];

let participanteEditar = null; // id do participante em edição
let equipeEditar = null;       // id da equipe em edição
let acaoModal = null;          // callback executado ao confirmar o modal

/* ---------- PERSISTÊNCIA ---------- */
function salvarDados(){
  localStorage.setItem("hm_participantes", JSON.stringify(participantes));
  localStorage.setItem("hm_equipes", JSON.stringify(equipes));
}

/* ---------- TOAST ---------- */
function mostrarToast(texto, tipo = ""){
  const toast = document.getElementById("toast");
  toast.textContent = texto;
  toast.className = tipo ? `show ${tipo}` : "show";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ---------- MODAL DE CONFIRMAÇÃO ---------- */
function abrirModal(titulo, mensagem, callback){
  document.getElementById("modalTitulo").textContent = titulo;
  document.getElementById("modalMensagem").textContent = mensagem;
  acaoModal = callback;
  document.getElementById("modalConfirmacao").classList.add("ativo");
}
function cancelarModal(){
  document.getElementById("modalConfirmacao").classList.remove("ativo");
  acaoModal = null;
}
function confirmarModal(){
  if (typeof acaoModal === "function") acaoModal();
  cancelarModal();
}

/* ---------- IDENTIDADE VISUAL DAS EQUIPES ---------- */
const PALETAS_LOGO = [
  ["#4338ca", "#8b5cf6"],
  ["#06b6d4", "#4338ca"],
  ["#8b5cf6", "#fb7185"],
  ["#0891b2", "#22c55e"],
  ["#d97706", "#fb7185"],
  ["#4338ca", "#06b6d4"]
];

function corDaEquipe(nome){
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  const paleta = PALETAS_LOGO[Math.abs(hash) % PALETAS_LOGO.length];
  return `linear-gradient(135deg, ${paleta[0]}, ${paleta[1]})`;
}

function iniciaisDoNome(nome){
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/* ---------- HELPERS DE DADOS ---------- */
function getEquipe(id){ return equipes.find(e => e.id == id); }
function getParticipante(id){ return participantes.find(p => p.id == id); }
function nomeParaHtml(texto){
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

/* =====================================================
   DASHBOARD
===================================================== */
function atualizarDashboard(){
  document.getElementById("totalParticipantes").textContent = participantes.length;
  document.getElementById("totalEquipes").textContent = equipes.length;

  const semEquipe = participantes.filter(p => p.equipeId == null);
  document.getElementById("semEquipeTotal").textContent = semEquipe.length;

  const completas = equipes.filter(e => e.integrantes.length >= e.capacidade);
  document.getElementById("equipesCompletas").textContent = completas.length;

  const comVagas = equipes.filter(e => e.integrantes.length < e.capacidade);
  document.getElementById("equipesComVagas").textContent = comVagas.length;
}

/* =====================================================
   CARROSSEL DE EQUIPES
===================================================== */
function montarBadgeEquipe(equipe){
  const membros = equipe.integrantes.map(id => getParticipante(id)).filter(Boolean);
  const visiveis = membros.slice(0, 5);
  const restantes = membros.length - visiveis.length;

  let avatares = visiveis.map(p => `<span class="mini-avatar" title="${nomeParaHtml(p.nome)}">${iniciaisDoNome(p.nome)}</span>`).join("");
  if (restantes > 0) avatares += `<span class="mini-avatar mais">+${restantes}</span>`;

  return `
    <div class="badge-equipe">
      <div class="badge-notch"></div>
      <div class="badge-logo" style="background:${corDaEquipe(equipe.nome)}">${iniciaisDoNome(equipe.nome)}</div>
      <h4>${nomeParaHtml(equipe.nome)}</h4>
      <p class="badge-count">${equipe.integrantes.length}/${equipe.capacidade} integrantes</p>
      <div class="badge-membros">
        ${membros.length ? avatares : '<span class="badge-vazio">sem integrantes</span>'}
      </div>
    </div>
  `;
}

function atualizarCarrossel(){
  const trilho = document.getElementById("carrosselTrilho");
  const wrap = document.getElementById("carrosselWrap");

  if (equipes.length === 0){
    wrap.classList.add("oculto");
    trilho.innerHTML = "";
    return;
  }

  wrap.classList.remove("oculto");
  // duplica a lista para permitir o loop contínuo do carrossel
  const html = equipes.map(montarBadgeEquipe).join("");
  trilho.innerHTML = html + html;
}

/* =====================================================
   PARTICIPANTES
===================================================== */
function popularFiltroHabilidades(){
  const select = document.getElementById("filtroHabilidade");
  const atual = select.value;
  const habilidades = [...new Set(participantes.map(p => p.habilidade))].sort();

  select.innerHTML = '<option value="">Todas as habilidades</option>' +
    habilidades.map(h => `<option value="${nomeParaHtml(h)}">${nomeParaHtml(h)}</option>`).join("");

  select.value = habilidades.includes(atual) ? atual : "";
}

function atualizarParticipantes(){
  popularFiltroHabilidades();

  const termo = (document.getElementById("pesquisaParticipante").value || "").toLowerCase();
  const habilidade = document.getElementById("filtroHabilidade").value;
  const situacao = document.getElementById("filtroSituacao").value;

  const filtrados = participantes.filter(p => {
    const passaNome = p.nome.toLowerCase().includes(termo);
    const passaHabilidade = !habilidade || p.habilidade === habilidade;
    let passaSituacao = true;
    if (situacao === "comEquipe") passaSituacao = p.equipeId != null;
    if (situacao === "semEquipe") passaSituacao = p.equipeId == null;
    return passaNome && passaHabilidade && passaSituacao;
  });

  const tabela = document.getElementById("listaParticipantes");
  tabela.innerHTML = filtrados.map(p => {
    const equipe = p.equipeId != null ? getEquipe(p.equipeId) : null;
    return `
      <tr>
        <td>${nomeParaHtml(p.nome)} ${p.lider ? '<i class="fa-solid fa-crown" title="Líder" style="color:#d97706"></i>' : ""}</td>
        <td>${nomeParaHtml(p.habilidade)}</td>
        <td>${equipe ? nomeParaHtml(equipe.nome) : "Sem equipe"}</td>
        <td>${equipe
          ? '<span class="badge verde"><i class="fa-solid fa-check"></i> Em equipe</span>'
          : '<span class="badge vermelho"><i class="fa-solid fa-xmark"></i> Livre</span>'}</td>
        <td class="acoes-celula">
          <button class="editar" onclick="editarParticipante(${p.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="excluir" onclick="pedirExclusaoParticipante(${p.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("participantesVazio").classList.toggle("oculto", filtrados.length > 0);
}

function limparFormularioParticipante(){
  document.getElementById("nome").value = "";
  document.getElementById("habilidade").value = "";
}

function cancelarEdicaoParticipante(){
  participanteEditar = null;
  limparFormularioParticipante();
  document.getElementById("tituloFormParticipante").textContent = "Cadastrar Participante";
  document.getElementById("btnSalvarParticipante").innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar';
  document.getElementById("btnCancelarParticipante").classList.add("oculto");
}

function salvarEdicao(){
  const nome = document.getElementById("nome").value.trim();
  const habilidade = document.getElementById("habilidade").value.trim();

  if (nome === ""){ mostrarToast("Digite o nome do participante.", "erro"); return; }
  if (habilidade === ""){ mostrarToast("Digite a habilidade do participante.", "erro"); return; }

  const duplicado = participantes.find(p =>
    p.nome.toLowerCase() === nome.toLowerCase() && p.id !== participanteEditar
  );
  if (duplicado){ mostrarToast("Já existe um participante com esse nome.", "erro"); return; }

  if (participanteEditar == null){
    participantes.push({ id: Date.now(), nome, habilidade, equipeId: null, lider: false });
    mostrarToast("Participante cadastrado.", "sucesso");
  } else {
    const p = getParticipante(participanteEditar);
    p.nome = nome;
    p.habilidade = habilidade;
    mostrarToast("Participante atualizado.", "sucesso");
  }

  salvarDados();
  cancelarEdicaoParticipante();
  atualizarSistema();
}

function editarParticipante(id){
  const p = getParticipante(id);
  if (!p) return;
  participanteEditar = id;
  document.getElementById("nome").value = p.nome;
  document.getElementById("habilidade").value = p.habilidade;
  document.getElementById("tituloFormParticipante").textContent = "Editar Participante";
  document.getElementById("btnSalvarParticipante").innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
  document.getElementById("btnCancelarParticipante").classList.remove("oculto");
  document.getElementById("participantes").scrollIntoView({ behavior: "smooth" });
}

function pedirExclusaoParticipante(id){
  const p = getParticipante(id);
  if (!p) return;
  if (p.equipeId != null){
    mostrarToast("Remova o participante da equipe antes de excluir.", "erro");
    return;
  }
  abrirModal("Excluir participante", `Deseja realmente excluir "${p.nome}"?`, () => excluirParticipante(id));
}

function excluirParticipante(id){
  participantes = participantes.filter(p => p.id !== id);
  salvarDados();
  atualizarSistema();
  mostrarToast("Participante removido.", "sucesso");
}

/* =====================================================
   EQUIPES
===================================================== */
function limparFormularioEquipe(){
  document.getElementById("nomeEquipe").value = "";
  document.getElementById("capacidade").value = "";
}

function cancelarEdicaoEquipe(){
  equipeEditar = null;
  limparFormularioEquipe();
  document.getElementById("tituloFormEquipe").textContent = "Criar Equipe";
  document.getElementById("btnSalvarEquipe").innerHTML = '<i class="fa-solid fa-plus"></i> Criar Equipe';
  document.getElementById("btnCancelarEquipe").classList.add("oculto");
}

function salvarEquipe(){
  const nome = document.getElementById("nomeEquipe").value.trim();
  const capacidade = Number(document.getElementById("capacidade").value);

  if (nome === ""){ mostrarToast("Digite o nome da equipe.", "erro"); return; }
  if (!capacidade || capacidade <= 0){ mostrarToast("Informe uma capacidade válida.", "erro"); return; }

  const duplicada = equipes.find(e =>
    e.nome.toLowerCase() === nome.toLowerCase() && e.id !== equipeEditar
  );
  if (duplicada){ mostrarToast("Já existe uma equipe com esse nome.", "erro"); return; }

  if (equipeEditar == null){
    equipes.push({ id: Date.now(), nome, capacidade, integrantes: [], liderId: null });
    mostrarToast("Equipe criada com sucesso.", "sucesso");
  } else {
    const equipe = getEquipe(equipeEditar);
    if (capacidade < equipe.integrantes.length){
      mostrarToast("A capacidade não pode ser menor que o número atual de integrantes.", "erro");
      return;
    }
    equipe.nome = nome;
    equipe.capacidade = capacidade;
    mostrarToast("Equipe atualizada.", "sucesso");
  }

  salvarDados();
  cancelarEdicaoEquipe();
  atualizarSistema();
}

function editarEquipe(id){
  const equipe = getEquipe(id);
  if (!equipe) return;
  equipeEditar = id;
  document.getElementById("nomeEquipe").value = equipe.nome;
  document.getElementById("capacidade").value = equipe.capacidade;
  document.getElementById("tituloFormEquipe").textContent = "Editar Equipe";
  document.getElementById("btnSalvarEquipe").innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
  document.getElementById("btnCancelarEquipe").classList.remove("oculto");
  document.getElementById("equipes").scrollIntoView({ behavior: "smooth" });
}

function pedirExclusaoEquipe(id){
  const equipe = getEquipe(id);
  if (!equipe) return;
  if (equipe.integrantes.length > 0){
    mostrarToast("Remova todos os integrantes antes de excluir a equipe.", "erro");
    return;
  }
  abrirModal("Excluir equipe", `Deseja realmente excluir a equipe "${equipe.nome}"?`, () => removerEquipe(id));
}

function removerEquipe(id){
  equipes = equipes.filter(e => e.id !== id);
  salvarDados();
  atualizarSistema();
  mostrarToast("Equipe removida.", "sucesso");
}

function montarCardEquipe(equipe){
  const vagas = equipe.capacidade - equipe.integrantes.length;
  const completa = vagas <= 0;
  const porcentagem = Math.min(100, (equipe.integrantes.length / equipe.capacidade) * 100);
  const lider = equipe.liderId != null ? getParticipante(equipe.liderId) : null;

  const livres = participantes.filter(p => p.equipeId == null);
  const outrasEquipes = equipes.filter(e => e.id !== equipe.id);

  const membrosHtml = equipe.integrantes.map(id => {
    const p = getParticipante(id);
    if (!p) return "";
    const opcoesTransferencia = outrasEquipes.map(e =>
      `<option value="${e.id}">${nomeParaHtml(e.nome)}</option>`
    ).join("");

    return `
      <li>
        <span class="membro-nome">
          ${p.lider ? '<i class="fa-solid fa-crown" title="Líder"></i>' : ""}
          ${nomeParaHtml(p.nome)}
        </span>
        <span class="membro-acoes">
          <button title="Definir como líder" onclick="definirLider(${p.id}, ${equipe.id})"><i class="fa-solid fa-crown"></i></button>
          ${outrasEquipes.length ? `
            <select title="Transferir para outra equipe" onchange="if(this.value){transferirParticipante(${p.id}, Number(this.value)); this.value='';}">
              <option value="">Transferir…</option>
              ${opcoesTransferencia}
            </select>` : ""}
          <button title="Remover da equipe" onclick="removerDaEquipe(${p.id}, ${equipe.id})"><i class="fa-solid fa-xmark"></i></button>
        </span>
      </li>
    `;
  }).join("");

  return `
    <div class="equipe ${completa ? "completa" : ""}">
      <div class="equipe-cabecalho">
        <div class="equipe-logo" style="background:${corDaEquipe(equipe.nome)}">${iniciaisDoNome(equipe.nome)}</div>
        <div>
          <h3>${nomeParaHtml(equipe.nome)}</h3>
          <div class="equipe-lider-nome">
            <i class="fa-solid fa-crown"></i> ${lider ? nomeParaHtml(lider.nome) : "Sem líder definido"}
          </div>
        </div>
      </div>

      <div class="equipe-status-linha">
        <span>${completa ? '<span class="badge verde">Completa</span>' : '<span class="badge roxo">Em formação</span>'}</span>
        <strong>${equipe.integrantes.length}/${equipe.capacidade}</strong>
      </div>

      <div class="progresso ${completa ? "cheia" : ""}"><span style="width:${porcentagem}%"></span></div>
      <p style="font-size:13px;color:var(--ink-soft)">${completa ? "Nenhuma vaga disponível" : `${vagas} vaga(s) disponível(is)`}</p>

      <ul class="membros">
        ${membrosHtml || '<li class="sem-membros">Nenhum integrante ainda.</li>'}
      </ul>

      ${!completa ? `
        <div class="adicionar-membro">
          <select id="selectAdd-${equipe.id}">
            <option value="">${livres.length ? "Selecione um participante livre…" : "Nenhum participante livre"}</option>
            ${livres.map(p => `<option value="${p.id}">${nomeParaHtml(p.nome)} — ${nomeParaHtml(p.habilidade)}</option>`).join("")}
          </select>
          <button ${livres.length ? "" : "disabled"} onclick="adicionarPeloSelect(${equipe.id})" title="Adicionar participante">
            <i class="fa-solid fa-user-plus"></i>
          </button>
        </div>
      ` : ""}

      <div class="equipe-acoes">
        <button class="editar" onclick="editarEquipe(${equipe.id})"><i class="fa-solid fa-pen"></i> Editar</button>
        <button class="excluir" onclick="pedirExclusaoEquipe(${equipe.id})"><i class="fa-solid fa-trash"></i> Excluir</button>
      </div>
    </div>
  `;
}

function atualizarEquipes(){
  const area = document.getElementById("listaEquipes");
  area.innerHTML = equipes.map(montarCardEquipe).join("");
  document.getElementById("equipesVazio").classList.toggle("oculto", equipes.length > 0);
}

/* ---------- ALOCAÇÃO ---------- */
function adicionarPeloSelect(equipeId){
  const select = document.getElementById(`selectAdd-${equipeId}`);
  const participanteId = Number(select.value);
  if (!participanteId){ mostrarToast("Selecione um participante.", "erro"); return; }
  adicionarNaEquipe(participanteId, equipeId);
}

function adicionarNaEquipe(participanteId, equipeId){
  const participante = getParticipante(participanteId);
  const equipe = getEquipe(equipeId);
  if (!participante || !equipe) return;

  // REGRA: um participante não pode estar em duas equipes ao mesmo tempo
  if (participante.equipeId != null){
    mostrarToast("Esse participante já pertence a uma equipe.", "erro");
    return;
  }
  // REGRA: um participante não pode ocupar duas vagas na mesma equipe
  if (equipe.integrantes.includes(participanteId)){
    mostrarToast("Esse participante já está nessa equipe.", "erro");
    return;
  }
  // REGRA: a equipe não pode ultrapassar sua capacidade máxima
  if (equipe.integrantes.length >= equipe.capacidade){
    mostrarToast("Essa equipe já está completa.", "erro");
    return;
  }

  equipe.integrantes.push(participanteId);
  participante.equipeId = equipeId;

  salvarDados();
  atualizarSistema();
  mostrarToast(`${participante.nome} adicionado à equipe ${equipe.nome}.`, "sucesso");
}

function removerDaEquipe(participanteId, equipeId){
  const equipe = getEquipe(equipeId);
  const participante = getParticipante(participanteId);
  if (!equipe || !participante) return;

  equipe.integrantes = equipe.integrantes.filter(id => id !== participanteId);
  participante.equipeId = null;
  participante.lider = false;

  if (equipe.liderId === participanteId) equipe.liderId = null;

  salvarDados();
  atualizarSistema();
  mostrarToast("Participante removido da equipe.", "sucesso");
}

function transferirParticipante(participanteId, novaEquipeId){
  const participante = getParticipante(participanteId);
  if (!participante) return;

  const equipeAtual = participante.equipeId != null ? getEquipe(participante.equipeId) : null;
  const novaEquipe = getEquipe(novaEquipeId);
  if (!novaEquipe) return;

  // REGRA: não faz sentido "transferir" para a mesma equipe em que já está
  if (equipeAtual && equipeAtual.id === novaEquipe.id) return;

  // REGRA: um participante não pode ocupar duas vagas na mesma equipe
  if (novaEquipe.integrantes.includes(participanteId)){
    mostrarToast("O participante já está nessa equipe.", "erro");
    return;
  }
  // REGRA: a equipe de destino não pode ultrapassar sua capacidade máxima
  if (novaEquipe.integrantes.length >= novaEquipe.capacidade){
    mostrarToast("A equipe de destino está cheia.", "erro");
    return;
  }

  if (equipeAtual){
    equipeAtual.integrantes = equipeAtual.integrantes.filter(id => id !== participanteId);
    if (equipeAtual.liderId === participanteId) equipeAtual.liderId = null;
  }

  novaEquipe.integrantes.push(participanteId);
  participante.equipeId = novaEquipeId;
  participante.lider = false;

  salvarDados();
  atualizarSistema();
  mostrarToast(`${participante.nome} transferido para ${novaEquipe.nome}.`, "sucesso");
}

function definirLider(participanteId, equipeId){
  const equipe = getEquipe(equipeId);
  if (!equipe || !equipe.integrantes.includes(participanteId)) return;

  equipe.integrantes.forEach(id => {
    const p = getParticipante(id);
    if (p) p.lider = false;
  });

  equipe.liderId = participanteId;
  const novoLider = getParticipante(participanteId);
  if (novoLider) novoLider.lider = true;

  salvarDados();
  atualizarSistema();
  mostrarToast(`${novoLider.nome} agora é líder da equipe ${equipe.nome}.`, "sucesso");
}

/* =====================================================
   SEM EQUIPE
===================================================== */
function atualizarSemEquipe(){
  const tabela = document.getElementById("listaSemEquipe");
  const livres = participantes.filter(p => p.equipeId == null);

  tabela.innerHTML = livres.map(p => `
    <tr>
      <td>${nomeParaHtml(p.nome)}</td>
      <td>${nomeParaHtml(p.habilidade)}</td>
    </tr>
  `).join("");

  document.getElementById("semEquipeVazio").classList.toggle("oculto", livres.length > 0);
}

/* =====================================================
   ESTATÍSTICAS
===================================================== */
let graficoHabilidades, graficoEquipes;

function gerarEstatisticasHabilidades(){
  const habilidades = {};
  participantes.forEach(p => {
    habilidades[p.habilidade] = (habilidades[p.habilidade] || 0) + 1;
  });
  return habilidades;
}

function atualizarGraficos(){
  const canvasHabilidades = document.getElementById("graficoHabilidades");
  const canvasEquipes = document.getElementById("graficoEquipes");
  if (!canvasHabilidades || !canvasEquipes || typeof Chart === "undefined") return;

  const dadosHabilidades = gerarEstatisticasHabilidades();
  if (graficoHabilidades) graficoHabilidades.destroy();
  graficoHabilidades = new Chart(canvasHabilidades, {
    type: "doughnut",
    data: {
      labels: Object.keys(dadosHabilidades),
      datasets: [{
        data: Object.values(dadosHabilidades),
        backgroundColor: ["#4338ca", "#8b5cf6", "#06b6d4", "#fb7185", "#d97706", "#22c55e"]
      }]
    },
    options: { plugins: { legend: { position: "bottom" } } }
  });

  if (graficoEquipes) graficoEquipes.destroy();
  graficoEquipes = new Chart(canvasEquipes, {
    type: "bar",
    data: {
      labels: equipes.map(e => e.nome),
      datasets: [{
        label: "Integrantes",
        data: equipes.map(e => e.integrantes.length),
        backgroundColor: "#4338ca",
        borderRadius: 6
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

/* =====================================================
   EXPORTAÇÃO
===================================================== */
function baixarArquivo(conteudo, nomeArquivo, tipoMime){
  const arquivo = new Blob([conteudo], { type: tipoMime });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportarCSV(){
  let csv = "Nome,Habilidade,Equipe\n";
  participantes.forEach(p => {
    const equipe = p.equipeId != null ? getEquipe(p.equipeId) : null;
    csv += `"${p.nome}","${p.habilidade}","${equipe ? equipe.nome : "Sem equipe"}"\n`;
  });
  baixarArquivo(csv, "participantes.csv", "text/csv");
  mostrarToast("CSV de participantes exportado.", "sucesso");
}

function exportarEquipesCSV(){
  let csv = "Equipe,Capacidade,Integrantes\n";
  equipes.forEach(e => {
    const nomes = e.integrantes.map(id => getParticipante(id)?.nome).filter(Boolean).join(" | ");
    csv += `"${e.nome}",${e.capacidade},"${nomes}"\n`;
  });
  baixarArquivo(csv, "equipes.csv", "text/csv");
  mostrarToast("CSV de equipes exportado.", "sucesso");
}

function exportarPDF(){
  if (!window.jspdf){ mostrarToast("Não foi possível gerar o PDF.", "erro"); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("Lista de Participantes", 20, 20);

  let y = 35;
  pdf.setFontSize(12);
  participantes.forEach((p, index) => {
    const equipe = p.equipeId != null ? getEquipe(p.equipeId) : null;
    pdf.text(`${index + 1}. ${p.nome} | ${p.habilidade} | ${equipe ? equipe.nome : "Sem equipe"}`, 20, y);
    y += 9;
    if (y > 280){ pdf.addPage(); y = 20; }
  });

  pdf.save("participantes.pdf");
  mostrarToast("PDF de participantes criado.", "sucesso");
}

function exportarEquipesPDF(){
  if (!window.jspdf){ mostrarToast("Não foi possível gerar o PDF.", "erro"); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("Equipes do Evento", 20, 20);

  let y = 35;
  equipes.forEach(e => {
    pdf.setFontSize(13);
    pdf.text(`${e.nome} (${e.integrantes.length}/${e.capacidade})`, 20, y);
    y += 9;
    pdf.setFontSize(11);
    e.integrantes.forEach(id => {
      const p = getParticipante(id);
      if (p){ pdf.text(`- ${p.nome}`, 28, y); y += 7; }
    });
    y += 8;
    if (y > 270){ pdf.addPage(); y = 20; }
  });

  pdf.save("equipes.pdf");
  mostrarToast("PDF de equipes criado.", "sucesso");
}

/* =====================================================
   VALIDAÇÃO / INTEGRIDADE DOS DADOS
===================================================== */
function validarSistema(){
  // REGRA: participante não pode apontar para uma equipe que não existe mais
  participantes.forEach(p => {
    if (p.equipeId != null && !getEquipe(p.equipeId)) p.equipeId = null;
  });

  equipes.forEach(e => {
    // REGRA: um participante não pode ocupar duas vagas na mesma equipe (remove duplicatas)
    e.integrantes = [...new Set(e.integrantes)];

    // remove integrantes que não existem mais na base de participantes
    e.integrantes = e.integrantes.filter(id => getParticipante(id));

    // REGRA: a equipe nunca pode ultrapassar sua capacidade máxima
    if (e.integrantes.length > e.capacidade){
      e.integrantes = e.integrantes.slice(0, e.capacidade);
    }

    if (e.liderId != null && !e.integrantes.includes(e.liderId)) e.liderId = null;
  });

  // REGRA: um participante não pode estar em duas equipes ao mesmo tempo —
  // se aparecer em mais de uma lista de integrantes, mantém só a primeira
  const jaAlocado = new Set();
  equipes.forEach(e => {
    e.integrantes = e.integrantes.filter(id => {
      if (jaAlocado.has(id)) return false;
      jaAlocado.add(id);
      return true;
    });
  });

  // sincroniza participante.equipeId com a equipe em que ele realmente está
  participantes.forEach(p => {
    const equipeReal = equipes.find(e => e.integrantes.includes(p.id));
    p.equipeId = equipeReal ? equipeReal.id : null;
    if (!equipeReal) p.lider = false;
  });

  salvarDados();
}

/* =====================================================
   NAVEGAÇÃO MOBILE
===================================================== */
function configurarMenuMobile(){
  const sidebar = document.getElementById("sidebar");
  const botao = document.getElementById("menuToggle");
  botao.addEventListener("click", () => sidebar.classList.toggle("aberta"));

  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("aberta");
      document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("ativo"));
      link.classList.add("ativo");
    });
  });
}

/* =====================================================
   ATUALIZAÇÃO GERAL
===================================================== */
function atualizarSistema(){
  atualizarParticipantes();
  atualizarEquipes();
  atualizarSemEquipe();
  atualizarDashboard();
  atualizarCarrossel();
  atualizarGraficos();
}

/* =====================================================
   EVENTOS E INICIALIZAÇÃO
===================================================== */
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("pesquisaParticipante").addEventListener("input", atualizarParticipantes);
  document.getElementById("filtroHabilidade").addEventListener("change", atualizarParticipantes);
  document.getElementById("filtroSituacao").addEventListener("change", atualizarParticipantes);

  configurarMenuMobile();
  validarSistema();
  atualizarSistema();
});