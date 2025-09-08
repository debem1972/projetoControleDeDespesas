// Calculadora - Funcionalidades
let currentInput = '';
let operator = '';
let previousInput = '';

// Elementos DOM
const modal = document.getElementById('modalCalculadora');
const display = document.getElementById('calcDisplay');
const btnCalculadora = document.getElementById('btnCalculadora');

// Event Listeners
btnCalculadora.addEventListener('click', openCalculator);

// Fechar modal clicando fora dele
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeCalculator();
    }
});

// Suporte a teclado
document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'block') {
        handleKeyboard(e);
    }
});

// Abrir calculadora
function openCalculator() {
    modal.style.display = 'block';
    clearCalculator();
    display.focus();
}

// Fechar calculadora
function closeCalculator() {
    modal.style.display = 'none';
}

// Limpar calculadora
function clearCalculator() {
    currentInput = '';
    operator = '';
    previousInput = '';
    display.value = '0';
}

// Adicionar ao display
function appendToDisplay(value) {
    if (display.value === '0' && value !== '.') {
        display.value = value;
    } else {
        display.value += value;
    }
}

// Deletar último caractere
function deleteLast() {
    if (display.value.length > 1) {
        display.value = display.value.slice(0, -1);
    } else {
        display.value = '0';
    }
}

// Calcular resultado
function calculateResult() {
    try {
        // Substitui símbolos visuais pelos operadores JavaScript
        let expression = display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        // Avalia a expressão
        let result = eval(expression);
        
        // Formata o resultado
        if (result % 1 === 0) {
            display.value = result.toString();
        } else {
            display.value = result.toFixed(8).replace(/\.?0+$/, '');
        }
    } catch (error) {
        display.value = 'Erro';
        setTimeout(() => {
            clearCalculator();
        }, 1500);
    }
}

// Suporte ao teclado
function handleKeyboard(e) {
    e.preventDefault();
    
    const key = e.key;
    
    if (key >= '0' && key <= '9' || key === '.') {
        appendToDisplay(key);
    } else if (key === '+' || key === '-') {
        appendToDisplay(key);
    } else if (key === '*') {
        appendToDisplay('×');
    } else if (key === '/') {
        appendToDisplay('÷');
    } else if (key === 'Enter' || key === '=') {
        calculateResult();
    } else if (key === 'Escape') {
        closeCalculator();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Delete' || key.toLowerCase() === 'c') {
        clearCalculator();
    }
}