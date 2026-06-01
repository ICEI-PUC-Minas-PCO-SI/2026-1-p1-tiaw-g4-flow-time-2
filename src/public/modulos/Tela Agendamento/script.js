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

    let partesData = inputData.value.split('/');
    let dataPadraoInternacional = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
    let horaComSegundos = `${inputHora.value}:00`;

    if (idEmEdicao) {
        let index = objetoJSON.tarefas.findIndex(t => t.id === idEmEdicao);
        if (index !== -1) {
            objetoJSON.tarefas[index].nome = inputTarefa.value;
            objetoJSON.tarefas[index].data_hora = `${dataPadraoInternacional}T${horaComSegundos}`;
            objetoJSON.tarefas[index].categoria_id = selectCategoria.value;
            objetoJSON.tarefas[index].prioridade_id = selectPrioridade.value;
            objetoJSON.tarefas[index].repeticao_semanal = repeticaoSemanal;
            objetoJSON.tarefas[index].repeticao_mensal = repeticaoMensal;
        }
        idEmEdicao = null;
        document.querySelector('.botao-agendar').textContent = "AGENDAR";
        alert("Tarefa atualizada com sucesso!");
    } else {
        let proximoId = "1"; 
        if (objetoJSON.tarefas.length > 0) {
            let ultimoItem = objetoJSON.tarefas[objetoJSON.tarefas.length - 1];
            proximoId = (parseInt(ultimoItem.id) + 1).toString();
        }

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
        alert("Tarefa agendada com sucesso!");
    }

    localStorage.setItem('db_tarefas', JSON.stringify(objetoJSON));
    
    limparFormulario();
    carregarTarefas();
}

let idEmEdicao = null;

// Função para ler (Read) e exibir as tarefas
function carregarTarefas() {
    let dadosSalvos = localStorage.getItem('db_tarefas');
    let objetoJSON = dadosSalvos ? JSON.parse(dadosSalvos) : { "tarefas": [] };
    let container = document.getElementById('container-tarefas');
    container.innerHTML = '';

    objetoJSON.tarefas.forEach(tarefa => {
        let cartao = document.createElement('div');
        cartao.classList.add('cartao-tarefa');
        
        // Formatando data para exibição
        let dataHora = tarefa.data_hora.split('T');
        let dataSplit = dataHora[0].split('-');
        let dataFormatada = `${dataSplit[2]}/${dataSplit[1]}/${dataSplit[0]}`;
        let horaFormatada = dataHora[1].substring(0, 5);

        // Cartão gerado sem nenhum emoji
        cartao.innerHTML = `
            <div class="info-tarefa">
                <p class="titulo-tarefa">${tarefa.nome}</p>
                <p>Data: ${dataFormatada} | Hora: ${horaFormatada}</p>
            </div>
            <div class="botoes-tarefa">
                <button class="btn-acao btn-editar" onclick="editarTarefa('${tarefa.id}')">Editar</button>
                <button class="btn-acao btn-excluir" onclick="excluirTarefa('${tarefa.id}')">Excluir</button>
            </div>
        `;
        container.appendChild(cartao);
    });
}
window.onload = carregarTarefas;

function excluirTarefa(id) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        let dadosSalvos = localStorage.getItem('db_tarefas');
        let objetoJSON = JSON.parse(dadosSalvos);
        
        objetoJSON.tarefas = objetoJSON.tarefas.filter(t => t.id !== id);
        localStorage.setItem('db_tarefas', JSON.stringify(objetoJSON));
        
        carregarTarefas();
    }
}

function editarTarefa(id) {
    let dadosSalvos = localStorage.getItem('db_tarefas');
    let objetoJSON = JSON.parse(dadosSalvos);
    let tarefa = objetoJSON.tarefas.find(t => t.id === id);

    if(tarefa) {
        document.querySelector('.campo-tarefa').value = tarefa.nome;
        
        let dataHora = tarefa.data_hora.split('T');
        let dataSplit = dataHora[0].split('-');
        let inputData = document.querySelector('input[placeholder="00/00/0000"]');
        inputData.value = `${dataSplit[2]}${dataSplit[1]}${dataSplit[0]}`;
        mascaraData(inputData); 
        
        let inputHora = document.querySelector('input[placeholder="00:00"]');
        inputHora.value = dataHora[1].substring(0, 5).replace(':', '');
        mascaraHora(inputHora); 

        document.getElementById('categoria').value = tarefa.categoria_id;
        document.getElementById('prioridade').value = tarefa.prioridade_id;

        document.getElementById('caixa-semanal').classList.remove('ativa');
        document.getElementById('icone-semanal').src = 'img/emptybox.png';
        document.getElementById('caixa-mensal').classList.remove('ativa');
        document.getElementById('icone-mensal').src = 'img/emptybox.png';

        if(tarefa.repeticao_semanal) alternarCheckbox('semanal');
        if(tarefa.repeticao_mensal) alternarCheckbox('mensal');

        idEmEdicao = id;
        document.querySelector('.botao-agendar').textContent = "ATUALIZAR";
        window.scrollTo(0, 0);
    }
}

function limparFormulario() {
    document.querySelector('.campo-tarefa').value = '';
    document.querySelector('input[placeholder="00/00/0000"]').value = '';
    document.querySelector('input[placeholder="00:00"]').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('prioridade').value = '';
    document.getElementById('caixa-semanal').classList.remove('ativa');
    document.getElementById('icone-semanal').src = 'img/emptybox.png';
    document.getElementById('caixa-mensal').classList.remove('ativa');
    document.getElementById('icone-mensal').src = 'img/emptybox.png';
}