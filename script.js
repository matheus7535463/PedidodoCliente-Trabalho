/* ==========================================================
   HACKATHON MANAGER
   SCRIPT.JS
   ========================================================== */

/* ==========================================================
   ESTADO DA APLICAÇÃO
   ========================================================== */

const App = {

    participantes: [],

    equipes: [],

    participanteEditando: null,

    equipeEditando: null,

    modalCallback: null,

    charts: {

        habilidades: null,

        equipes: null

    }

};

/* ==========================================================
   CONSTANTES
   ========================================================== */

const STORAGE = {

    participantes: "hackathon_participantes",

    equipes: "hackathon_equipes"

};

const DEFAULT_AVATAR =

"data:image/svg+xml;utf8," +

encodeURIComponent(`

<svg xmlns="http://www.w3.org/2000/svg"

width="120"

height="120">

<rect width="100%" height="100%" fill="#ececec"/>

<circle cx="60" cy="42" r="22" fill="#bdbdbd"/>

<path d="M20 108c5-24 26-36 40-36s35 12 40 36"

fill="#bdbdbd"/>

</svg>

`);

/* ==========================================================
   HELPERS
   ========================================================== */

const $ = selector => document.querySelector(selector);

const $$ = selector => [...document.querySelectorAll(selector)];

/* ==========================================================
   INICIALIZAÇÃO
   ========================================================== */

document.addEventListener("DOMContentLoaded", iniciarSistema);

function iniciarSistema(){

    carregarDados();

    configurarEventos();

    atualizarTudo();

}

/* ==========================================================
   EVENTOS
   ========================================================== */

function configurarEventos(){

    /* Participantes */

    $("#btnSalvarParticipante")
        ?.addEventListener("click", salvarParticipante);

    $("#btnCancelarParticipante")
        ?.addEventListener("click", cancelarEdicaoParticipante);

    /* Equipes */

    $("#btnSalvarEquipe")
        ?.addEventListener("click", salvarEquipe);

    $("#btnCancelarEquipe")
        ?.addEventListener("click", cancelarEdicaoEquipe);

    /* Pesquisa */

    $("#pesquisaParticipante")
        ?.addEventListener("input", atualizarListaParticipantes);

    /* Filtros */

    $("#filtroHabilidade")
        ?.addEventListener("change", atualizarListaParticipantes);

    $("#filtroSituacao")
        ?.addEventListener("change", atualizarListaParticipantes);

    /* Uploads */

    $("#fotoParticipante")
        ?.addEventListener("change", previewFotoParticipante);

    $("#logoEquipe")
        ?.addEventListener("change", previewLogoEquipe);

    /* Menu */

    $("#menuToggle")
        ?.addEventListener("click", alternarMenu);

}

/* ==========================================================
   STORAGE
   ========================================================== */

function carregarDados(){

    App.participantes =

        JSON.parse(

            localStorage.getItem(STORAGE.participantes)

        ) || [];

    App.equipes =

        JSON.parse(

            localStorage.getItem(STORAGE.equipes)

        ) || [];

}

function salvarDados(){

    localStorage.setItem(

        STORAGE.participantes,

        JSON.stringify(App.participantes)

    );

    localStorage.setItem(

        STORAGE.equipes,

        JSON.stringify(App.equipes)

    );

}

/* ==========================================================
   ATUALIZAÇÃO GERAL
   ========================================================== */

function atualizarTudo(){

    atualizarDashboard();

    atualizarListaParticipantes();

    atualizarListaEquipes();

    atualizarSemEquipe();

    atualizarGraficos();

    atualizarFiltros();

}

/* ==========================================================
   MENU
   ========================================================== */

function alternarMenu(){

    $("#sidebar")

        ?.classList.toggle("open");

}

/* ==========================================================
   VALIDAÇÃO
   ========================================================== */

const REGEX = {

    nome: /^[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)*$/,

};

/* ==========================================================
   VALIDAR NOME
   ========================================================== */

