// Variáveis globais para armazenar as configurações do relatório
let configRelatorio = {
    dataInicio: '',
    dataFim: '',
    tiposSelecionados: [],
    agruparPorTipo: false,
    despesasFiltradas: []
};

let previewMode = false;

// Função para inicializar os event listeners (chamada apenas uma vez)
function inicializarEventListeners() {
    // Remove listeners anteriores se existirem
    const checkTodos = document.getElementById('checkTodos');
    const btnPreview = document.getElementById('btnPreview');
    const btnGerarPDF = document.getElementById('btnGerarPDF');
    const btnCancelar = document.getElementById('btnCancelar');

    // Remove event listeners antigos usando clones
    const novoCheckTodos = checkTodos.cloneNode(true);
    const novoBtnPreview = btnPreview.cloneNode(true);
    const novoBtnGerarPDF = btnGerarPDF.cloneNode(true);
    const novoBtnCancelar = btnCancelar.cloneNode(true);

    checkTodos.parentNode.replaceChild(novoCheckTodos, checkTodos);
    btnPreview.parentNode.replaceChild(novoBtnPreview, btnPreview);
    btnGerarPDF.parentNode.replaceChild(novoBtnGerarPDF, btnGerarPDF);
    btnCancelar.parentNode.replaceChild(novoBtnCancelar, btnCancelar);

    // Adiciona os novos event listeners
    novoCheckTodos.addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('.tipos-group input[type="checkbox"]:not(#checkTodos)');
        checkboxes.forEach(cb => cb.checked = this.checked);
    });

    novoBtnPreview.addEventListener('click', async function () {
        if (validarFormulario()) {
            await salvarConfiguracoes();
            previewMode = true;
            gerarRelatorio();
        }
    });

    novoBtnGerarPDF.addEventListener('click', async function () {
        if (validarFormulario()) {
            await salvarConfiguracoes();
            previewMode = false;
            gerarRelatorio();
        }
    });

    novoBtnCancelar.addEventListener('click', function () {
        document.getElementById('modalRelatorio').style.display = 'none';
        resetarConfiguracoes();
        if (!previewMode) {
            carregarDadosTabela();
        }
    });
}

// Função para abrir o modal de configuração do relatório
function geraPrompt() {
    const modal = document.getElementById('modalRelatorio');
    modal.style.display = 'block';

    // Configura a data inicial como o primeiro dia do mês atual
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = (hoje.getMonth() + 1).toString().padStart(2, '0');
    document.getElementById('dataInicio').value = `${anoAtual}-${mesAtual}`;
    document.getElementById('dataFim').value = `${anoAtual}-${mesAtual}`;

    // Reseta as configurações
    resetarConfiguracoes();

    // Inicializa os event listeners
    inicializarEventListeners();
}

// Função para validar o formulário
function validarFormulario() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    const tiposSelecionados = Array.from(document.querySelectorAll('.tipos-group input[type="checkbox"]:not(#checkTodos):checked')).length;

    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione o período do relatório.');
        return false;
    }

    if (dataInicio > dataFim) {
        alert('A data inicial não pode ser maior que a data final.');
        return false;
    }

    if (tiposSelecionados === 0) {
        alert('Por favor, selecione pelo menos um tipo de compra.');
        return false;
    }

    return true;
}

// Função para salvar as configurações atuais
async function salvarConfiguracoes() {
    configRelatorio.dataInicio = document.getElementById('dataInicio').value;
    configRelatorio.dataFim = document.getElementById('dataFim').value;
    configRelatorio.tiposSelecionados = Array.from(
        document.querySelectorAll('.tipos-group input[type="checkbox"]:not(#checkTodos):checked')
    ).map(cb => cb.value);
    configRelatorio.agruparPorTipo = document.getElementById('agruparTipo').checked;

    // Busca e filtra as despesas
    const todasDespesas = await getAllExpenses();
    configRelatorio.despesasFiltradas = todasDespesas.filter(despesa => {
        const [mes, ano] = despesa.mesFatura.split('/');
        const mesFatura = `${ano}-${getMesNumero(mes)}`;
        return mesFatura >= configRelatorio.dataInicio &&
            mesFatura <= configRelatorio.dataFim &&
            (configRelatorio.tiposSelecionados.includes(despesa.tipo.toLowerCase()) ||
                configRelatorio.tiposSelecionados.includes('todos'));
    });
}

