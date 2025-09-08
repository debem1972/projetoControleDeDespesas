// Tornando a variável mesAno global
let mesAno;
// Tornando a variável estatus global
let estatus;

// Função para calcular o mês da fatura com base na data da compra
function calcularMesFatura(dataCompra, incrementoMes = 0) {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    let data = new Date(dataCompra);
    data.setMonth(data.getMonth() + incrementoMes);
    return `${meses[data.getMonth()]}/${data.getFullYear()}`;
}

// Função para determinar a forma de pagamento
function determinarFormaPagamento(parcelas, status) {
    const numParcelas = parseInt(parcelas);
    
    if (numParcelas === 1) {
        return 'ultima';
    }
    
    if (numParcelas > 1) {
        // Verifica se é a última parcela (ex: 3d3)
        const [parcelaAtual, totalParcelas] = status.split('d').map(Number);
        if (parcelaAtual === totalParcelas) {
            return 'ultima';
        }
        return 'parc';
    }
    
    return 'parc';
}

// Adicione um evento de input ao campo #data
document.querySelector("#data").addEventListener('input', function () {
    let entradaData = this.value;
    let entradaDataNumeros = entradaData.replace(/\D/g, '');
    let dataFormatada = entradaDataNumeros.replace(
        /(\d{2})(\d{2})(\d{4})/,
        function (match, diaMatch, mesMatch, anoMatch) {
            return diaMatch + '/' + mesMatch + '/' + anoMatch;
        }
    );
    this.value = dataFormatada;

    // Atualiza mesAno com base na data digitada
    if (dataFormatada.length === 10) { // Verifica se a data está completa
        const [diaInput, mesInput, anoInput] = dataFormatada.split('/');
        const dataObj = new Date(anoInput, mesInput - 1, diaInput);
        mesAno = calcularMesFatura(dataObj);
    }
});

// Formatando o campo id #descricao para 1ª letra maiúscula
let inputDescript = document.querySelector('#descricao');
inputDescript.addEventListener("input", function () {
    let texto = inputDescript.value;
    if (texto.length > 0) {
        let palavras = texto.split(' ');
        for (let i = 0; i < palavras.length; i++) {
            if (palavras[i].length > 0) {
                palavras[i] = palavras[i].charAt(0).toUpperCase() + palavras[i].slice(1);
            }
        }
        inputDescript.value = palavras.join(' ');
    }
});

