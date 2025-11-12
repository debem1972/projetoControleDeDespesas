// Configurando o input de filtro e busca
const input_busca = document.querySelector('#input-busca');
const tabela_horas = document.querySelector('#tabela');
const btnLimparBusca = document.querySelector('#btnLimparBusca');

input_busca.addEventListener('keyup', function () {
    // Processa os termos de busca, removendo espaços extras e filtrando termos vazios
    let expressoes = input_busca.value.toLowerCase().split(' ').map(exp => exp.trim()).filter(exp => exp !== '');
    console.log("Termos de busca:", expressoes);

    // Se não houver termos de busca, restaura a tabela original e recalcula o total
    if (expressoes.length === 0) {
        getAllExpenses().then(despesas => {
            preencherTabela(despesas);
            somaComprasTotal();
        });
        return;
    }

    // Obtém todas as despesas do IndexedDB
    getAllExpenses().then(despesas => {
        console.log("Total de despesas no banco:", despesas.length);

        // Filtra as despesas com base nos termos de busca
        let despesasFiltradas = despesas.filter(despesa => {
            // Concatena todos os campos da despesa para busca
            let formaPagamento = despesa.formaPagamento || determinarFormaPagamento(despesa.parcelas, despesa.status);
            let conteudoDespesa = [
                despesa.data.toLowerCase().trim(),
                despesa.descricao.toLowerCase().trim(),
                despesa.valor.toLowerCase().trim(),
                despesa.parcelas.toString().toLowerCase().trim(),
                despesa.valorParcela.toLowerCase().trim(),
                despesa.tipo.toLowerCase().trim(),
                despesa.mesFatura.toLowerCase().trim(),
                despesa.status.toLowerCase().trim(),
                formaPagamento.toLowerCase().trim()
            ].join(' ');

            // Verifica se todas as expressões estão presentes em qualquer campo
            let match = expressoes.every(expressao => conteudoDespesa.includes(expressao));
            if (match) {
                console.log("Despesa encontrada:", despesa.descricao, "- Valor:", despesa.valorParcela);
            }
            return match;
        });

        console.log("Despesas filtradas:", despesasFiltradas);
        preencherTabela(despesasFiltradas);
        calcularTotalFiltrado(despesasFiltradas);
    }).catch(err => {
        console.error("Erro ao filtrar despesas:", err);
        window.alert("Erro ao aplicar o filtro. Verifique o console.");
    });
});

// Função para preencher a tabela com as despesas
function preencherTabela(despesas) {
    let tbody = tabela_horas.querySelector('tbody');
    tbody.innerHTML = ''; // Limpa o tbody

    despesas.forEach(despesa => {
        let linha = tbody.insertRow();
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
}

// Função para calcular o total das despesas filtradas
function calcularTotalFiltrado(despesasFiltradas) {
    let totalCompras = 0;
    console.log("Iniciando cálculo do total filtrado...");

    despesasFiltradas.forEach(despesa => {
        try {
            // Remove 'R$', pontos, substitui vírgula por ponto e remove espaços extras
            let valorStr = despesa.valorParcela.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            let valorNumerico = parseFloat(valorStr);

            if (!isNaN(valorNumerico)) {
                totalCompras += valorNumerico;
                console.log(`Adicionando ao total: ${valorNumerico} (${despesa.descricao})`);
            } else {
                console.warn(`Valor inválido ignorado: ${despesa.valorParcela} (${despesa.descricao})`);
            }
        } catch (error) {
            console.error(`Erro ao processar: ${despesa.valorParcela} (${despesa.descricao})`, error);
        }
    });

    console.log("Total final calculado:", totalCompras);
    let totalFormatado = totalCompras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById("calcTotalCompras").innerHTML = totalFormatado;
}

// Função para carregar dados iniciais
function carregarDadosIniciais() {
    getAllExpenses().then(despesas => {
        preencherTabela(despesas);
        somaComprasTotal();
    }).catch(err => {
        console.error("Erro ao carregar dados iniciais:", err);
    });
}

// Carrega os dados quando a página é carregada
document.addEventListener('DOMContentLoaded', carregarDadosIniciais);

// Função para limpar busca
function limparBusca() {
    input_busca.value = '';
    getAllExpenses().then(despesas => {
        preencherTabela(despesas);
        somaComprasTotal();
    });
}

// Funcionalidade do botão limpar busca
btnLimparBusca.addEventListener('click', limparBusca);

// Limpar busca ao pressionar ESC no input
input_busca.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        limparBusca();
    }
});