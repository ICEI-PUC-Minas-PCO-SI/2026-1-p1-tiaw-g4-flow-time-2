let usuarios = [];
let usuarioAtual = null;

let tempo = 0;
let intervalo = null;

let tempoFoco = 0;
let tempoPausa = 0;

let modo = 'foco';
let ciclos = 0;


const radius = 120;
const circumference = 2 * Math.PI * radius;

const circle = document.querySelector('.progress');

if (circle) {
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = 0;
}


function atualizarDisplay() {

    let minutos = Math.floor(tempo / 60);

    let segundos = tempo % 60;

    segundos =
        segundos < 10
            ? '0' + segundos
            : segundos;

    const timerEl =
        document.getElementById('timer');

    if (timerEl) {

        timerEl.textContent =
            `${minutos}:${segundos}`;
    }

    // animação SVG
    if (circle) {

        // escolhe automaticamente qual tempo usar
        const tempoTotal =
            modo === 'foco'
                ? tempoFoco
                : tempoPausa;

        const progresso =
            tempo / tempoTotal;

        const offset =
            circumference * (1 - progresso);

        circle.style.strokeDashoffset =
            offset;
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

            tempo = calcularPausaLonga();

        } else {

            modo = 'pausa';

            tempo = tempoPausa;
        }

    } else {

        modo = 'foco';

        tempo = tempoFoco;
    }

    atualizarDisplay();
}

function calcularPausaLonga() {

    return tempoPausa * 2;
}

async function carregarUsuarios() {

    try {

        const resposta =
            await fetch('../../../db/db.json')
            //fetch('/usuarios') no backend real usar essa rota

            if (!resposta.ok) {

            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );
        }

        const dados =
            await resposta.json();

        usuarios =
            dados.usuarios.filter(
                u => u.tipo === 'usuario'
            );

        preencherSelectUsuarios();

        

    } catch (erro) {

        console.log(
            'Erro ao carregar usuários:',
            erro
        );
    }
}

function preencherSelectUsuarios() {

    const select =
        document.getElementById(
            'usuarioSelect'
        );

    select.innerHTML = '';

    const optionInicial =
    document.createElement('option');

    optionInicial.textContent =
    'Selecione um usuário';

    optionInicial.value = '';

    optionInicial.selected = true;

    optionInicial.disabled = true;

    select.appendChild(optionInicial);

    usuarios.forEach((usuario, index) => {

        const option =
            document.createElement('option');

        option.value = index;

        option.textContent =
            usuario.nome;

        select.appendChild(option);
    });

    // evento de troca
    select.addEventListener(
        'change',
        trocarUsuario
    );
}

function trocarUsuario(evento) {

    const optionInicial =
    document.querySelector(
        '#usuarioSelect option[value=""]'
    );

    if (optionInicial) {

    optionInicial.remove();
    }

    const index =
        evento.target.value;

    if (index === '') return;

    usuarioAtual =
        usuarios[index];

    configurarPomodoro(usuarioAtual);
}

function configurarPomodoro(usuario) {

    tempoFoco =
        usuario.pomodoro.foco * 60;

    tempoPausa =
        usuario.pomodoro.pausa * 60;

    tempo = tempoFoco;

    modo = 'foco';

    pausar();

    atualizarDisplay();
}

carregarUsuarios();