// Validando e formatando o campo #valor
document.addEventListener('DOMContentLoaded', function () {
    let entradaValor = document.querySelector("#valor");
    entradaValor.addEventListener('input', function () {
        let valorDigitado = entradaValor.value;
        let valorNumerico = valorDigitado.replace(/\D/g, '');
        if (valorNumerico === "" || valorNumerico == "0") {
            window.alert("O campo valor é obrigatório e não pode ser igual a zero ou vazio.");
            entradaValor.value = "";
            return;
        }
        let valorFormatado = (Number(valorNumerico) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        entradaValor.value = valorFormatado;
    });
});

let divideParcela;

function verificarParcelamento() {
    let entradaNumberParc = document.querySelector("#numberParcels");
    let valorSelectParc = entradaNumberParc.value;
    let numeroParcelas = Number(valorSelectParc);
    let parcelaAtual = 1;
    let escolhaParcela = document.getElementById('parcelaSim');
    let escolhaNao = document.getElementById('parcelaNao');
    let divParcelamento = document.querySelector('.parcelamento');
    let valorCompra = document.querySelector('#valor').value;
    let valorCompraAlert = document.getElementById('valorCompraAlert');

    if (escolhaNao.checked) {
        valorCompraAlert.innerHTML = `O valor da compra ficou em ${valorCompra}`;
        divParcelamento.classList.add('parcelamentoNao');
        divParcelamento.classList.remove('parcelamentoSim');
    } else if (escolhaParcela.checked) {
        let entradaValor = document.querySelector("#valor");
        let numeroValor = Number(entradaValor.value.replace('R$', '').replace('.', '').replace(',', '.'));
        entradaValor.value = numeroValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let selectOption = document.querySelector('#numberParcels');
        selectOption.addEventListener('change', function () {
            let opcaoSelecionada = selectOption.value;
            if (!opcaoSelecionada) {
                window.alert('Preencha o número de parcelas!');
                document.querySelector("#numberParcels").focus();
                return;
            }
            divideParcela = numeroValor / opcaoSelecionada;
            let valorFormatadoParc = divideParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            valorCompraAlert.innerHTML = `O valor da parcela ficou em: ${valorFormatadoParc}`;
        });
    }
    divParcelamento.classList.toggle('parcelamentoSim', escolhaParcela.checked);
    divParcelamento.classList.toggle('parcelamentoNao', escolhaNao.checked);
}

document.getElementById('parcelaNao').addEventListener('click', verificarParcelamento);
document.getElementById('parcelaSim').addEventListener('click', verificarParcelamento);

function lancar() {
    let entradaData = document.querySelector("#data").value;
    let tipoDeGasto = document.querySelector("#tipos").value;
    let escolhaParcela = document.getElementById('parcelaSim');
    let entradaNumberParc = document.querySelector("#numberParcels");
    let valorSelectParc = entradaNumberParc.value;
    let entradaValor = document.querySelector("#valor");
    let valorSemFormatacao = entradaValor.value.replace(/[^\d]/g, '');
    let escolhaNao = document.getElementById('parcelaNao');
    let parcelaAtual = 1;
    let numeroParcelas = Number(valorSelectParc);

    // Converte a data de dd/mm/aaaa para objeto Date
    let [diaCompra, mesCompra, anoCompra] = entradaData.split('/');
    let dataCompra = new Date(anoCompra, mesCompra - 1, diaCompra); // mes - 1 porque em JS os meses são 0-based

    // Validações
    if (!entradaData) {
        window.alert('Preencha a data!');
        document.querySelector("#data").focus();
        return;
    }
    let dataRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
    if (!dataRegex.test(entradaData)) {
        window.alert('Formato de data inválido. Utilize dd/mm/aaaa ou dd/mm/aa.');
        document.querySelector("#data").value = "";
        document.querySelector("#data").focus();
        return;
    }
    let [dia, mes, ano] = entradaData.split('/').map(Number);
    if (mes < 1 || mes > 12) {
        window.alert('Mês inválido. Insira um mês entre 1 e 12.');
        return;
    }
    let ultimoDiaMes = new Date(ano, mes, 0).getDate();
    if (dia > ultimoDiaMes) {
        window.alert(`O mês ${mes} de ${ano} não tem ${dia} dias. Verifique a data.`);
        return;
    }
    if (mes === 2 && dia === 29) {
        if ((ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0) {
        } else {
            window.alert(`O ano ${ano} não é bissexto. Fevereiro tem 28 dias.`);
            return;
        }
    }
    if (valorSemFormatacao === "" || valorSemFormatacao == "0") {
        window.alert("O campo valor é obrigatório e não pode ser igual a zero ou vazio.");
        entradaValor.focus();
        return;
    }
    if (escolhaParcela.checked && !valorSelectParc) {
        window.alert('Preencha o número de parcelas!');
        document.querySelector("#numberParcels").focus();
        return;
    }
    let descricao = document.querySelector('#descricao').value.trim();
    if (!descricao) {
        window.alert('Preencha a descrição!');
        document.querySelector('#descricao').focus();
        return;
    }
    if (!tipoDeGasto) {
        window.alert('Preencha o tipo de gasto!');
        document.querySelector("#tipos").focus();
        return;
    }

    let numeroValor = Number(entradaValor.value.replace('R$', '').replace('.', '').replace(',', '.'));
    divideParcela = numeroValor / (valorSelectParc || 1);
    let valorFormatadoParc = divideParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (escolhaNao.checked) {
        valorSelectParc = "1";
        valorFormatadoParc = entradaValor.value;
        estatus = "1d1";
    }

    let tabela = document.getElementById("tabela");
    let savePromises = [];

    if (escolhaParcela.checked) {
        for (let i = 0; i < numeroParcelas; i++) { // Começa do 0 para a primeira parcela ser no mês atual
            estatus = `${i + 1}d${numeroParcelas}`;
            let mesFatura = calcularMesFatura(dataCompra, i); // i = 0 para primeira parcela, 1 para segunda, etc.

            let despesa = {
                data: entradaData,
                descricao: descricao,
                valor: entradaValor.value,
                parcelas: valorSelectParc,
                valorParcela: valorFormatadoParc,
                tipo: tipoDeGasto,
                mesFatura: mesFatura,
                status: estatus,
                formaPagamento: determinarFormaPagamento(valorSelectParc, estatus)
            };

            let promise = addExpense(despesa).then(() => {
                let linha = tabela.insertRow();
                linha.setAttribute('data-id', despesa.id);
                linha.insertCell().innerHTML = despesa.data;
                linha.insertCell().innerHTML = despesa.descricao;
                linha.insertCell().innerHTML = despesa.valor;
                linha.insertCell().innerHTML = despesa.parcelas;
                linha.insertCell().innerHTML = despesa.valorParcela;
                linha.insertCell().innerHTML = despesa.tipo;
                linha.insertCell().innerHTML = despesa.mesFatura;
                linha.insertCell().innerHTML = despesa.status;
                linha.insertCell().innerHTML = despesa.formaPagamento;
            }).catch(err => console.error("Erro ao salvar despesa: ", err));

            savePromises.push(promise);
        }
    } else {
        let despesa = {
            data: entradaData,
            descricao: descricao,
            valor: entradaValor.value,
            parcelas: valorSelectParc,
            valorParcela: valorFormatadoParc,
            tipo: tipoDeGasto,
            mesFatura: calcularMesFatura(dataCompra), // Usa a data da compra para o mês da fatura
            status: estatus,
            formaPagamento: determinarFormaPagamento(valorSelectParc, estatus)
        };

        let promise = addExpense(despesa).then(() => {
            let linha = tabela.insertRow();
            linha.setAttribute('data-id', despesa.id);
            linha.insertCell().innerHTML = despesa.data;
            linha.insertCell().innerHTML = despesa.descricao;
            linha.insertCell().innerHTML = despesa.valor;
            linha.insertCell().innerHTML = despesa.parcelas;
            linha.insertCell().innerHTML = despesa.valorParcela;
            linha.insertCell().innerHTML = despesa.tipo;
            linha.insertCell().innerHTML = despesa.mesFatura;
            linha.insertCell().innerHTML = despesa.status;
            linha.insertCell().innerHTML = despesa.formaPagamento;
        }).catch(err => console.error("Erro ao salvar despesa: ", err));

        savePromises.push(promise);
    }

    // Aguarda todas as promessas serem resolvidas antes de limpar o formulário
    Promise.all(savePromises).then(() => {
        // Limpa o formulário apenas após todas as inserções
        document.querySelector("#data").value = "";
        document.querySelector("#data").focus();
        document.querySelector("#descricao").value = "";
        document.querySelector("#tipos").value = "";
        document.querySelector("#valor").value = "";
        document.querySelector("#parcelaSim").checked = false;
        document.querySelector("#parcelaNao").checked = false;
        document.querySelector("#numberParcels").value = "";
        document.getElementById('valorCompraAlert').innerHTML = "";
        document.querySelector('.parcelamento').classList.remove('parcelamentoSim');
        document.querySelector('.parcelamento').classList.add('parcelamentoNao');

        atualizarTotal(); // Atualiza o total após todas as inserções
    }).catch(err => console.error("Erro ao processar todas as promessas: ", err));

    // Funções vazias, pois os dados são gerenciados pelo IndexedDB
    function salvarDadosTabela() { }
    function carregarDadosTabela() { }
    function atualizarTotal() {
        let tabela = document.getElementById("tabela");
        let totalCompras = 0;
        getAllExpenses().then(despesas => {
            despesas.forEach(despesa => {
                let valorNumerico = parseFloat(despesa.valorParcela.replace('R$', '').replace('.', '').replace(',', '.'));
                if (!isNaN(valorNumerico)) {
                    totalCompras += valorNumerico;
                }
            });
            let totalFormatado = totalCompras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            document.getElementById("calcTotalCompras").innerHTML = totalFormatado;
        }).catch(err => console.error("Erro ao atualizar total: ", err));
    }

    document.addEventListener('DOMContentLoaded', function () {
        carregarDadosTabela();
    });
}

// Função para atualizar dados existentes com a nova coluna formaPagamento
async function atualizarDadosExistentes() {
    try {
        const despesas = await getAllExpenses();
        for (const despesa of despesas) {
            if (!despesa.formaPagamento) {
                despesa.formaPagamento = determinarFormaPagamento(despesa.parcelas, despesa.status);
                await updateExpense(despesa);
            }
        }
        console.log('Dados existentes atualizados com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar dados existentes:', error);
    }
}

// Executa a atualização dos dados existentes quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    atualizarDadosExistentes();
});


