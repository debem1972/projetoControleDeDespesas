// Função para salvar os dados da tabela (não necessária com IndexedDB)
function salvarDadosTabela() {
    // Não é mais necessário salvar o HTML da tabela no localStorage
    // Os dados são gerenciados diretamente no IndexedDB
}

// Função para carregar os dados da tabela do IndexedDB
function carregarDadosTabela() {
    let tabela = document.getElementById("tabela");
    let tbody = tabela.querySelector('tbody');
    tbody.innerHTML = ''; // Limpa o tbody, mantendo o thead
    getAllExpenses().then(despesas => {
        despesas.forEach(despesa => {
            let linha = tbody.insertRow();
            // Adiciona o ID da despesa como atributo data-id para rastrear no IndexedDB
            linha.setAttribute('data-id', despesa.id);
            linha.insertCell().innerHTML = despesa.data;
            linha.insertCell().innerHTML = despesa.descricao;
            linha.insertCell().innerHTML = despesa.valor;
            linha.insertCell().innerHTML = despesa.parcelas;
            linha.insertCell().innerHTML = despesa.valorParcela;
            linha.insertCell().innerHTML = despesa.tipo;
            linha.insertCell().innerHTML = despesa.mesFatura;
            linha.insertCell().innerHTML = despesa.status;
            // Calcula a forma de pagamento se não existir no objeto
            let formaPagamento = despesa.formaPagamento || determinarFormaPagamento(despesa.parcelas, despesa.status);
            linha.insertCell().innerHTML = formaPagamento;
        });
        atualizarTotal(); // Atualiza o total após carregar os dados
    }).catch(err => {
        console.error("Erro ao carregar dados da tabela: ", err);
        window.alert("Erro ao carregar os dados. Verifique o console para detalhes.");
    });
}

// Elementos do DOM
const btnDeletarLinha = document.getElementById('btnDeletarLinha');
const btnSelecionarTodas = document.getElementById('btnSelecionarTodas');
const contadorSelecao = document.getElementById('contadorSelecao');
const tabela = document.getElementById('tabela');

let modoSelecao = false;
let linhasSelecionadas = new Set();

