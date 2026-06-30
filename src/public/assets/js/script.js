const MAPA_CATEGORIAS = {
    "1": { nome: "Trabalho", corBg: "#ECEFF1", corTxt: "#455A64" },
    "2": { nome: "Estudos", corBg: "#ECEFF1", corTxt: "#455A64" },
    "3": { nome: "Saúde", corBg: "#ECEFF1", corTxt: "#455A64" },
    "4": { nome: "Lazer", corBg: "#ECEFF1", corTxt: "#455A64" },
    "5": { nome: "Outros", corBg: "#ECEFF1", corTxt: "#455A64" }
};
const MAPA_PRIORIDADES = {
    "1": { nome: "Prioridade Alta", corBg: "#FFEBEE", corTxt: "#C62828" },
    "2": { nome: "Prioridade Média", corBg: "#FFF3E0", corTxt: "#EF6C00" },
    "3": { nome: "Prioridade Baixa", corBg: "#E8F5E9", corTxt: "#2E7D32" }
};

const FRASES_MOTIVACIONAIS = [
    '"A persistência realiza o impossível."', '"Foque no progresso, não na perfeição."', '"O segredo de progredir é começar."',
    '"Pequenos passos todos os dias levam a grandes conquistas."', '"Não espere o momento perfeito, faça o momento ser perfeito."',
    '"A disciplina é a ponte entre metas e realizações."', '"Um pomodoro de cada vez e o semestre se resolve!"',
    '"Seu futuro é criado pelo que você faz hoje, não amanhã."', '"A energia que você investe hoje é a sua nota de amanhã."',
    '"Descanse quando estiver cansado, mas nunca desista."'
];

const SAUDACOES_ALEATORIAS = [
    "Que bom te ver por aqui!", "Pronto para focar e render?", "Vamos fazer acontecer hoje!",
    "Mais um dia de vitórias!", "O sucesso é a soma de pequenos esforços.", "Que seu dia seja super produtivo."
];

let idEmEdicao = null;

// =========================================================================
// INICIALIZAÇÃO E CONTROLE DE SESSÃO
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Validador de Acesso de Elite: Expulsa quem não tá logado (menos na tela de login claro)
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const urlAtual = window.location.pathname;
    if (!usuarioLogado && !urlAtual.includes('login.html')) {
        window.location.href = '../login/login.html';
        return;
    }

    const btnMenu = document.querySelector('.header-global img[alt="Menu"]');
    if (btnMenu) btnMenu.addEventListener('click', () => { window.location.href = '../menu/index.html'; });

    const btnPerfilList = document.querySelectorAll('.header-global img[alt="Perfil"]');
    btnPerfilList.forEach(btn => { btn.addEventListener('click', () => { window.location.href = '../perfil/perfil.html'; }); });

    const elementoSaudacao = document.querySelector('.faixa-cumprimento');
    if (elementoSaudacao && usuarioLogado) {
        const primeiroNome = usuarioLogado.nome.split(' ')[0];
        const saudacaoSorteada = SAUDACOES_ALEATORIAS[Math.floor(Math.random() * SAUDACOES_ALEATORIAS.length)];
        elementoSaudacao.textContent = `Olá, ${primeiroNome}! ${saudacaoSorteada}`;
    }

    const elemFrase = document.getElementById('fraseMotivacionalHome');
    if (elemFrase) elemFrase.textContent = FRASES_MOTIVACIONAIS[Math.floor(Math.random() * FRASES_MOTIVACIONAIS.length)];

    if (document.querySelector('.campo-tarefa') && !document.getElementById('editNome')) {
        let idTransferido = localStorage.getItem('id_em_edicao');
        if (idTransferido) { editarTarefa(idTransferido); localStorage.removeItem('id_em_edicao'); } 
        else { let dataTransferida = localStorage.getItem('data_pre_agendamento'); if (dataTransferida) { let inputDataEl = document.querySelector('input[placeholder="00/00/0000"]'); if (inputDataEl) inputDataEl.value = dataTransferida; localStorage.removeItem('data_pre_agendamento'); } }
    }

    if (document.getElementById('daysGrid')) {
        renderCalendar();
        const hoje = new Date(); if (hoje.getFullYear() === currentYear && hoje.getMonth() === currentMonth) { diaSelecionado = hoje.getDate(); atualizarRodapeTarefas(diaSelecionado); }
    }

    if (document.querySelector('.progress-ring')) { inicializarPomodoroOffline(); }
});

