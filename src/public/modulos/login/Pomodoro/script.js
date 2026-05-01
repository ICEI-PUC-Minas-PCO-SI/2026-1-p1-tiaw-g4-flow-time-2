const radius = 120;
const circumference = 2 * Math.PI * radius;

const circle = document.querySelector('.progress');

if (circle) {
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = 0;
}

let tempo = 25 * 60;
let intervalo = null;

let modo = 'foco';
let ciclos = 0;

const tempos = {
  foco: 25 * 60,
  pausaCurta: 5 * 60,
  pausaLonga: 15 * 60
};


function atualizarDisplay() {
    let minutos = Math.floor(tempo / 60);
    let segundos = tempo % 60;
    segundos = segundos < 10 ? '0' + segundos : segundos;

    const timerEl = document.getElementById('timer');

    if (timerEl) {
        timerEl.textContent = `${minutos}:${segundos}`;
    }

    if (circle) {
        const tempoTotal = tempos[modo] || 1;
        const progresso = tempo / tempoTotal;
        const offset = circumference * (1 - progresso);

        circle.style.strokeDashoffset = offset;

    }
}

function iniciar() {
    if (intervalo) return;

    intervalo = setInterval(() => {
        if (tempo > 0) {
            tempo--;
            atualizarDisplay();
        } else {
            trocarModo();
        }
    }, 1000);
}

function pausar() {
    clearInterval(intervalo);
    intervalo = null;
}

function pular() {
    clearInterval(intervalo);
    intervalo = null;
    trocarModo();
}

function trocarModo() {
    if (modo === 'foco') {
        ciclos++;

        if (ciclos % 4 === 0) {
            modo = 'pausaLonga';
        } else {
            modo = 'pausaCurta';
        }
    } else {
        modo = 'foco';
    }

    tempo = tempos[modo];

    atualizarDisplay();
}
