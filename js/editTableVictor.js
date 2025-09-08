// Variável para controlar o estado de edição
let modoEdicao = false;

// Função para habilitar/desabilitar a edição da tabela
function editar() {
    const btnEditar = document.getElementById('editarDados');

    if (!modoEdicao) {
        // Confirma com o usuário antes de habilitar a edição
        const confirma = confirm("ATENÇÃO: Mantenha os formatos dos dados conforme os originais!\n\nExemplos:\nData: DD/MM/AAAA\nValor: 0,00\nParcelas: número\nTipo: conforme lista original\nMês Fatura: MM/AAAA\nStatus: 1d1 ou 2d10");

        if (confirma) {
            modoEdicao = true;
            habilitarEdicao();
            btnEditar.textContent = 'Finalizar edição';
        }
    } else {
        finalizarEdicao();
    }
}

// Função para habilitar a edição das células
function habilitarEdicao() {
    const tbody = document.querySelector('#tabela tbody');
    const linhas = tbody.querySelectorAll('tr:not(#linhaOriginal)');

    // Processa as linhas de forma assíncrona para evitar travamento
    let index = 0;
    function processarLinha() {
        if (index < linhas.length) {
            const linha = linhas[index];
            linha.querySelectorAll('td').forEach(celula => {
                celula.contentEditable = true;
                celula.style.cursor = 'pointer';
                celula.style.backgroundColor = '#f0f0f0';
            });
            index++;
            // Processa a próxima linha no próximo ciclo do event loop
            setTimeout(processarLinha, 0);
        }
    }
    processarLinha();
}

// Função para finalizar a edição e salvar as alterações
async function finalizarEdicao() {
    if (!modoEdicao) return;

    const tbody = document.querySelector('#tabela tbody');
    const linhas = tbody.querySelectorAll('tr:not(#linhaOriginal)');
    const btnEditar = document.getElementById('editarDados');

    try {
        for (const linha of linhas) {
            const id = linha.getAttribute('data-id');
            if (!id) continue;

            const despesaAtualizada = {
                id: parseInt(id),
                data: linha.cells[0].innerText,
                descricao: linha.cells[1].innerText,
                valor: linha.cells[2].innerText,
                parcelas: linha.cells[3].innerText,
                valorParcela: linha.cells[4].innerText,
                tipo: linha.cells[5].innerText,
                mesFatura: linha.cells[6].innerText,
                status: linha.cells[7].innerText,
                formaPagamento: determinarFormaPagamento(linha.cells[3].innerText, linha.cells[7].innerText)
            };

            await updateExpense(despesaAtualizada);
        }

        // Desabilita a edição de forma otimizada
        linhas.forEach(linha => {
            linha.querySelectorAll('td').forEach(celula => {
                celula.contentEditable = false;
                celula.style.cursor = 'default';
                celula.style.backgroundColor = '';
            });
        });

        modoEdicao = false;
        btnEditar.textContent = 'Editar tabela';

        // Mostra feedback de sucesso
        const feedback = document.createElement('div');
        feedback.textContent = 'Dados editados e atualizados com sucesso!';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(feedback);

        // Remove o feedback após 3 segundos
        setTimeout(() => {
            feedback.remove();
        }, 3000);

        // Atualiza o total
        atualizarTotal();

    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        alert('Erro ao salvar as alterações. Por favor, tente novamente.');
    }
}

// Função para atualizar o total das despesas visíveis na tabela
function atualizarTotal() {
    let totalCompras = 0;
    let linhas = document.querySelectorAll('#tabela tbody tr:not(#linhaOriginal)');
    linhas.forEach(linha => {
        if (linha.style.display !== 'none') {
            let valorParcelaCell = linha.cells[4];
            let valorParcela = valorParcelaCell.innerText.replace('R$', '').replace(',', '.');
            if (!isNaN(valorParcela)) {
                totalCompras += parseFloat(valorParcela);
            }
        }
    });
    document.getElementById('calcTotalCompras').innerText = `R$ ${totalCompras.toFixed(2).replace('.', ',')}`;
}