// =========================================================================
// MÓDULO 1: AGENDAMENTO (ISOLADO POR USUÁRIO)
// =========================================================================
function alternarCheckbox(tipo) { let caixaAtual = document.getElementById('caixa-' + tipo); let iconeAtual = document.getElementById('icone-' + tipo); let tipoOutro = (tipo === 'semanal') ? 'mensal' : 'semanal'; let caixaOutra = document.getElementById('caixa-' + tipoOutro); let iconeOutro = document.getElementById('icone-' + tipoOutro); if (caixaAtual.classList.contains('ativa')) { caixaAtual.classList.remove('ativa'); iconeAtual.src = '../../assets/images/emptybox.png'; } else { caixaAtual.classList.add('ativa'); iconeAtual.src = '../../assets/images/checkbox.png'; if (caixaOutra.classList.contains('ativa')) { caixaOutra.classList.remove('ativa'); iconeOutro.src = '../../assets/images/emptybox.png'; } } }
function mascaraData(input) { let v = input.value.replace(/\D/g, ''); if (v.length > 8) v = v.slice(0, 8); if (v.length >= 2) { let dia = parseInt(v.substring(0, 2)); if (dia > 31) v = '31' + v.substring(2); } if (v.length >= 4) { let mes = parseInt(v.substring(2, 4)); if (mes > 12) v = v.substring(0, 2) + '12' + v.substring(4); } if (v.length > 4) v = v.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3'); else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,4})/, '$1/$2'); input.value = v; }
function mascaraHora(input) { let v = input.value.replace(/\D/g, ''); if (v.length > 4) v = v.slice(0, 4); if (v.length >= 2) { let hora = parseInt(v.substring(0, 2)); if (hora > 23) v = '23' + v.substring(2); } if (v.length >= 4) { let min = parseInt(v.substring(2, 4)); if (min > 59) v = v.substring(0, 2) + '59'; } if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,2})/, '$1:$2'); input.value = v; }

function salvarAgendamento() {
    let inputTarefa = document.querySelector('.campo-tarefa'); let inputData = document.querySelector('input[placeholder="00/00/0000"]'); let inputHora = document.querySelector('input[placeholder="00:00"]'); let selectCategoria = document.getElementById('categoria'); let selectPrioridade = document.getElementById('prioridade'); let repeticaoSemanal = document.getElementById('caixa-semanal').classList.contains('ativa'); let repeticaoMensal = document.getElementById('caixa-mensal').classList.contains('ativa');

    let erro = false;
    [inputTarefa, inputData, inputHora].forEach(input => { if (!input || input.value.trim() === "") { if (input) input.parentElement.classList.add('campo-erro'); erro = true; } else { if (input) input.parentElement.classList.remove('campo-erro'); } });
    [selectCategoria, selectPrioridade].forEach(select => { if (!select || select.value === "") { if (select) select.classList.add('campo-erro'); erro = true; } else { if (select) select.classList.remove('campo-erro'); } });
    if (erro) return; 

    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    let dadosSalvos = localStorage.getItem('tarefas');
    let objetoLista = dadosSalvos ? JSON.parse(dadosSalvos) : [];
    let partesData = inputData.value.split('/');
    let dataPadraoISO = `${partesData[2]}-${partesData[1]}-${partesData[0]}T${inputHora.value}:00`;

    let novaTarefa = {
        id: idEmEdicao ? idEmEdicao : Date.now().toString(), 
        usuario_id: usuarioLogado.id, // VINCULAÇÃO ABSOLUTA AO ID DO USUÁRIO
        prioridade_id: selectPrioridade.value, categoria_id: selectCategoria.value,
        nome: inputTarefa.value, data_hora: dataPadraoISO,
        repeticao_semanal: repeticaoSemanal, repeticao_mensal: repeticaoMensal
    };

    if (idEmEdicao) { let index = objetoLista.findIndex(t => t.id === idEmEdicao); if (index !== -1) objetoLista[index] = novaTarefa; idEmEdicao = null; } 
    else { objetoLista.push(novaTarefa); }

    localStorage.setItem('tarefas', JSON.stringify(objetoLista));
    window.location.href = '../calendario/calendario.html';
}

