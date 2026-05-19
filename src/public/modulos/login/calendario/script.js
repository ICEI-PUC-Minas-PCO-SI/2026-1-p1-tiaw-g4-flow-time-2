
const dadosAgendamentos = {
  "agendamentos": [
    {
      "id": "1",
      "nome": "Aula de Inglês",
      "data_hora": "2026-05-10T19:00:00",
      "repeticao_semanal": true,
      "repeticao_mensal": false
    },
    {
      "id": "2",
      "nome": "Fechamento de Caixa",
      "data_hora": "2026-05-29T17:30:00",
      "repeticao_semanal": true,
      "repeticao_mensal": false
    }
  ]
};


const monthDisplay = document.getElementById('monthDisplay');
const daysGrid = document.getElementById('daysGrid');
const taskList = document.getElementById('taskList');
const agendaTitle = document.getElementById('agendaTitle');


let currentYear = 2026;
let currentMonth = 4; // Maio é índice 4 (Janeiro é 0)
let diaSelecionado = null; // Guarda o dia que o usuário clicou


function obterTarefasDoDia(ano, mes, dia) {
    const dataAtualLoop = new Date(ano, mes, dia);

    return dadosAgendamentos.agendamentos.filter(agendamento => {
        const dataAgendada = new Date(agendamento.data_hora);
        
        
        const mesmoDia = dataAgendada.getFullYear() === ano &&
                         dataAgendada.getMonth() === mes &&
                         dataAgendada.getDate() === dia;

        
        const mesmoDiaSemana = dataAgendada.getDay() === dataAtualLoop.getDay();
        const repeticaoAtiva = agendamento.repeticao_semanal && mesmoDiaSemana && dataAtualLoop >= dataAgendada;

        return mesmoDia || repeticaoAtiva;
    });
}


function atualizarRodapeTarefas(dia) {
    
    agendaTitle.innerText = `TAREFAS DO DIA ${dia}/${currentMonth + 1}`;
    taskList.innerHTML = ''; 

    const tarefasDoDia = obterTarefasDoDia(currentYear, currentMonth, dia);

    if (tarefasDoDia.length === 0) {
        taskList.innerHTML = '<p style="font-style: italic; font-size: 14px;">Nenhuma tarefa agendada para hoje!</p>';
    } else {
        
        tarefasDoDia.forEach(tarefa => {
            const hora = new Date(tarefa.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const p = document.createElement('p');
            p.style.fontSize = '15px';
            p.style.marginBottom = '5px';
            p.innerHTML = `<strong>${hora}</strong> - ${tarefa.nome}`;
            taskList.appendChild(p);
        });
    }
}


function renderCalendar() {
    daysGrid.innerHTML = ''; 
    
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    monthDisplay.innerText = `${months[currentMonth]} ${currentYear}`;

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();


    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.style.width = "32px";
        emptyDiv.style.height = "32px";
        daysGrid.appendChild(emptyDiv);
    }

    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerText = day;

        
        const tarefas = obterTarefasDoDia(currentYear, currentMonth, day);
        if (tarefas.length > 0) {
            dayElement.classList.add('has-event');
        }

       
        if (day === diaSelecionado) {
            dayElement.classList.add('selected');
        }

        
        dayElement.addEventListener('click', () => {
        
            const diaAnterior = daysGrid.querySelector('.day.selected');
            if (diaAnterior) {
                diaAnterior.classList.remove('selected');
            }

           
            dayElement.classList.add('selected');
            diaSelecionado = day;

           
            atualizarRodapeTarefas(day);
        });

        daysGrid.appendChild(dayElement);
    }
}


document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    diaSelecionado = null; 
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    diaSelecionado = null; 
    renderCalendar();
});

renderCalendar();