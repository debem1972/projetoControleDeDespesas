// Configuração inicial dos gráficos
let graficos = {
    evolucao: null,
    tipos: null,
    composicao: null,
    padrao: null,
    comparativo: null
};

// Configurações de cores para os gráficos
const CORES = [
    '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e74c3c',
    '#1abc9c', '#34495e', '#16a085', '#27ae60', '#2980b9',
    '#8e44ad', '#f39c12', '#d35400', '#c0392b', '#bdc3c7'
];

// Inicialização do dashboard
document.addEventListener('DOMContentLoaded', async function () {
    await atualizarDashboard();

    // Event listeners
    document.getElementById('aplicar-filtros').addEventListener('click', atualizarDashboard);

    // Listeners para filtros rápidos de período
    document.querySelectorAll('.periodo-rapido button').forEach(btn => {
        btn.addEventListener('click', function () {
            const meses = parseInt(this.dataset.periodo);
            definirPeriodoRapido(meses);
        });
    });

    // Listener para mudança no tipo do gráfico comparativo
    document.getElementById('tipo-comparativo').addEventListener('change', async function () {
        const despesas = await getAllExpenses();
        const despesasFiltradas = aplicarFiltros(despesas);
        atualizarGraficoComparativo(despesasFiltradas);
    });
});

// Define período rápido
function definirPeriodoRapido(meses) {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setMonth(hoje.getMonth() - meses);

    document.getElementById('data-inicio').value = inicio.toISOString().split('T')[0];
    document.getElementById('data-fim').value = hoje.toISOString().split('T')[0];
}

// Formata valor como moeda
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Atualiza todo o dashboard
async function atualizarDashboard() {
    try {
        const despesas = await getAllExpenses();
        const despesasFiltradas = aplicarFiltros(despesas);

        atualizarIndicadores(despesasFiltradas);
        atualizarGraficos(despesasFiltradas);
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

// Aplica os filtros selecionados
function aplicarFiltros(despesas) {
    const dataInicio = new Date(document.getElementById('data-inicio').value);
    const dataFim = new Date(document.getElementById('data-fim').value);
    const tiposSelecionados = Array.from(document.querySelectorAll('#tipos-filtro input:checked')).map(cb => cb.value);

    return despesas.filter(despesa => {
        const data = new Date(despesa.data.split('/').reverse().join('-'));
        return data >= dataInicio &&
            data <= dataFim &&
            tiposSelecionados.includes(despesa.tipo.toLowerCase());
    });
}

// Atualiza os indicadores
function atualizarIndicadores(despesas) {
    // Total no período
    const total = despesas.reduce((acc, d) => {
        return acc + parseFloat(d.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
    }, 0);

    // Média mensal
    const meses = new Set(despesas.map(d => d.mesFatura)).size;
    const media = meses > 0 ? total / meses : 0;

    // Maior gasto
    const maiorGasto = despesas.reduce((max, d) => {
        const valor = parseFloat(d.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
        return valor > max ? valor : max;
    }, 0);

    // Gasto mais frequente
    const frequencia = despesas.reduce((acc, d) => {
        acc[d.descricao] = (acc[d.descricao] || 0) + 1;
        return acc;
    }, {});
    const gastoFrequente = Object.entries(frequencia)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    // Atualiza os elementos HTML
    document.getElementById('total-periodo').textContent = formatarMoeda(total);
    document.getElementById('media-mensal').textContent = formatarMoeda(media);
    document.getElementById('maior-gasto').textContent = formatarMoeda(maiorGasto);
    document.getElementById('gasto-frequente').textContent = gastoFrequente;
}

// Atualiza todos os gráficos
function atualizarGraficos(despesas) {
    atualizarGraficoEvolucao(despesas);
    atualizarGraficoTipos(despesas);
    atualizarGraficoComposicao(despesas);
    atualizarGraficoPadrao(despesas);
    atualizarGraficoComparativo(despesas);
}

// Função auxiliar para gerar lista de meses contínuos entre duas datas (formato mesAbrev/ano)
function gerarListaMesesEntre(dataInicio, dataFim) {
    const mesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const meses = [];
    let atual = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), 1);
    const fim = new Date(dataFim.getFullYear(), dataFim.getMonth(), 1);
    while (atual <= fim) {
        const mes = mesesAbrev[atual.getMonth()];
        const ano = atual.getFullYear();
        meses.push(mes + '/' + ano);
        atual.setMonth(atual.getMonth() + 1);
    }
    return meses;
}

// Gráfico de evolução de despesas
function atualizarGraficoEvolucao(despesas) {
    const ctx = document.getElementById('grafico-evolucao').getContext('2d');

    // Recupera o período filtrado
    const dataInicio = new Date(document.getElementById('data-inicio').value);
    const dataFim = new Date(document.getElementById('data-fim').value);
    const listaMeses = gerarListaMesesEntre(dataInicio, dataFim);

    // Agrupa despesas por mês
    const dadosPorMes = despesas.reduce((acc, d) => {
        const mes = d.mesFatura;
        if (!acc[mes]) acc[mes] = 0;
        acc[mes] += parseFloat(d.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
        return acc;
    }, {});

    if (graficos.evolucao) graficos.evolucao.destroy();

    graficos.evolucao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: listaMeses,
            datasets: [{
                label: 'Total de Despesas',
                data: listaMeses.map(mes => dadosPorMes[mes] || 0),
                borderColor: CORES[0],
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução de Despesas por Mês'
                }
            }
        }
    });
}