function validarNome(nome){

    nome = nome.trim();

    if(nome.length === 0){

        return{

            valido:false,

            mensagem:"O nome é obrigatório."

        };

    }

    if(!REGEX.nome.test(nome)){

        return{

            valido:false,

            mensagem:"Utilize apenas letras e espaços."

        };

    }

    if(nome === nome.toUpperCase()){

        return{

            valido:false,

            mensagem:"Não utilize o nome totalmente em letras maiúsculas."

        };

    }

    if(nome === nome.toLowerCase()){

        return{

            valido:false,

            mensagem:"O nome deve começar com letra maiúscula."

        };

    }

    const palavras = nome.split(" ");

    for(const palavra of palavras){

        if(palavra[0] !== palavra[0].toUpperCase()){

            return{

                valido:false,

                mensagem:"Cada palavra deve iniciar com letra maiúscula."

            };

        }

    }

    return{

        valido:true,

        mensagem:""

    };

}

/* ==========================================================
   MOSTRAR ERRO
   ========================================================== */

function mostrarErro(campo,mensagem){

    campo.classList.remove("input-valid");

    campo.classList.add("input-invalid");

    const erro =

        campo.parentElement.querySelector(".field-error");

    if(erro){

        erro.textContent = mensagem;

    }

}

/* ==========================================================
   LIMPAR ERRO
   ========================================================== */

function limparErro(campo){

    campo.classList.remove("input-invalid");

    campo.classList.add("input-valid");

    const erro =

        campo.parentElement.querySelector(".field-error");

    if(erro){

        erro.textContent = "";

    }

}

/* ==========================================================
   VALIDAR EM TEMPO REAL
   ========================================================== */

function configurarValidacoes(){

    const campos = [

        $("#nome"),

        $("#nomeEquipe")

    ];

    campos.forEach(campo=>{

        if(!campo) return;

        campo.addEventListener("input",()=>{

            const resultado =

                validarNome(campo.value);

            if(resultado.valido){

                limparErro(campo);

            }else{

                mostrarErro(

                    campo,

                    resultado.mensagem

                );

            }

        });

    });

}

/* ==========================================================
   VALIDAÇÃO FINAL
   ========================================================== */

function validarFormularioParticipante(){

    const campo = $("#nome");

    const resultado =

        validarNome(campo.value);

    if(!resultado.valido){

        mostrarErro(

            campo,

            resultado.mensagem

        );

        campo.focus();

        return false;

    }

    return true;

}

function validarFormularioEquipe(){

    const campo = $("#nomeEquipe");

    const resultado =

        validarNome(campo.value);

    if(!resultado.valido){

        mostrarErro(

            campo,

            resultado.mensagem

        );

        campo.focus();

        return false;

    }

    return true;

}
 
/* ==========================================================
   PARTICIPANTES
   ========================================================== */

function salvarParticipante(){

    if(!validarFormularioParticipante()){

        return;

    }

    const nome = $("#nome").value.trim();

    const habilidade = $("#habilidade").value.trim();

    const foto = $("#previewParticipante")?.src || DEFAULT_AVATAR;

    /* Evita participantes duplicados */

    const duplicado = App.participantes.find((participante,index)=>{

        if(App.participanteEditando !== null){

            if(index === App.participanteEditando){

                return false;

            }

        }

        return participante.nome.toLowerCase() === nome.toLowerCase();

    });

    if(duplicado){

        mostrarToast("Já existe um participante com esse nome.","erro");

        mostrarErro($("#nome"),"Nome já cadastrado.");

        return;

    }

    const participante = {

        id: crypto.randomUUID(),

        nome,

        habilidade,

        equipe:null,

        foto

    };

    if(App.participanteEditando === null){

        App.participantes.push(participante);

        mostrarToast("Participante cadastrado.");

    }else{

        participante.id =

            App.participantes[App.participanteEditando].id;

        participante.equipe =

            App.participantes[App.participanteEditando].equipe;

        App.participantes[App.participanteEditando] = participante;

        App.participanteEditando = null;

        $("#btnSalvarParticipante").innerHTML =

        `<i class="fa-solid fa-plus"></i> Cadastrar`;

        $("#btnCancelarParticipante")

            ?.classList.add("hidden");

        mostrarToast("Participante atualizado.");

    }

    salvarDados();

    atualizarTudo();

    limparFormularioParticipante();

}