// Função para mostrar feedback visual
function mostrarFeedback(mensagem, tipo) {
    // Remove qualquer feedback existente
    const feedbackExistente = document.querySelector('.feedback-toast');
    if (feedbackExistente) {
        feedbackExistente.remove();
    }

    // Cria novo elemento de feedback
    const feedback = document.createElement('div');
    feedback.className = `feedback-toast ${tipo}`;
    feedback.textContent = mensagem;
    document.body.appendChild(feedback);

    // Mostra o feedback
    setTimeout(() => feedback.classList.add('show'), 100);

    // Remove o feedback após 3 segundos
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

// Função para atualizar o contador de seleção
function atualizarContador() {
    contadorSelecao.textContent = `${linhasSelecionadas.size} linha(s) selecionada(s)`;
    contadorSelecao.style.display = modoSelecao ? 'inline-flex' : 'none';
}

// Função para alternar seleção de uma linha
function alternarSelecaoLinha(linha) {
    if (!linha.closest('thead')) {
        if (linha.classList.contains('linha-selecionada')) {
            linha.classList.remove('linha-selecionada');
            linhasSelecionadas.delete(linha);
        } else {
            linha.classList.add('linha-selecionada');
            linhasSelecionadas.add(linha);
        }
        atualizarContador();
    }
}

// Função para iniciar modo de seleção
function iniciarModoSelecao() {
    modoSelecao = true;
    linhasSelecionadas.clear();
    atualizarContador();

    // Adiciona classe hover em todas as linhas do tbody
    /* Array.from(tabela.querySelectorAll('tbody tr')).forEach(tr => {
         tr.classList.add('linha-hover');
     });*/

    mostrarFeedback('Clique nas linhas que deseja excluir', 'success');
    btnDeletarLinha.textContent = 'Confirmar Exclusão';
    btnDeletarLinha.style.backgroundColor = '#f44336';
    btnDeletarLinha.classList.add('btn-pulse');
    btnSelecionarTodas.style.display = 'inline';

    // Adiciona botão de cancelar
    const btnCancelar = document.createElement('button');
    btnCancelar.id = 'btnCancelarDelecao';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.onclick = finalizarModoSelecao;
    btnCancelar.style.backgroundColor = '#9e9e9e';
    btnCancelar.style.color = 'white';
    btnCancelar.style.padding = '10px 20px';
    btnCancelar.style.border = 'none';
    btnCancelar.style.borderRadius = '5px';
    btnCancelar.style.cursor = 'pointer';
    btnCancelar.style.transition = 'background-color 0.3s';
    btnCancelar.style.minWidth = '120px';
    btnCancelar.addEventListener('mouseover', () => {
        btnCancelar.style.backgroundColor = '#757575';
    });
    btnCancelar.addEventListener('mouseout', () => {
        btnCancelar.style.backgroundColor = '#9e9e9e';
    });

    btnDeletarLinha.parentNode.insertBefore(btnCancelar, btnDeletarLinha.nextSibling);
}

// Função para finalizar modo de seleção
function finalizarModoSelecao(mostrarMensagemCancelamento = true) {
    modoSelecao = false;

    // Remove classe hover de todas as linhas
    Array.from(tabela.querySelectorAll('tbody tr')).forEach(tr => {
        //tr.classList.remove('linha-hover');
        tr.classList.remove('linha-selecionada');
    });

    linhasSelecionadas.clear();
    atualizarContador();
    btnDeletarLinha.textContent = 'Deletar linhas';
    btnDeletarLinha.style.backgroundColor = '';
    btnDeletarLinha.classList.remove('btn-pulse');
    btnSelecionarTodas.style.display = 'none';

    // Remove o botão de cancelar
    const btnCancelar = document.getElementById('btnCancelarDelecao');
    if (btnCancelar) {
        btnCancelar.remove();
    }

    if (mostrarMensagemCancelamento) {
        mostrarFeedback('Operação cancelada', 'success');
    }
}

// Função para excluir linhas selecionadas
async function excluirLinhasSelecionadas() {
    if (linhasSelecionadas.size === 0) {
        mostrarFeedback('Nenhuma linha selecionada', 'error');
        return;
    }

    const confirmacao = confirm(`Deseja realmente excluir ${linhasSelecionadas.size} linha(s)?`);
    if (confirmacao) {
        btnDeletarLinha.classList.remove('btn-pulse'); // Remove a animação ao confirmar
        try {
            for (const linha of linhasSelecionadas) {
                const id = parseInt(linha.getAttribute('data-id'));
                await deleteExpense(id);
                linha.remove();
            }

            mostrarFeedback(`${linhasSelecionadas.size} linha(s) excluída(s) com sucesso`, 'success');
            finalizarModoSelecao(false); // Não mostra mensagem de cancelamento
            atualizarTotal();
        } catch (error) {
            console.error('Erro ao excluir linhas:', error);
            mostrarFeedback('Erro ao excluir algumas linhas', 'error');
        }
    }
}

// Event Listeners
btnDeletarLinha.addEventListener('click', () => {
    if (!modoSelecao) {
        iniciarModoSelecao();
    } else {
        excluirLinhasSelecionadas();
    }
});

btnSelecionarTodas.addEventListener('click', () => {
    const todasLinhas = Array.from(tabela.querySelectorAll('tbody tr'));
    const todasSelecionadas = todasLinhas.every(tr => tr.classList.contains('linha-selecionada'));

    todasLinhas.forEach(tr => {
        if (todasSelecionadas) {
            tr.classList.remove('linha-selecionada');
            linhasSelecionadas.delete(tr);
        } else {
            tr.classList.add('linha-selecionada');
            linhasSelecionadas.add(tr);
        }
    });

    atualizarContador();
});

tabela.addEventListener('click', (event) => {
    if (modoSelecao) {
        const linha = event.target.closest('tr');
        if (linha) {
            alternarSelecaoLinha(linha);
        }
    }
});

// Inicialização
btnSelecionarTodas.style.display = 'none';
contadorSelecao.style.display = 'none';

// Função para atualizar o total das compras visíveis
function atualizarTotal() {
    let totalCompras = 0;
    getAllExpenses().then(despesas => {
        despesas.forEach(despesa => {
            // Converte o valorParcela para número, removendo o formato monetário
            let valorNumerico = parseFloat(despesa.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
            if (!isNaN(valorNumerico)) {
                totalCompras += valorNumerico;
            }
        });
        // Formata o total como moeda e atualiza no HTML
        let totalFormatado = totalCompras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById("calcTotalCompras").innerHTML = totalFormatado;
    }).catch(err => {
        console.error("Erro ao atualizar total: ", err);
        window.alert("Erro ao calcular o total. Verifique o console.");
    });
}

// Carrega os dados da tabela do IndexedDB ao carregar a página
window.addEventListener('load', carregarDadosTabela);