function editarTarefa(id) {
    let dadosSalvos = localStorage.getItem('tarefas'); let objetoLista = JSON.parse(dadosSalvos) || []; let t = objetoLista.find(item => item.id === id);
    if (t) {
        document.querySelector('.campo-tarefa').value = t.nome; let d = t.data_hora.split('T')[0].split('-'); let inputData = document.querySelector('input[placeholder="00/00/0000"]'); if(inputData) inputData.value = `${d[2]}/${d[1]}/${d[0]}`; let inputHora = document.querySelector('input[placeholder="00:00"]'); if(inputHora) inputHora.value = t.data_hora.split('T')[1].substring(0, 5);
        document.getElementById('categoria').value = t.categoria_id; document.getElementById('prioridade').value = t.prioridade_id; document.getElementById('caixa-semanal').classList.remove('ativa'); document.getElementById('icone-semanal').src = '../../assets/images/emptybox.png'; document.getElementById('caixa-mensal').classList.remove('ativa'); document.getElementById('icone-mensal').src = '../../assets/images/emptybox.png';
        if (t.repeticao_semanal) alternarCheckbox('semanal'); if (t.repeticao_mensal) alternarCheckbox('mensal');
        idEmEdicao = id; document.querySelector('.botao-agendar').textContent = "ATUALIZAR";
    }
}

// =========================================================================
// MÓDULO 2: CALENDÁRIO E RODAPÉ (FILTRO MULTI-TENANT)
// =========================================================================
let currentYear = 2026, currentMonth = 5, diaSelecionado = null;

function irParaAgendamentoComDia() { if (diaSelecionado) { let diaFmt = diaSelecionado < 10 ? '0' + diaSelecionado : diaSelecionado; let mesFmt = (currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1); localStorage.setItem('data_pre_agendamento', `${diaFmt}/${mesFmt}/${currentYear}`); } window.location.href = '../agendamento/agendamento.html'; }
function transferirParaEdicao(id) { localStorage.setItem('id_em_edicao', id); window.location.href = '../agendamento/agendamento.html'; }
function filtrarRodape() { if (diaSelecionado) { atualizarRodapeTarefas(diaSelecionado); } }

function obterTarefasDoDia(ano, mes, dia) {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return [];

    const loop = new Date(ano, mes, dia);
    const lista = JSON.parse(localStorage.getItem('tarefas')) || [];
    return lista.filter(t => {
        if (t.usuario_id !== usuarioLogado.id) return false; // SÓ LÊ AS TAREFAS DESTE USUÁRIO!
        if (!t.data_hora) return false;
        const ag = new Date(t.data_hora); const mDia = ag.getFullYear() === ano && ag.getMonth() === mes && ag.getDate() === dia; const mSem = t.repeticao_semanal && ag.getDay() === loop.getDay() && loop >= ag; const mMes = t.repeticao_mensal && ag.getDate() === dia && loop >= ag;
        return mDia || mSem || mMes;
    });
}