/* ==========================================================
   LIMPAR FORMULÁRIO
   ========================================================== */

function limparFormularioParticipante(){

    $("#nome").value = "";

    $("#habilidade").value = "";

    limparErro($("#nome"));

    if($("#previewParticipante")){

        $("#previewParticipante").src = DEFAULT_AVATAR;

    }

}

/* ==========================================================
   EDITAR
   ========================================================== */

function editarParticipante(id){

    const indice =

        App.participantes.findIndex(

            participante=>participante.id===id

        );

    if(indice<0){

        return;

    }

    const participante = App.participantes[indice];

    App.participanteEditando = indice;

    $("#nome").value = participante.nome;

    $("#habilidade").value = participante.habilidade;

    if($("#previewParticipante")){

        $("#previewParticipante").src =

            participante.foto || DEFAULT_AVATAR;

    }

    $("#btnSalvarParticipante").innerHTML=

    `<i class="fa-solid fa-floppy-disk"></i> Salvar alterações`;

    $("#btnCancelarParticipante")

        ?.classList.remove("hidden");

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}

/* ==========================================================
   CANCELAR EDIÇÃO
   ========================================================== */

function cancelarEdicaoParticipante(){

    App.participanteEditando = null;

    limparFormularioParticipante();

    $("#btnSalvarParticipante").innerHTML=

    `<i class="fa-solid fa-plus"></i> Cadastrar`;

    $("#btnCancelarParticipante")

        ?.classList.add("hidden");

}

/* ==========================================================
   EXCLUIR
   ========================================================== */

function excluirParticipante(id){

    const participante =

        App.participantes.find(

            p=>p.id===id

        );

    if(participante.equipe){

        mostrarToast(

            "Remova o participante da equipe antes de excluí-lo.",

            "erro"

        );

        return;

    }

    abrirModal(

        "Excluir participante",

        `Deseja realmente excluir ${participante.nome}?`,

        ()=>{

            App.participantes =

                App.participantes.filter(

                    participante=>participante.id!==id

                );

            salvarDados();

            atualizarTudo();

            mostrarToast(

                "Participante removido."

            );

        }

    );

}

/* ==========================================================
   EQUIPES
   ========================================================== */

function salvarEquipe() {

    if (!validarFormularioEquipe()) {
        return;
    }

    const nome = $("#nomeEquipe").value.trim();

    const capacidade = Number($("#capacidade").value);

    const logo = $("#previewEquipe")?.src || DEFAULT_AVATAR;

    if (capacidade <= 0) {

        mostrarToast(
            "A capacidade deve ser maior que zero.",
            "erro"
        );

        return;
    }

    /* Evita equipes duplicadas */

    const duplicada = App.equipes.find((equipe, index) => {

        if (App.equipeEditando !== null) {

            if (index === App.equipeEditando) {

                return false;

            }

        }

        return equipe.nome.toLowerCase() === nome.toLowerCase();

    });

    if (duplicada) {

        mostrarErro(
            $("#nomeEquipe"),
            "Já existe uma equipe com esse nome."
        );

        return;

    }

    const equipe = {

        id: crypto.randomUUID(),

        nome,

        capacidade,

        logo,

        lider: null,

        integrantes: []

    };

    /* ---------- NOVA EQUIPE ---------- */

    if (App.equipeEditando === null) {

        App.equipes.push(equipe);

        mostrarToast("Equipe criada.");

    }

    /* ---------- EDIÇÃO ---------- */

    else {

        const antiga = App.equipes[App.equipeEditando];

        /* NÃO permite reduzir abaixo da quantidade atual */

        if (capacidade < antiga.integrantes.length) {

            mostrarToast(

                "A capacidade não pode ser menor que a quantidade de integrantes.",

                "erro"

            );

            return;

        }

        equipe.id = antiga.id;

        equipe.integrantes = antiga.integrantes;

        equipe.lider = antiga.lider;

        App.equipes[App.equipeEditando] = equipe;

        App.equipeEditando = null;

        $("#btnSalvarEquipe").innerHTML =
            `<i class="fa-solid fa-plus"></i> Criar Equipe`;

        $("#btnCancelarEquipe")
            ?.classList.add("hidden");

        mostrarToast("Equipe atualizada.");

    }

    salvarDados();

    atualizarTudo();

    limparFormularioEquipe();

}