// Gráfico de distribuição por tipo
function atualizarGraficoTipos(despesas) {
    const ctx = document.getElementById('grafico-tipos').getContext('2d');

    // Agrupa despesas por tipo
    const dadosPorTipo = despesas.reduce((acc, d) => {
        if (!acc[d.tipo]) acc[d.tipo] = 0;
        acc[d.tipo] += parseFloat(d.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
        return acc;
    }, {});

    if (graficos.tipos) graficos.tipos.destroy();

    graficos.tipos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(dadosPorTipo),
            datasets: [{
                data: Object.values(dadosPorTipo),
                backgroundColor: CORES
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuição por Tipo de Gasto'
                }
            }
        }
    });
}

// Função auxiliar para converter mês/ano em data
function converterMesParaData(mesFatura) {
    const [mes, ano] = mesFatura.split('/');
    // Criamos uma data com dia 1 para comparação consistente
    return new Date(parseInt(ano), parseInt(mes) - 1, 1);
}

// Função para ordenar meses cronologicamente (do mais antigo para o mais recente)
function ordenarMesesCronologicamente(meses) {
    return meses.sort((a, b) => {
        const dataA = converterMesParaData(a);
        const dataB = converterMesParaData(b);
        // Invertendo a ordem da comparação para ordenar do mais antigo para o mais recente
        return dataA.getTime() - dataB.getTime();
    });
}

// Gráfico de composição mensal
function atualizarGraficoComposicao(despesas) {
    const ctx = document.getElementById('grafico-composicao').getContext('2d');

    // Agrupa despesas por mês e tipo
    const dadosPorMesTipo = despesas.reduce((acc, d) => {
        const mes = d.mesFatura;
        if (!acc[mes]) acc[mes] = {};
        if (!acc[mes][d.tipo]) acc[mes][d.tipo] = 0;
        acc[mes][d.tipo] += parseFloat(d.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
        return acc;
    }, {});

    // Ordena os meses cronologicamente
    const meses = ordenarMesesCronologicamente(Object.keys(dadosPorMesTipo));
    const tipos = [...new Set(despesas.map(d => d.tipo))];

    if (graficos.composicao) graficos.composicao.destroy();

    graficos.composicao = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: tipos.map((tipo, index) => ({
                label: tipo,
                data: meses.map(mes => dadosPorMesTipo[mes][tipo] || 0),
                backgroundColor: CORES[index % CORES.length]
            }))
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Composição Mensal por Tipo'
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: function (value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de padrão de gastos (heatmap)
function atualizarGraficoPadrao(despesas) {
    const ctx = document.getElementById('grafico-padrao').getContext('2d');

    // Agrupa despesas por dia da semana
    const dadosPorDia = despesas.reduce((acc, d) => {
        const data = new Date(d.data.split('/').reverse().join('-'));
        const dia = data.getDay();
        if (!acc[dia]) acc[dia] = 0;
        acc[dia] += parseFloat(d.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
        return acc;
    }, {});

    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    if (graficos.padrao) graficos.padrao.destroy();

    graficos.padrao = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: diasSemana,
            datasets: [{
                label: 'Total de Gastos',
                data: diasSemana.map((_, index) => dadosPorDia[index] || 0),
                backgroundColor: CORES[0]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Padrão de Gastos por Dia da Semana'
                }
            }
        }
    });
}

// Gráfico comparativo por tipo específico
function atualizarGraficoComparativo(despesas) {
    const ctx = document.getElementById('grafico-comparativo').getContext('2d');
    const tipoSelecionado = document.getElementById('tipo-comparativo').value;

    // Filtra apenas as despesas do tipo selecionado
    const despesasFiltradas = despesas.filter(d => d.tipo.toLowerCase() === tipoSelecionado);

    // Agrupa por mês e calcula estatísticas
    const dadosPorMes = despesasFiltradas.reduce((acc, d) => {
        const mes = d.mesFatura;
        if (!acc[mes]) {
            acc[mes] = {
                total: 0,
                quantidade: 0,
                valores: []
            };
        }
        const valor = parseFloat(d.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
        acc[mes].total += valor;
        acc[mes].quantidade++;
        acc[mes].valores.push(valor);
        return acc;
    }, {});

    // Ordena os meses cronologicamente e calcula estatísticas
    const meses = ordenarMesesCronologicamente(Object.keys(dadosPorMes));
    const dados = meses.map(mes => {
        const stats = dadosPorMes[mes];
        const media = stats.total / stats.quantidade;
        const valores = stats.valores;
        const mediana = valores.sort((a, b) => a - b)[Math.floor(valores.length / 2)];

        return {
            mes,
            total: stats.total,
            media,
            mediana,
            quantidade: stats.quantidade
        };
    });

    if (graficos.comparativo) graficos.comparativo.destroy();

    graficos.comparativo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.map(d => d.mes),
            datasets: [
                {
                    label: 'Total Gasto',
                    data: dados.map(d => d.total),
                    backgroundColor: CORES[0],
                    order: 1
                },
                {
                    label: 'Média por Compra',
                    data: dados.map(d => d.media),
                    type: 'line',
                    borderColor: CORES[1],
                    borderWidth: 2,
                    fill: false,
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Análise de Gastos - ${tipoSelecionado.charAt(0).toUpperCase() + tipoSelecionado.slice(1)}`
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const dataIndex = context.dataIndex;
                            const dataset = context.dataset;

                            if (dataset.label === 'Total Gasto') {
                                return [
                                    `Total: ${formatarMoeda(value)}`,
                                    `Quantidade: ${dados[dataIndex].quantidade} compras`
                                ];
                            } else {
                                return `Média: ${formatarMoeda(value)}`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            }
        }
    });
} 