function renderCalendar() {
    const grid = document.getElementById('daysGrid'); if (!grid) return;
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]; document.getElementById('monthDisplay').innerText = `${meses[currentMonth]} ${currentYear}`; grid.innerHTML = '';
    const primeiroDia = new Date(currentYear, currentMonth, 1).getDay(); const totalDias = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i=0; i<primeiroDia; i++) grid.innerHTML += `<div class="day empty"></div>`;
    for (let d=1; d<=totalDias; d++) { const div = document.createElement('div'); div.className = 'day'; div.innerText = d; if (obterTarefasDoDia(currentYear, currentMonth, d).length > 0) div.classList.add('has-event'); if (d === diaSelecionado) div.classList.add('selected'); div.addEventListener('click', () => { const ant = grid.querySelector('.selected'); if (ant) ant.classList.remove('selected'); div.classList.add('selected'); diaSelecionado = d; atualizarRodapeTarefas(d); }); grid.appendChild(div); }
}

function atualizarRodapeTarefas(dia) {
    diaSelecionado = dia; const div = document.getElementById('taskList'); if (!div) return; document.getElementById('agendaTitle').innerText = `TAREFAS DO DIA ${dia}/${currentMonth + 1}`;
    let lista = obterTarefasDoDia(currentYear, currentMonth, dia);
    const filtroCat = document.getElementById('filtroCategoriaRodape'); const filtroPri = document.getElementById('filtroPrioridadeRodape');
    if (filtroCat && filtroCat.value !== "") { lista = lista.filter(item => item.categoria_id === filtroCat.value); } if (filtroPri && filtroPri.value !== "") { lista = lista.filter(item => item.prioridade_id === filtroPri.value); }
    div.innerHTML = '';
    if (lista.length === 0) { div.innerHTML = '<p style="text-align:center; font-size:13px; color:#95b8b1; font-style:italic; margin-top:10px;">Nenhuma tarefa encontrada.</p>'; return; }
    lista.forEach(item => { const c = MAPA_CATEGORIAS[item.categoria_id] || MAPA_CATEGORIAS["5"]; const p = MAPA_PRIORIDADES[item.prioridade_id] || MAPA_PRIORIDADES["3"]; const h = item.data_hora.split('T')[1].substring(0,5); div.innerHTML += ` <div class="card-tarefa-rodape"> <div class="card-tarefa-topo"> <div class="card-tarefa-info"><span class="rodape-hora">${h}</span><span class="rodape-titulo">${item.nome}</span></div> <div class="card-tarefa-botoes"><button class="btn-acao-mini" onclick="transferirParaEdicao('${item.id}')" title="Editar">✏️</button><button class="btn-acao-mini" onclick="deletarTarefa('${item.id}')" title="Excluir">🗑️</button></div> </div> <div class="rodape-badges"><span class="badge" style="background:${c.corBg}; color:${c.corTxt};">${c.nome}</span><span class="badge" style="background:${p.corBg}; color:${p.corTxt};">${p.nome}</span></div> </div>`; });
}

function deletarTarefa(id) { let lista = JSON.parse(localStorage.getItem('tarefas')) || []; localStorage.setItem('tarefas', JSON.stringify(lista.filter(t => t.id !== id))); renderCalendar(); atualizarRodapeTarefas(diaSelecionado); }
if (document.getElementById('prevMonth')) { document.getElementById('prevMonth').addEventListener('click', () => { currentMonth--; if(currentMonth<0){currentMonth=11;currentYear--;} renderCalendar(); }); document.getElementById('nextMonth').addEventListener('click', () => { currentMonth++; if(currentMonth>11){currentMonth=0;currentYear++;} renderCalendar(); }); }

// =========================================================================
// MÓDULO 3: POMODORO ISOLADO POR USUÁRIO
// =========================================================================
let tempoPomodoro = 0, intervaloPomodoro = null, tempoFocoPomodoro = 25*60, tempoPausaPomodoro = 5*60, modoPomodoro = 'foco';