/* ==========================================================
   LIMPAR FORMULÁRIO
   ========================================================== */

function limparFormularioEquipe() {

    $("#nomeEquipe").value = "";

    $("#capacidade").value = "";

    limparErro($("#nomeEquipe"));

    if ($("#previewEquipe")) {

        $("#previewEquipe").src = DEFAULT_AVATAR;

    }

}

/* ==========================================================
   EDITAR
   ========================================================== */

function editarEquipe(id) {

    const indice =

        App.equipes.findIndex(

            equipe => equipe.id === id

        );

    if (indice < 0) {

        return;

    }

    const equipe = App.equipes[indice];

    App.equipeEditando = indice;

    $("#nomeEquipe").value = equipe.nome;

    $("#capacidade").value = equipe.capacidade;

    if ($("#previewEquipe")) {

        $("#previewEquipe").src =

            equipe.logo || DEFAULT_AVATAR;

    }

    $("#btnSalvarEquipe").innerHTML =

        `<i class="fa-solid fa-floppy-disk"></i> Salvar alterações`;

    $("#btnCancelarEquipe")

        ?.classList.remove("hidden");

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ==========================================================
   CANCELAR EDIÇÃO
   ========================================================== */

function cancelarEdicaoEquipe() {

    App.equipeEditando = null;

    limparFormularioEquipe();

    $("#btnSalvarEquipe").innerHTML =

        `<i class="fa-solid fa-plus"></i> Criar Equipe`;

    $("#btnCancelarEquipe")

        ?.classList.add("hidden");

}

/* ==========================================================
   EXCLUIR
   ========================================================== */

function excluirEquipe(id) {

    const equipe =

        App.equipes.find(

            equipe => equipe.id === id

        );

    if (equipe.integrantes.length > 0) {

        mostrarToast(

            "Não é possível excluir uma equipe que possui integrantes.",

            "erro"

        );

        return;

    }

    abrirModal(

        "Excluir equipe",

        `Deseja realmente excluir ${equipe.nome}?`,

        () => {

            App.equipes =

                App.equipes.filter(

                    equipe => equipe.id !== id

                );

            salvarDados();

            atualizarTudo();

            mostrarToast(

                "Equipe removida."

            );

        }

    );

}

/* ==========================================================
   ALOCAÇÃO DE PARTICIPANTES
   ========================================================== */

function adicionarParticipanteEquipe(participanteId, equipeId) {

    const participante = App.participantes.find(
        p => p.id === participanteId
    );

    const equipe = App.equipes.find(
        e => e.id === equipeId
    );

    if (!participante || !equipe) return;

    /* Participante já pertence a uma equipe */

    if (participante.equipe !== null) {

        mostrarToast(
            "Este participante já pertence a uma equipe.",
            "erro"
        );

        return;

    }

    /* Equipe cheia */

    if (equipe.integrantes.length >= equipe.capacidade) {

        mostrarToast(
            "A equipe atingiu sua capacidade máxima.",
            "erro"
        );

        return;

    }

    equipe.integrantes.push(participante.id);

    participante.equipe = equipe.id;

    /* Primeiro integrante vira líder automaticamente */

    if (!equipe.lider) {

        equipe.lider = participante.id;

    }

    salvarDados();

    atualizarTudo();

    mostrarToast("Participante adicionado.");

}

/* ==========================================================
   REMOVER PARTICIPANTE
   ========================================================== */

function removerParticipanteEquipe(participanteId) {

    const participante = App.participantes.find(
        p => p.id === participanteId
    );

    if (!participante) return;

    const equipe = App.equipes.find(
        e => e.id === participante.equipe
    );

    if (!equipe) return;

    equipe.integrantes =
        equipe.integrantes.filter(
            id => id !== participanteId
        );

    participante.equipe = null;

    /* Atualiza líder */

    if (equipe.lider === participanteId) {

        equipe.lider = equipe.integrantes[0] || null;

    }

    salvarDados();

    atualizarTudo();

    mostrarToast("Participante removido da equipe.");

}

/* ==========================================================
   TRANSFERÊNCIA
   ========================================================== */

function transferirParticipante(participanteId, novaEquipeId) {

    const participante = App.participantes.find(
        p => p.id === participanteId
    );

    if (!participante) return;

    const equipeAtual = App.equipes.find(
        e => e.id === participante.equipe
    );

    const novaEquipe = App.equipes.find(
        e => e.id === novaEquipeId
    );

    if (!novaEquipe) return;

    if (novaEquipe.integrantes.length >= novaEquipe.capacidade) {

        mostrarToast(
            "A equipe de destino está cheia.",
            "erro"
        );

        return;

    }

    /* Remove da antiga */

    if (equipeAtual) {

        equipeAtual.integrantes =
            equipeAtual.integrantes.filter(
                id => id !== participante.id
            );

        if (equipeAtual.lider === participante.id) {

            equipeAtual.lider =
                equipeAtual.integrantes[0] || null;

        }

    }

    /* Adiciona na nova */

    novaEquipe.integrantes.push(participante.id);

    participante.equipe = novaEquipe.id;

    if (!novaEquipe.lider) {

        novaEquipe.lider = participante.id;

    }

    salvarDados();

    atualizarTudo();

    mostrarToast("Participante transferido.");

}

/* ==========================================================
   DEFINIR LÍDER
   ========================================================== */

function definirLider(equipeId, participanteId) {

    const equipe = App.equipes.find(
        e => e.id === equipeId
    );

    if (!equipe) return;

    if (!equipe.integrantes.includes(participanteId)) {

        mostrarToast(
            "O participante não pertence à equipe.",
            "erro"
        );

        return;

    }

    equipe.lider = participanteId;

    salvarDados();

    atualizarTudo();

    mostrarToast("Líder atualizado.");

}

/* ==========================================================
   VAGAS DISPONÍVEIS
   ========================================================== */

function vagasDisponiveis(equipe) {

    return equipe.capacidade - equipe.integrantes.length;

}

function equipeCompleta(equipe) {

    return equipe.integrantes.length >= equipe.capacidade;

}

/* ==========================================================
   RENDERIZAÇÃO
   ========================================================== */

function atualizarListaParticipantes() {

    const tbody = $("#listaParticipantes");

    if (!tbody) return;

    tbody.innerHTML = "";

    const pesquisa = ($("#pesquisaParticipante")?.value || "")
        .trim()
        .toLowerCase();

    const habilidade = $("#filtroHabilidade")?.value || "";

    const situacao = $("#filtroSituacao")?.value || "todos";

    let participantes = [...App.participantes];

    /* Pesquisa */

    if (pesquisa) {

        participantes = participantes.filter(p =>
            p.nome.toLowerCase().includes(pesquisa)
        );

    }

    /* Habilidade */

    if (habilidade) {

        participantes = participantes.filter(p =>
            p.habilidade === habilidade
        );

    }

    /* Situação */

    if (situacao === "comEquipe") {

        participantes = participantes.filter(p =>
            p.equipe !== null
        );

    }

    if (situacao === "semEquipe") {

        participantes = participantes.filter(p =>
            p.equipe === null
        );

    }

    $("#participantesVazio")
        ?.classList.toggle(
            "hidden",
            participantes.length !== 0
        );

    participantes.forEach(participante => {

        const equipe = App.equipes.find(
            e => e.id === participante.equipe
        );

        tbody.insertAdjacentHTML("beforeend", `

<tr>

<td>

<img
src="${participante.foto || DEFAULT_AVATAR}"
class="avatar">

</td>

<td>

<strong>${participante.nome}</strong>

</td>

<td>

${participante.habilidade || "-"}

</td>

<td>

${equipe ? equipe.nome : "Sem equipe"}

</td>

<td>

<span class="badge ${equipe ? "success" : "warning"}">

${equipe ? "Alocado" : "Disponível"}

</span>

</td>

<td>

<button
onclick="editarParticipante('${participante.id}')">

<i class="fa-solid fa-pen"></i>

</button>

<button
onclick="excluirParticipante('${participante.id}')">

<i class="fa-solid fa-trash"></i>

</button>

</td>

</tr>

`);

    });

}

/* ==========================================================
   SEM EQUIPE
   ========================================================== */

function atualizarSemEquipe() {

    const tbody = $("#listaSemEquipe");

    if (!tbody) return;

    tbody.innerHTML = "";

    const livres =

        App.participantes.filter(

            participante => participante.equipe === null

        );

    $("#semEquipeVazio")
        ?.classList.toggle(
            "hidden",
            livres.length !== 0
        );

    livres.forEach(participante => {

        tbody.insertAdjacentHTML("beforeend", `

<tr>

<td>

<img
src="${participante.foto || DEFAULT_AVATAR}"
class="avatar">

</td>

<td>

${participante.nome}

</td>

<td>

${participante.habilidade}

</td>

</tr>

`);

    });

}

/* ==========================================================
   EQUIPES
   ========================================================== */

function atualizarListaEquipes() {

    const container = $("#listaEquipes");

    if (!container) return;

    container.innerHTML = "";

    $("#equipesVazio")
        ?.classList.toggle(
            "hidden",
            App.equipes.length !== 0
        );

    App.equipes.forEach(equipe => {

        const integrantes =

            equipe.integrantes.map(id =>

                App.participantes.find(
                    participante => participante.id === id
                )

            ).filter(Boolean);

        container.insertAdjacentHTML("beforeend", `

<article class="team-card">

<div class="team-header">

<img
src="${equipe.logo || DEFAULT_AVATAR}"
class="team-logo">

<div class="team-info">

<h3>

${equipe.nome}

</h3>

<span>

${integrantes.length}/${equipe.capacidade} integrantes

</span>

</div>

</div>

<div class="team-members">

${integrantes.map(p => `

<div class="team-member">

<img
src="${p.foto || DEFAULT_AVATAR}">

<div>

<strong>${p.nome}</strong>

<br>

<small>${p.habilidade}</small>

</div>

</div>

`).join("")}

</div>

<div class="team-actions">

<button onclick="editarEquipe('${equipe.id}')">

<i class="fa-solid fa-pen"></i>

Editar

</button>

<button onclick="excluirEquipe('${equipe.id}')">

<i class="fa-solid fa-trash"></i>

Excluir

</button>

</div>

</article>

`);

    });

}

/* ==========================================================
   DASHBOARD
   ========================================================== */

function atualizarDashboard() {

    const totalParticipantes = App.participantes.length;

    const totalEquipes = App.equipes.length;

    const equipesCompletas =
        App.equipes.filter(e => equipeCompleta(e)).length;

    const equipesComVagas =
        App.equipes.filter(e => !equipeCompleta(e)).length;

    const semEquipe =
        App.participantes.filter(p => p.equipe === null).length;

    $("#totalParticipantes").textContent = totalParticipantes;
    $("#totalEquipes").textContent = totalEquipes;
    $("#equipesCompletas").textContent = equipesCompletas;
    $("#equipesComVagas").textContent = equipesComVagas;
    $("#semEquipeTotal").textContent = semEquipe;

}

/* ==========================================================
   FILTROS
   ========================================================== */

function atualizarFiltros(){

    const select=$("#filtroHabilidade");

    if(!select) return;

    const atual=select.value;

    const habilidades=[
        ...new Set(
            App.participantes
            .map(p=>p.habilidade)
            .filter(Boolean)
        )
    ].sort();

    select.innerHTML="<option value=''>Todas as habilidades</option>";

    habilidades.forEach(h=>{

        select.innerHTML+=`
        <option value="${h}">
            ${h}
        </option>`;

    });

    select.value=atual;

}

/* ==========================================================
   TOAST
   ========================================================== */

let toastTimer;

function mostrarToast(texto,tipo="sucesso"){

    const toast=$("#toast");

    if(!toast) return;

    clearTimeout(toastTimer);

    toast.textContent=texto;

    toast.className="show";

    if(tipo==="erro"){

        toast.style.background="#b71c1c";

    }else{

        toast.style.background="#111";

    }

    toastTimer=setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

/* ==========================================================
   MODAL
   ========================================================== */

function abrirModal(titulo,mensagem,callback){

    $("#modalTitulo").textContent=titulo;

    $("#modalMensagem").textContent=mensagem;

    App.modalCallback=callback;

    $("#modalConfirmacao").showModal();

}

$("#confirmarModal")?.addEventListener(

    "click",

    ()=>{

        $("#modalConfirmacao").close();

        if(App.modalCallback){

            App.modalCallback();

        }

    }

);

$("#cancelarModal")?.addEventListener(

    "click",

    ()=>{

        $("#modalConfirmacao").close();

    }

);

/* ==========================================================
   GRÁFICOS
   ========================================================== */

function atualizarGraficos(){

    atualizarGraficoHabilidades();

    atualizarGraficoEquipes();

}

function atualizarGraficoHabilidades(){

    const ctx=$("#graficoHabilidades");

    if(!ctx) return;

    App.charts.habilidades?.destroy();

    const mapa={};

    App.participantes.forEach(p=>{

        mapa[p.habilidade]=(mapa[p.habilidade]||0)+1;

    });

    App.charts.habilidades=new Chart(ctx,{

        type:"bar",

        data:{

            labels:Object.keys(mapa),

            datasets:[{

                data:Object.values(mapa)

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{display:false}

            }

        }

    });

}

function atualizarGraficoEquipes(){

    const ctx=$("#graficoEquipes");

    if(!ctx) return;

    App.charts.equipes?.destroy();

    App.charts.equipes=new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:App.equipes.map(e=>e.nome),

            datasets:[{

                data:App.equipes.map(

                    e=>e.integrantes.length

                )

            }]

        },

        options:{

            responsive:true

        }

    });

}

