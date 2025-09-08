// Função para exportar os dados
async function exportarDados() {
    try {
        // Obtém todas as despesas do IndexedDB
        const despesas = await getAllExpenses();

        // Cria um objeto Blob com os dados
        const blob = new Blob([JSON.stringify(despesas, null, 2)], { type: 'application/json' });

        // Cria um link para download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'despesas.json';

        // Adiciona o link ao documento e simula o clique
        document.body.appendChild(a);
        a.click();

        // Remove o link do documento
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert('Dados exportados com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        alert('Erro ao exportar dados. Verifique o console para mais detalhes.');
    }
}

// Função para importar os dados
function importarDados() {
    // Simula o clique no input de arquivo
    document.getElementById('inputImportacao').click();
}

// Adiciona o evento de change no input de arquivo
document.getElementById('inputImportacao').addEventListener('change', async function (e) {
    try {
        const file = e.target.files[0];
        if (!file) return;

        // Lê o conteúdo do arquivo
        const reader = new FileReader();
        reader.onload = async function (event) {
            try {
                // Converte o conteúdo do arquivo para objeto
                const despesas = JSON.parse(event.target.result);

                // Valida se o arquivo tem o formato correto
                if (!Array.isArray(despesas)) {
                    throw new Error('Formato de arquivo inválido');
                }

                // Confirma com o usuário
                if (confirm('Isso irá substituir todos os dados existentes. Deseja continuar?')) {
                    // Limpa o banco de dados atual
                    await clearAllExpenses();

                    // Importa as novas despesas
                    for (const despesa of despesas) {
                        await addExpense(despesa);
                    }

                    // Recarrega a página para atualizar a tabela
                    alert('Dados importados com sucesso!');
                    location.reload();
                }
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                alert('Erro ao processar arquivo. Verifique se o arquivo está no formato correto.');
            }
        };

        reader.readAsText(file);
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        alert('Erro ao importar dados. Verifique o console para mais detalhes.');
    }

    // Limpa o input de arquivo
    e.target.value = '';
}); 