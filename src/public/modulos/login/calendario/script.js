
const dadosIniciais = [
    { "id": "1", "nome": "Revisar matéria", "data_hora": "2026-05-10T19:00:00", "repeticao_semanal": true, "repeticao_mensal": false},
    { "id": "2", "nome": "Consulta Médica", "data_hora": "2026-05-29T17:30:00", "repeticao_semanal": false, "repeticao_mensal": true},
    { "id": "3", "nome": "Organizar setup do computador", "data_hora": "2026-05-20T07:00:00", "repeticao_semanal": false, "repeticao_mensal": false}
];


if (!localStorage.getItem('agendamentos_flowtime')) {
    localStorage.setItem('agendamentos_flowtime', JSON.stringify(dadosIniciais));
}


const gerenciadorDados = {
    carregarTarefas: () => {
        const dados = localStorage.getItem('agendamentos_flowtime');
        return dados ? JSON.parse(dados) : dadosIniciais;
    },
    buscarFeriados: async (ano) => {
        try {
            const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
            return await resposta.json();
        } catch (e) {
            console.error("Erro ao buscar API de feriados:", e);
            return [];
        }
    }
};

let agendamentos = gerenciadorDados.carregarTarefas();
let feriados = []; 

const monthDisplay = document.getElementById('monthDisplay');
const daysGrid = document.getElementById('daysGrid');
const taskList = document.getElementById('taskList');
const agendaTitle = document.getElementById('agendaTitle');

let currentYear = 2026;
let currentMonth = 4;

async function init() {
    feriados = await gerenciadorDados.buscarFeriados(currentYear);
    renderCalendar();
}

function obterTarefasDoDia(ano, mes, dia) {
    const dataAtualLoop = new Date(ano, mes, dia);
    return agendamentos.filter(ag => {
        const d = new Date(ag.data_hora);
        const mesmoDia = d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === dia;
        const mesmoDiaSemana = ag.repeticao_semanal && d.getDay() === dataAtualLoop.getDay() && dataAtualLoop >= d;
        const mesmaDataDoMes = ag.repeticao_mensal && d.getDate() === dia && dataAtualLoop >= d;
        return mesmoDia || mesmoDiaSemana || mesmaDataDoMes;
    });
}

function atualizarRodapeTarefas(dia) {
    agendaTitle.innerText = `TAREFAS DO DIA ${dia}/${currentMonth + 1}`;
    taskList.innerHTML = '';
    
    const tarefas = obterTarefasDoDia(currentYear, currentMonth, dia);
    
  
    const feriado = feriados.find(f => {
        const dataFeriado = new Date(f.date + 'T00:00:00');
        return dataFeriado.getDate() === dia && dataFeriado.getMonth() === currentMonth;
    });

    if (feriado) {
        taskList.innerHTML += `<p style="color: #FFD700;">★ <strong>Feriado:</strong> ${feriado.name}</p>`;
    }

    if (tarefas.length === 0 && !feriado) {
        taskList.innerHTML += '<p>Nenhuma tarefa agendada!</p>';
    } else {
        tarefas.forEach(t => {
            const hora = new Date(t.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            taskList.innerHTML += `<p><strong>${hora}</strong> - ${t.nome}</p>`;
        });
    }
}

function renderCalendar() {
    daysGrid.innerHTML = '';
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    monthDisplay.innerText = `${months[currentMonth]} ${currentYear}`;
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    for (let i = 0; i < firstDay; i++) daysGrid.appendChild(document.createElement('div'));

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerText = day;
        
        
        const temFeriado = feriados.find(f => {
            const dataFeriado = new Date(f.date + 'T00:00:00');
            return dataFeriado.getDate() === day && dataFeriado.getMonth() === currentMonth;
        });

        if (obterTarefasDoDia(currentYear, currentMonth, day).length > 0 || temFeriado) {
            dayElement.classList.add('has-event');
        }

        dayElement.addEventListener('click', () => {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
            dayElement.classList.add('selected');
            atualizarRodapeTarefas(day);
        });
        daysGrid.appendChild(dayElement);
    }
}

document.getElementById('prevMonth').addEventListener('click', () => { 
    currentMonth--; 
    if(currentMonth < 0){currentMonth=11; currentYear--} 
    init(); 
});

document.getElementById('nextMonth').addEventListener('click', () => { 
    currentMonth++; 
    if(currentMonth > 11){currentMonth=0; currentYear++} 
    init(); 
});

window.onload = init;