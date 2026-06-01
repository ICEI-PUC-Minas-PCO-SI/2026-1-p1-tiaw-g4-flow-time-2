function alternarCheckbox(tipo) {
    let caixaAtual = document.getElementById('caixa-' + tipo);
    let iconeAtual = document.getElementById('icone-' + tipo);

    let tipoOutro = (tipo === 'semanal') ? 'mensal' : 'semanal';
    let caixaOutra = document.getElementById('caixa-' + tipoOutro);
    let iconeOutro = document.getElementById('icone-' + tipoOutro);

    if (caixaAtual.classList.contains('ativa')) {
        caixaAtual.classList.remove('ativa');
        iconeAtual.src = 'img/emptybox.png';
    } 
    else {
        caixaAtual.classList.add('ativa');
        iconeAtual.src = 'img/checkbox.png';

        if (caixaOutra.classList.contains('ativa')) {
            caixaOutra.classList.remove('ativa');
            iconeOutro.src = 'img/emptybox.png';
        }
    }
}

function mascaraData(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length > 8) {
        valor = valor.slice(0, 8);
    }

    if (valor.length >= 2) {
        let dia = parseInt(valor.substring(0, 2));
        if (dia > 31) {
            valor = '31' + valor.substring(2);
        }
    }
    
    if (valor.length >= 4) {
        let mes = parseInt(valor.substring(2, 4));
        if (mes > 12) {
            valor = valor.substring(0, 2) + '12' + valor.substring(4);
        }
    }

    if (valor.length > 4) {
        valor = valor.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,4})/, '$1/$2');
    }
    
    input.value = valor;
}

function mascaraHora(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length > 4) {
        valor = valor.slice(0, 4);
    }

    if (valor.length >= 2) {
        let hora = parseInt(valor.substring(0, 2));
        if (hora > 23) {
            valor = '23' + valor.substring(2);
        }
    }
    
    if (valor.length >= 4) {
        let minuto = parseInt(valor.substring(2, 4));
        if (minuto > 59) {
            valor = valor.substring(0, 2) + '59';
        }
    }

    if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,2})/, '$1:$2');
    }
    
    input.value = valor;
}

function salvarAgendamento() {
    let inputTarefa = document.querySelector('.campo-tarefa');
    let inputData = document.querySelector('input[placeholder="00/00/0000"]');
    let inputHora = document.querySelector('input[placeholder="00:00"]');
    let selectCategoria = document.getElementById('categoria');
    let selectPrioridade = document.getElementById('prioridade');
    
    let repeticaoSemanal = document.getElementById('caixa-semanal').classList.contains('ativa');
    let repeticaoMensal = document.getElementById('caixa-mensal').classList.contains('ativa');

    let erro = false;
    
    [inputTarefa, inputData, inputHora].forEach(input => {
        if (input.value.trim() === "") {
            input.parentElement.classList.add('campo-erro');
            erro = true;
        } else {
            input.parentElement.classList.remove('campo-erro');
        }
    });

    [selectCategoria, selectPrioridade].forEach(select => {
        if (select.value === "") {
            select.classList.add('campo-erro');
            erro = true;
        } else {
            select.classList.remove('campo-erro');
        }
    });

    if (erro) {
        alert("Preencha todos os campos obrigatórios!");
        return; 
    }

    let dadosSalvos = localStorage.getItem('db_tarefas');
    let objetoJSON = dadosSalvos ? JSON.parse(dadosSalvos) : { "tarefas": [] };

    let proximoId = "1"; 
    if (objetoJSON.tarefas.length > 0) {
        let ultimoItem = objetoJSON.tarefas[objetoJSON.tarefas.length - 1];
        proximoId = (parseInt(ultimoItem.id) + 1).toString();
    }

    let partesData = inputData.value.split('/');
    let dataPadraoInternacional = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
    let horaComSegundos = `${inputHora.value}:00`;

    let novaTarefa = {
        id: proximoId, 
        usuario_id: "1",
        prioridade_id: selectPrioridade.value,
        categoria_id: selectCategoria.value,
        nome: inputTarefa.value,
        data_hora: `${dataPadraoInternacional}T${horaComSegundos}`,
        repeticao_semanal: repeticaoSemanal,
        repeticao_mensal: repeticaoMensal
    };

    objetoJSON.tarefas.push(novaTarefa);
    localStorage.setItem('db_tarefas', JSON.stringify(objetoJSON));

    alert("Tarefa agendada com sucesso!");
    location.reload();
}