// Função para resetar as configurações
function resetarConfiguracoes() {
    configRelatorio = {
        dataInicio: '',
        dataFim: '',
        tiposSelecionados: [],
        agruparPorTipo: false,
        despesasFiltradas: []
    };

    // Desmarca todas as checkboxes
    document.querySelectorAll('.tipos-group input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('agruparTipo').checked = false;
}

// Função para criar o container de preview
function criarPreviewContainer() {
    // Remove preview anterior se existir
    const previewAnterior = document.querySelector('.preview-container');
    if (previewAnterior) {
        previewAnterior.remove();
    }

    // Cria o container de preview
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';

    // Cria a div que simula a folha A4
    const previewA4 = document.createElement('div');
    previewA4.className = 'preview-a4';

    // Cria os controles
    const controls = document.createElement('div');
    controls.className = 'preview-controls';

    const btnGerarPDF = document.createElement('button');
    btnGerarPDF.className = 'btn-gerar-pdf';
    btnGerarPDF.textContent = 'Gerar PDF';
    btnGerarPDF.onclick = () => {
        // Usa as configurações salvas para gerar o PDF
        const content = document.querySelector('.preview-a4 .content');
        // Usando jsPDF diretamente - configurações removidas

        gerarPDFComJsPDF(configRelatorio.despesasFiltradas, configRelatorio);
        
        setTimeout(() => {
            previewContainer.remove();
            resetarConfiguracoes();
            carregarDadosTabela();
        }, 1000);
    };

    const btnFechar = document.createElement('button');
    btnFechar.className = 'btn-fechar';
    btnFechar.textContent = 'Fechar';
    btnFechar.onclick = () => {
        previewContainer.remove();
        carregarDadosTabela();
    };

    controls.appendChild(btnGerarPDF);
    controls.appendChild(btnFechar);

    return { previewContainer, previewA4, controls };
}

// Função para gerar o relatório
async function gerarRelatorio() {
    try {
        const despesasFiltradas = configRelatorio.despesasFiltradas;
        const agruparPorTipo = configRelatorio.agruparPorTipo;

        if (previewMode) {
            const { previewContainer, previewA4, controls } = criarPreviewContainer();

            // Clona o conteúdo atual
            const content = document.querySelector('.content').cloneNode(true);
            content.style.display = 'block';

            // Limpa a tabela clonada
            const tbody = content.querySelector('tbody');
            tbody.innerHTML = '';
            
            // Ajusta a tabela para o preview
            const tabela = content.querySelector('table');
            tabela.classList.remove('table-fixed');
            tabela.style.display = 'table';
            tabela.style.width = '100%';
            tabela.style.tableLayout = 'auto';

            // Atualiza os cabeçalhos
            const dataInicioFormatada = formatarData(configRelatorio.dataInicio);
            const dataFimFormatada = formatarData(configRelatorio.dataFim);
            content.querySelector('#tituloRelatorio').classList.remove('oculto');
            content.querySelector('#tituloRelatorio').classList.add('tituloVisivel');
            content.querySelector('#name').classList.remove('oculto');
            content.querySelector('#name').classList.add('tituloVisivel');
            content.querySelector('#monthYear').classList.remove('oculto');
            content.querySelector('#monthYear').classList.add('tituloVisivel');
            content.querySelector('#name').innerHTML = `Tipos: ${configRelatorio.tiposSelecionados.join(', ')}`;
            content.querySelector('#monthYear').innerHTML = `Período: ${dataInicioFormatada} a ${dataFimFormatada}`;

            if (agruparPorTipo) {
                // Agrupa as despesas por tipo
                const despesasAgrupadas = {};
                despesasFiltradas.forEach(despesa => {
                    if (!despesasAgrupadas[despesa.tipo]) {
                        despesasAgrupadas[despesa.tipo] = [];
                    }
                    despesasAgrupadas[despesa.tipo].push(despesa);
                });

                // Cria seções para cada tipo
                Object.entries(despesasAgrupadas).forEach(([tipo, despesas]) => {
                    const grupoDiv = document.createElement('div');
                    grupoDiv.className = 'grupo-tipo';

                    const tituloGrupo = document.createElement('h3');
                    tituloGrupo.textContent = tipo;
                    grupoDiv.appendChild(tituloGrupo);

                    const tabelaGrupo = document.createElement('table');
                    tabelaGrupo.innerHTML = content.querySelector('table').innerHTML;
                    const tbodyGrupo = tabelaGrupo.querySelector('tbody');
                    tbodyGrupo.innerHTML = '';

                    let subtotal = 0;
                    despesas.forEach(despesa => {
                        const linha = tbodyGrupo.insertRow();
                        linha.setAttribute('data-id', despesa.id);
                        linha.insertCell().innerHTML = despesa.data;
                        linha.insertCell().innerHTML = despesa.descricao;
                        linha.insertCell().innerHTML = despesa.valor;
                        linha.insertCell().innerHTML = despesa.parcelas;
                        linha.insertCell().innerHTML = despesa.valorParcela;
                        linha.insertCell().innerHTML = despesa.tipo;
                        linha.insertCell().innerHTML = despesa.mesFatura;
                        linha.insertCell().innerHTML = despesa.status;

                        const valorParcela = parseFloat(despesa.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
                        if (!isNaN(valorParcela)) {
                            subtotal += valorParcela;
                        }
                    });

                    const subtotalDiv = document.createElement('div');
                    subtotalDiv.className = 'subtotal';
                    subtotalDiv.textContent = `Subtotal ${tipo}: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;

                    grupoDiv.appendChild(tabelaGrupo);
                    grupoDiv.appendChild(subtotalDiv);
                    tbody.appendChild(grupoDiv);
                });
            } else {
                // Exibe todas as despesas em ordem cronológica
                despesasFiltradas.sort((a, b) => {
                    const [diaA, mesA, anoA] = a.data.split('/');
                    const [diaB, mesB, anoB] = b.data.split('/');
                    return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
                }).forEach(despesa => {
                    const linha = tbody.insertRow();
                    linha.setAttribute('data-id', despesa.id);
                    linha.insertCell().innerHTML = despesa.data;
                    linha.insertCell().innerHTML = despesa.descricao;
                    linha.insertCell().innerHTML = despesa.valor;
                    linha.insertCell().innerHTML = despesa.parcelas;
                    linha.insertCell().innerHTML = despesa.valorParcela;
                    linha.insertCell().innerHTML = despesa.tipo;
                    linha.insertCell().innerHTML = despesa.mesFatura;
                    linha.insertCell().innerHTML = despesa.status;
                    let formaPagamento = despesa.formaPagamento || determinarFormaPagamento(despesa.parcelas, despesa.status);
                    linha.insertCell().innerHTML = formaPagamento;
                });
            }

            // Calcula e exibe o total
            let totalCompras = despesasFiltradas.reduce((total, despesa) => {
                const valor = parseFloat(despesa.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
                return total + (isNaN(valor) ? 0 : valor);
            }, 0);

            content.querySelector('#calcTotalCompras').innerHTML = totalCompras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // html2pdf gerencia automaticamente as quebras de página
            
            // Adiciona numeração de página
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = 'Página 1';
            content.appendChild(pageNumber);

            // Adiciona o conteúdo ao preview
            previewA4.appendChild(content);
            previewContainer.appendChild(previewA4);
            previewContainer.appendChild(controls);
            document.body.appendChild(previewContainer);
        } else {
            // Atualiza a tabela com as despesas filtradas
            const tabela = document.getElementById('tabela');
            const tbody = tabela.querySelector('tbody');
            tbody.innerHTML = '';

            // Exibe os cabeçalhos do relatório
            document.getElementById('tituloRelatorio').classList.remove('oculto');
            document.getElementById('tituloRelatorio').classList.add('tituloVisivel');
            document.getElementById('name').classList.remove('oculto');
            document.getElementById('name').classList.add('tituloVisivel');
            document.getElementById('monthYear').classList.remove('oculto');
            document.getElementById('monthYear').classList.add('tituloVisivel');

            // Atualiza os cabeçalhos
            const dataInicioFormatada = formatarData(configRelatorio.dataInicio);
            const dataFimFormatada = formatarData(configRelatorio.dataFim);
            document.getElementById('name').innerHTML = `Tipos: ${configRelatorio.tiposSelecionados.join(', ')}`;
            document.getElementById('monthYear').innerHTML = `Período: ${dataInicioFormatada} a ${dataFimFormatada}`;

            if (agruparPorTipo) {
                // Implementa a lógica de agrupamento igual ao preview
                const despesasAgrupadas = {};
                despesasFiltradas.forEach(despesa => {
                    if (!despesasAgrupadas[despesa.tipo]) {
                        despesasAgrupadas[despesa.tipo] = [];
                    }
                    despesasAgrupadas[despesa.tipo].push(despesa);
                });

                Object.entries(despesasAgrupadas).forEach(([tipo, despesas]) => {
                    const grupoDiv = document.createElement('div');
                    grupoDiv.className = 'grupo-tipo';

                    const tituloGrupo = document.createElement('h3');
                    tituloGrupo.textContent = tipo;
                    grupoDiv.appendChild(tituloGrupo);

                    const tabelaGrupo = document.createElement('table');
                    tabelaGrupo.innerHTML = tabela.innerHTML;
                    const tbodyGrupo = tabelaGrupo.querySelector('tbody');
                    tbodyGrupo.innerHTML = '';

                    let subtotal = 0;
                    despesas.forEach(despesa => {
                        const linha = tbodyGrupo.insertRow();
                        linha.setAttribute('data-id', despesa.id);
                        linha.insertCell().innerHTML = despesa.data;
                        linha.insertCell().innerHTML = despesa.descricao;
                        linha.insertCell().innerHTML = despesa.valor;
                        linha.insertCell().innerHTML = despesa.parcelas;
                        linha.insertCell().innerHTML = despesa.valorParcela;
                        linha.insertCell().innerHTML = despesa.tipo;
                        linha.insertCell().innerHTML = despesa.mesFatura;
                        linha.insertCell().innerHTML = despesa.status;

                        const valorParcela = parseFloat(despesa.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
                        if (!isNaN(valorParcela)) {
                            subtotal += valorParcela;
                        }
                    });

                    const subtotalDiv = document.createElement('div');
                    subtotalDiv.className = 'subtotal';
                    subtotalDiv.textContent = `Subtotal ${tipo}: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;

                    grupoDiv.appendChild(tabelaGrupo);
                    grupoDiv.appendChild(subtotalDiv);
                    tbody.appendChild(grupoDiv);
                });
            } else {
                despesasFiltradas.sort((a, b) => {
                    const [diaA, mesA, anoA] = a.data.split('/');
                    const [diaB, mesB, anoB] = b.data.split('/');
                    return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
                }).forEach(despesa => {
                    const linha = tbody.insertRow();
                    linha.setAttribute('data-id', despesa.id);
                    linha.insertCell().innerHTML = despesa.data;
                    linha.insertCell().innerHTML = despesa.descricao;
                    linha.insertCell().innerHTML = despesa.valor;
                    linha.insertCell().innerHTML = despesa.parcelas;
                    linha.insertCell().innerHTML = despesa.valorParcela;
                    linha.insertCell().innerHTML = despesa.tipo;
                    linha.insertCell().innerHTML = despesa.mesFatura;
                    linha.insertCell().innerHTML = despesa.status;
                });
            }

            // Calcula e exibe o total
            let totalCompras = despesasFiltradas.reduce((total, despesa) => {
                const valor = parseFloat(despesa.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
                return total + (isNaN(valor) ? 0 : valor);
            }, 0);

            document.getElementById('calcTotalCompras').innerHTML = totalCompras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // Gera o PDF
            geraPdf();

            // Reseta as configurações e restaura a tabela após 5 segundos
            setTimeout(() => {
                document.getElementById('tituloRelatorio').classList.remove('tituloVisivel');
                document.getElementById('tituloRelatorio').classList.add('oculto');
                document.getElementById('name').classList.remove('tituloVisivel');
                document.getElementById('name').classList.add('oculto');
                document.getElementById('monthYear').classList.remove('tituloVisivel');
                document.getElementById('monthYear').classList.add('oculto');
                resetarConfiguracoes();
                carregarDadosTabela();
            }, 5000);
        }

        // Fecha o modal
        document.getElementById('modalRelatorio').style.display = 'none';

    } catch (err) {
        console.error('Erro ao gerar relatório:', err);
        alert('Erro ao gerar o relatório. Verifique o console.');
    }
}

// Função para adicionar numeração de página
function adicionarNumeracaoPagina() {
    const content = document.querySelector('.content');
    const pageNumbers = document.querySelectorAll('.page-number');
    pageNumbers.forEach(num => num.remove());

    // Adiciona o número da página atual
    const pageNumber = document.createElement('div');
    pageNumber.className = 'page-number';
    pageNumber.textContent = `Página ${currentPage}`;
    content.appendChild(pageNumber);
}

// Função para formatar a data (YYYY-MM para MM/YYYY)
function formatarData(data) {
    const [ano, mes] = data.split('-');
    return `${getMesNome(mes)}/${ano}`;
}

// Função para converter mês de número para nome
function getMesNome(mes) {
    const meses = {
        '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
        '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
        '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };
    return meses[mes] || mes;
}

// Função para converter mês de nome para número
function getMesNumero(mes) {
    const meses = {
        'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
        'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
        'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
    };
    return meses[mes.toLowerCase()] || mes;
}

// Função para gerar o PDF
function geraPdf() {
    const conteudo = document.querySelector('.content');
    // Usando jsPDF diretamente - configurações removidas

    // Gerar PDF com jsPDF
    gerarPDFComJsPDF(configRelatorio.despesasFiltradas, configRelatorio);
    
    setTimeout(() => {
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            previewContainer.remove();
        }
        
        document.getElementById('tituloRelatorio').classList.remove('tituloVisivel');
        document.getElementById('tituloRelatorio').classList.add('oculto');
        document.getElementById('name').classList.remove('tituloVisivel');
        document.getElementById('name').classList.add('oculto');
        document.getElementById('monthYear').classList.remove('tituloVisivel');
        document.getElementById('monthYear').classList.add('oculto');
        resetarConfiguracoes();
        carregarDadosTabela();
    }, 1000);
}

// Função para gerar PDF com jsPDF e autoTable
function gerarPDFComJsPDF(despesas, config) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Cabeçalho do relatório
    doc.setFontSize(16);
    doc.text('Relatório de Despesas no Cartão de Crédito', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    const dataInicioFormatada = formatarData(config.dataInicio);
    const dataFimFormatada = formatarData(config.dataFim);
    doc.text(`Período: ${dataInicioFormatada} a ${dataFimFormatada}`, 20, 30);
    doc.text(`Tipos: ${config.tiposSelecionados.join(', ')}`, 20, 37);
    
    // Preparar dados da tabela
    const colunas = [
        'Data', 'Descrição', 'Valor', 'Parcelas', 'Valor Parcela', 
        'Tipo', 'Mês Fatura', 'Status', 'Forma Pagto'
    ];
    
    const linhas = despesas.map(despesa => [
        despesa.data,
        despesa.descricao,
        despesa.valor,
        despesa.parcelas,
        despesa.valorParcela,
        despesa.tipo,
        despesa.mesFatura,
        despesa.status,
        despesa.formaPagamento || determinarFormaPagamento(despesa.parcelas, despesa.status)
    ]);
    
    // Gerar tabela
    doc.autoTable({
        head: [colunas],
        body: linhas,
        startY: 45,
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 18 }, // Data
            1: { cellWidth: 35 }, // Descrição
            2: { cellWidth: 20 }, // Valor
            3: { cellWidth: 15 }, // Parcelas
            4: { cellWidth: 20 }, // Valor Parcela
            5: { cellWidth: 20 }, // Tipo
            6: { cellWidth: 18 }, // Mês Fatura
            7: { cellWidth: 15 }, // Status
            8: { cellWidth: 15 }  // Forma Pagto
        },
        margin: { top: 45, left: 14, right: 14 },
        pageBreak: 'auto',
        showHead: 'everyPage'
    });
    
    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    const total = despesas.reduce((sum, despesa) => {
        const valor = parseFloat(despesa.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
        return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 150, finalY);
    
    // Salvar PDF
    const filename = `relatorio_despesas_${config.dataInicio}_${config.dataFim}.pdf`;
    doc.save(filename);
}

// Função para carregar todas as despesas na tabela
async function carregarDadosTabela() {
    try {
        const despesas = await getAllExpenses();
        const tabela = document.getElementById('tabela');
        const tbody = tabela.querySelector('tbody');
        tbody.innerHTML = '';

        despesas.forEach(despesa => {
            const linha = tbody.insertRow();
            linha.setAttribute('data-id', despesa.id);
            linha.insertCell().innerHTML = despesa.data;
            linha.insertCell().innerHTML = despesa.descricao;
            linha.insertCell().innerHTML = despesa.valor;
            linha.insertCell().innerHTML = despesa.parcelas;
            linha.insertCell().innerHTML = despesa.valorParcela;
            linha.insertCell().innerHTML = despesa.tipo;
            linha.insertCell().innerHTML = despesa.mesFatura;
            linha.insertCell().innerHTML = despesa.status;
            let formaPagamento = despesa.formaPagamento || determinarFormaPagamento(despesa.parcelas, despesa.status);
            linha.insertCell().innerHTML = formaPagamento;
        });

        // Calcula o total
        let totalCompras = despesas.reduce((total, despesa) => {
            const valor = parseFloat(despesa.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
            return total + (isNaN(valor) ? 0 : valor);
        }, 0);

        document.getElementById('calcTotalCompras').innerHTML = totalCompras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    } catch (err) {
        console.error('Erro ao carregar dados da tabela:', err);
        alert('Erro ao carregar os dados. Verifique o console.');
    }
}