/* ==========================================================
   EXPORTAÇÃO CSV
   ========================================================== */

function baixarArquivo(nome,texto){

    const blob=new Blob([texto]);

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download=nome;

    a.click();

    URL.revokeObjectURL(url);

}

function exportarCSV(){

    let csv="Nome,Habilidade,Equipe\n";

    App.participantes.forEach(p=>{

        const equipe=App.equipes.find(

            e=>e.id===p.equipe

        );

        csv+=`${p.nome},${p.habilidade},${equipe?equipe.nome:"Sem equipe"}\n`;

    });

    baixarArquivo(

        "participantes.csv",

        csv

    );

}

function exportarEquipesCSV(){

    let csv="Equipe,Capacidade,Integrantes\n";

    App.equipes.forEach(e=>{

        csv+=`${e.nome},${e.capacidade},${e.integrantes.length}\n`;

    });

    baixarArquivo(

        "equipes.csv",

        csv

    );

}

/* ==========================================================
   EXPORTAÇÃO PDF
   ========================================================== */

function exportarPDF(){

    const pdf=new jspdf.jsPDF();

    pdf.text(

        "Lista de Participantes",

        15,

        20

    );

    let y=35;

    App.participantes.forEach(p=>{

        pdf.text(

            `${p.nome} - ${p.habilidade}`,

            15,

            y

        );

        y+=8;

    });

    pdf.save("participantes.pdf");

}

function exportarEquipesPDF(){

    const pdf=new jspdf.jsPDF();

    pdf.text(

        "Lista de Equipes",

        15,

        20

    );

    let y=35;

    App.equipes.forEach(e=>{

        pdf.text(

            `${e.nome} (${e.integrantes.length}/${e.capacidade})`,

            15,

            y

        );

        y+=8;

    });

    pdf.save("equipes.pdf");

}