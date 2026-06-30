// =========================================================================
// MÓDULO DE SEMENTE (SEED / MOCK COM MODO "CAOS": 3 A 4 TAREFAS POR DIA)
// Gatilho Secreto: Duplo clique no título superior das telas
// Segurança: Somente executável pela conta 'admin'
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const titulosSuperiores = document.querySelectorAll('.titulo-header, .faixa-titulo');

    titulosSuperiores.forEach(elemento => {
        // Oculta completamente a dica visual caso não seja o administrador
        const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
        if (usuarioLogado && usuarioLogado.email === "admin") {
            elemento.style.cursor = 'pointer';
            elemento.setAttribute('title', 'Admin: Duplo clique rápido para ejetar dias superlotados');
            
            elemento.addEventListener('dblclick', () => {
                gerarCompromissosModoCaos(elemento);
            });
        }
    });
});

function gerarCompromissosModoCaos(elementoSorteio) {
    // Barreira de segurança final para impedir execução não autorizada
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    if (!usuarioLogado || usuarioLogado.email !== "admin") {
        return; 
    }

    const compromissosReais = [
        "Reunião de Alinhamento e Divisão do TIAW",
        "Estudar Algoritmos e Estrutura de Dados",
        "Revisão de Código e Commits no GitHub",
        "Jogar Tiny Epic Pirates com a Amanda",
        "Almoço especial com a Vó Fofa e o Teu",
        "Finalizar a documentação do Relatório Final",
        "Ir para a academia focar em cardio e saúde",
        "Pausa para café e bolo de chocolate",
        "Preparar apresentação de slides para a banca",
        "Assistir novos episódios de anime na Crunchyroll",
        "Organizar as prateleiras e a mesa de estudos",
        "Fazer simulado de Cálculo para a prova"
    ];

    const totalDiasOcupados = Math.floor(Math.random() * 3) + 6;
    const diasEscolhidos = [];

    while (diasEscolhidos.length < totalDiasOcupados) {
        const candidato = Math.floor(Math.random() * 30) + 1;
        if (!diasEscolhidos.includes(candidato)) {
            diasEscolhidos.push(candidato);
        }
    }

    diasEscolhidos.sort((a, b) => a - b);

    const novaMassaDeDados = [];
    let contadorId = 0;

    diasEscolhidos.forEach(dia => {
        const diaString = dia < 10 ? '0' + dia : dia;
        const compromissosNesteDia = Math.random() > 0.5 ? 3 : 4;

        const turnosDoDia = [
            { min: 8, max: 10 },   
            { min: 11, max: 13 },  
            { min: 14, max: 17 },  
            { min: 18, max: 20 }   
        ];

        turnosDoDia.sort(() => Math.random() - 0.5);

        for (let i = 0; i < compromissosNesteDia; i++) {
            const turno = turnosDoDia[i]; 
            const nomeSorteado = compromissosReais[Math.floor(Math.random() * compromissosReais.length)];
            const horaSorteada = Math.floor(Math.random() * (turno.max - turno.min + 1)) + turno.min;
            const minutoSorteado = Math.random() > 0.5 ? "00" : "30";
            const horaString = horaSorteada < 10 ? '0' + horaSorteada : horaSorteada;
            const categoriaSorteada = (Math.floor(Math.random() * 5) + 1).toString();
            const prioridadeSorteada = (Math.floor(Math.random() * 3) + 1).toString();
            const repeticaoSem = Math.random() > 0.90; 

            const dataHoraISO = `2026-06-${diaString}T${horaString}:${minutoSorteado}:00`;

            novaMassaDeDados.push({
                id: `seed_${Date.now()}_${contadorId++}`,
                usuario_id: usuarioLogado.id, // O administrador também gera tarefas atreladas ao seu próprio ID
                nome: nomeSorteado,
                data_hora: dataHoraISO,
                categoria_id: categoriaSorteada,
                prioridade_id: prioridadeSorteada,
                repeticao_semanal: repeticaoSem,
                repeticao_mensal: false
            });
        }
    });

    let dbTarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    dbTarefas = dbTarefas.filter(t => t.usuario_id !== usuarioLogado.id);
    dbTarefas = dbTarefas.concat(novaMassaDeDados);
    
    localStorage.setItem('tarefas', JSON.stringify(dbTarefas));

    if (typeof renderCalendar === 'function') {
        renderCalendar();
        let diaParaExibir = diasEscolhidos[0]; 
        atualizarRodapeTarefas(diaParaExibir);
    }

    if (elementoSorteio) {
        const textoOriginal = elementoSorteio.textContent;
        elementoSorteio.textContent = `Massa Gerada (Admin)! 📅`;
        elementoSorteio.style.backgroundColor = "#41d09a";
        elementoSorteio.style.color = "#ffffff";

        setTimeout(() => {
            elementoSorteio.textContent = textoOriginal;
            elementoSorteio.style.backgroundColor = "";
            elementoSorteio.style.color = "";
        }, 2000);
    }
}