function inicializarPomodoroOffline() {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    let cfgSalva = localStorage.getItem(`pomodoro_cfg_${usuarioLogado.id}`); // LÊ A CHAVE ESPECÍFICA DESTE USUÁRIO
    
    if (cfgSalva) { let dados = JSON.parse(cfgSalva); tempoFocoPomodoro = dados.foco * 60; tempoPausaPomodoro = dados.pausa * 60; let selectEl = document.getElementById('tempoFoco'); if (selectEl) selectEl.value = dados.foco.toString(); }
    tempoPomodoro = tempoFocoPomodoro; renderDisplayPomodoro();

    const btnSalvar = document.getElementById('btnSalvarTempo');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', () => {
            const selectEl = document.getElementById('tempoFoco'); if (!selectEl) return;
            const novoFocoMin = parseInt(selectEl.value); const novaPausaMin = Math.round(novoFocoMin * 0.20); 
            tempoFocoPomodoro = novoFocoMin * 60; tempoPausaPomodoro = novaPausaMin * 60; tempoPomodoro = (modoPomodoro === 'foco') ? tempoFocoPomodoro : tempoPausaPomodoro;
            
            localStorage.setItem(`pomodoro_cfg_${usuarioLogado.id}`, JSON.stringify({ foco: novoFocoMin, pausa: novaPausaMin })); 
            
            pausarPomodoro(); renderDisplayPomodoro();
            const textoOriginal = btnSalvar.textContent; btnSalvar.textContent = "Salvo! ✔️"; btnSalvar.style.backgroundColor = "#41d09a"; btnSalvar.style.color = "#ffffff"; setTimeout(() => { btnSalvar.textContent = textoOriginal; btnSalvar.style.backgroundColor = ""; btnSalvar.style.color = ""; }, 1500);
        });
    }
}

function iniciarPomodoro() { if (intervaloPomodoro) return; intervaloPomodoro = setInterval(() => { if (tempoPomodoro > 0) { tempoPomodoro--; renderDisplayPomodoro(); } else { pausarPomodoro(); modoPomodoro = (modoPomodoro === 'foco') ? 'pausa' : 'foco'; tempoPomodoro = (modoPomodoro === 'foco') ? tempoFocoPomodoro : tempoPausaPomodoro; mostrarToastPomodoro(`Ciclo concluído! Hora da ${modoPomodoro.toUpperCase()}`); renderDisplayPomodoro(); } }, 1000); }
function pausarPomodoro() { clearInterval(intervaloPomodoro); intervaloPomodoro = null; }
function pularPomodoro() { pausarPomodoro(); modoPomodoro = (modoPomodoro === 'foco') ? 'pausa' : 'foco'; tempoPomodoro = (modoPomodoro === 'foco') ? tempoFocoPomodoro : tempoPausaPomodoro; renderDisplayPomodoro(); }
function renderDisplayPomodoro() { let min = Math.floor(tempoPomodoro / 60), seg = tempoPomodoro % 60; const timerEl = document.getElementById('timer'); if (timerEl) timerEl.textContent = `${min}:${seg < 10 ? '0' + seg : seg}`; const circle = document.querySelector('.progress'); if (circle) { const radius = circle.r.baseVal.value; const circumference = 2 * Math.PI * radius; circle.style.strokeDasharray = circumference; const tempoTotal = (modoPomodoro === 'foco') ? tempoFocoPomodoro : tempoPausaPomodoro; circle.style.strokeDashoffset = circumference * (1 - (tempoPomodoro / tempoTotal)); } }
function mostrarToastPomodoro(mensagem) { const container = document.querySelector('.app-container'); if (!container) return; const toast = document.createElement('div'); toast.className = 'toast-pomodoro'; toast.innerText = mensagem; container.appendChild(toast); setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 3000); }