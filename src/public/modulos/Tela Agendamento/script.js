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

    if (erro) {
        alert("Ops! Preencha todos os campos obrigatórios.");
        return; 
    }

    // --- PUXANDO OS DADOS ANTES PARA DESCOBRIR O PRÓXIMO ID ---
    let dadosSalvos = localStorage.getItem('db_agendamentos');
    let objetoJSON = dadosSalvos ? JSON.parse(dadosSalvos) : { "agendamentos": [] };

    // --- A LÓGICA DO ID SEQUENCIAL (1, 2, 3...) ---
    let proximoId = "1"; // Começa no 1 se a lista estiver vazia
    if (objetoJSON.agendamentos.length > 0) {
        // Pega o último item da lista
        let ultimoItem = objetoJSON.agendamentos[objetoJSON.agendamentos.length - 1];
        // Transforma o ID dele em número, soma 1, e volta a ser texto
        proximoId = (parseInt(ultimoItem.id) + 1).toString();
    }

    // A MÁGICA DA CONVERSÃO DE DATA
    let partesData = inputData.value.split('/');
    let dataPadraoInternacional = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
    let horaComSegundos = `${inputHora.value}:00`;

    // Criando o agendamento com o ID novo e certinho
    let novoAgendamento = {
        id: proximoId, 
        nome: inputTarefa.value,
        data_hora: `${dataPadraoInternacional}T${horaComSegundos}`,
        repeticao_semanal: repeticaoSemanal,
        repeticao_mensal: repeticaoMensal
    };

    // Adiciona na lista e salva
    objetoJSON.agendamentos.push(novoAgendamento);
    localStorage.setItem('db_agendamentos', JSON.stringify(objetoJSON));

    alert("Agendamento salvo com sucesso!");
    location.reload(); 
}