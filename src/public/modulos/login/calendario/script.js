// Simulação dos dados que estarão no seu arquivo JSON
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

// Configuração para Maio 2026 (baseado no seu novo JSON)
let currentYear = 2026;
let currentMonth = 4; // Maio é índice 4 (Janeiro é 0)

function renderCalendar() {
    daysGrid.innerHTML = '';
    
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    monthDisplay.innerText = `${months[currentMonth]} ${currentYear}`;

    // Configurações de data
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 1. Criar espaços vazios para alinhar o primeiro dia da semana
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDiv = document.createElement('div');
        daysGrid.appendChild(emptyDiv);
    }

    // 2. Criar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerText = day;

        // Formata a data atual do loop para comparar com o JSON (YYYY-MM-DD)
        const dataAtualLoop = new Date(currentYear, currentMonth, day);
        
        // 3. Lógica para verificar agendamentos no JSON
        const temAgendamento = dadosAgendamentos.agendamentos.some(agendamento => {
            const dataAgendada = new Date(agendamento.data_hora);
            
            // Verifica se é o dia exato
            const mesmoDia = dataAgendada.getFullYear() === currentYear &&
                             dataAgendada.getMonth() === currentMonth &&
                             dataAgendada.getDate() === day;

            // Lógica de Repetição Semanal
            // Se o agendamento for semanal e cair no mesmo dia da semana (ex: toda segunda)
            // e a data do agendamento for anterior ou igual à data atual do calendário
            const mesmoDiaSemana = dataAgendada.getDay() === dataAtualLoop.getDay();
            const repeticaoAtiva = agendamento.repeticao_semanal && mesmoDiaSemana && dataAtualLoop >= dataAgendada;

            return mesmoDia || repeticaoAtiva;
        });

        if (temAgendamento) {
            dayElement.classList.add('has-event');
        }

        // Exemplo: Destacar o dia 20 como selecionado (conforme o layout original)
        if (day === 20) {
            dayElement.classList.add('selected');
        }

        daysGrid.appendChild(dayElement);
    }
}

// Botões de navegação (opcional, para testar a lógica)
document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
});

renderCalendar();