# 💳 Sistema de Controle de Despesas

Um sistema web completo e moderno para controle de despesas pessoais no cartão de crédito, desenvolvido com tecnologias web nativas e foco na experiência do usuário.

## 🚀 Funcionalidades

### 📊 Gestão de Despesas
- **Lançamento de gastos** com informações detalhadas (data, descrição, valor, tipo)
- **Controle de parcelamento** com cálculo automático de parcelas
- **Categorização por tipo** (Carro, Casa, Educação, Família, Lazer, Mercado, Outros, Pessoal, Saúde)...(futura implementação de categorias...!!!)
- **Cálculo automático** do mês da fatura baseado na data da compra
- **Determinação da forma de pagamento** (À vista ou Parcelado)

### 🔍 Pesquisa e Filtros
- **Busca em tempo real** por qualquer campo da tabela
- **Filtros inteligentes** para localizar despesas específicas
- **Visualização organizada** em tabela responsiva com scroll

### ✏️ Edição e Exclusão
- **Modo de edição** para alterar dados diretamente na tabela
- **Seleção múltipla** de linhas para exclusão em lote
- **Confirmação de exclusão** com feedback visual
- **Contador de seleção** em tempo real

### 📈 Relatórios e Análises
- **Geração de relatórios** personalizados por período
- **Filtros por tipo de gasto** com seleção múltipla
- **Agrupamento por categoria** opcional
- **Visualização em PDF** com layout profissional
- **Preview do relatório** antes da geração
- **Cálculo automático de totais** por categoria e geral

### 💾 Persistência de Dados
- **IndexedDB** para armazenamento local robusto
- **Backup e restauração** via exportação/importação JSON
- **Sincronização automática** entre sessões
- **Recuperação de dados** após fechamento do navegador

### 🧮 Calculadora Integrada
- **Calculadora completa** com operações básicas (+, -, ×, ÷)
- **Interface moderna** em modal compacto
- **Suporte ao teclado** para digitação rápida
- **Tratamento de erros** e formatação inteligente

### 📱 Interface Responsiva
- **Design moderno** com Bootstrap Icons
- **Feedback visual** com toasts informativos
- **Tooltips explicativos** em botões e controles
- **Animações suaves** para melhor UX

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica e acessível
- **CSS3** - Estilização moderna com Grid e Flexbox
- **JavaScript ES6+** - Lógica de negócio e interatividade

### Bibliotecas e Frameworks
- **Bootstrap Icons** - Iconografia moderna e consistente
- **jsPDF** - Geração de relatórios em PDF
- **jsPDF AutoTable** - Tabelas formatadas em PDF

### Persistência
- **IndexedDB API** - Banco de dados local do navegador
- **JSON** - Formato de exportação/importação de dados

### Arquitetura
- **Modular** - Código organizado em módulos especializados
- **Responsividade** - Exclusivo para utilização em desktop.


## 📁 Estrutura do Projeto

```
projetoControleDeDespesas/
├──_
│   ├── css/
│   │   ├── controle.css          # Estilos principais
│   │   └── dashboard.css         # Estilos do dashboard
│   ├── js/
│   │   ├── controleVictor.js     # Lógica principal
│   │   ├── calculator.js         # Calculadora integrada
│   │   ├── editTableVictor.js    # Edição de tabela
│   │   ├── excluiLinhaVictor.js  # Exclusão de registros
│   │   ├── filtroPesquisaVictor.js # Sistema de busca
│   │   ├── somaValoresVictor1a.js # Cálculos e totais
│   │   ├── configRelatVictor.js  # Configuração de relatórios
│   │   ├── indexedDB-manager.js  # Gerenciamento do banco
│   │   └── importExportManager.js # Import/Export de dados
│   ├── index.html               # Página principal
│   ├── dashboard.html           # Dashboard (em desenvolvimento)
│   └── despesas.json           # Dados de exemplo
└── README.md                   # Documentação
```

## 🚀 Como Usar

### Instalação
1. Clone o repositório:
```bash
git clone https://github.com/debem1972/projetoControleDeDespesas.git
```

2. Navegue até o diretório:
```bash
cd projetoControleDeDespesas/projetoControle
```

3. Abra o arquivo `index.html` em seu navegador ou use um servidor local:
```bash
# Com Python
python -m http.server 8000

# Com Node.js (http-server)
npx http-server
```

### Uso Básico

1. **Lançar Despesa**:
   - Preencha os campos obrigatórios
   - Selecione se é parcelado ou não
   - Clique em "Lançar"

2. **Buscar Despesas**:
   - Use o campo de busca para filtrar registros
   - A busca é realizada em tempo real

3. **Editar Registros**:
   - Clique em "Editar tabela"
   - Modifique os dados diretamente nas células
   - Clique em "Finalizar edição"

4. **Excluir Registros**:
   - Clique em "Deletar linhas"
   - Selecione as linhas desejadas
   - Confirme a exclusão

5. **Gerar Relatórios**:
   - Clique em "Gerar relatório"
   - Configure período e filtros
   - Visualize ou gere PDF

6. **Usar Calculadora**:
   - Clique no ícone da calculadora
   - Realize cálculos básicos
   - Use teclado ou mouse

## 💡 Funcionalidades Avançadas

### Backup de Dados
- **Exportar**: Salva todos os dados em arquivo JSON
- **Importar**: Restaura dados de arquivo JSON
- **Compatibilidade**: Mantém estrutura entre versões

### Relatórios Personalizados
- **Filtros por período**: Selecione mês/ano específicos
- **Filtros por categoria**: Escolha tipos de gasto
- **Agrupamento**: Organize por categoria
- **Formato profissional**: Layout otimizado para impressão

### Persistência Robusta
- **Armazenamento local**: Dados salvos no navegador
- **Recuperação automática**: Restaura dados ao reabrir
- **Backup automático**: Sincronização contínua

## 🔧 Configuração e Personalização

### Tipos de Gasto
Os tipos podem ser facilmente modificados no arquivo `index.html`:
```html
<option value="novo-tipo">Novo Tipo</option>
```

### Estilos Personalizados
Modifique o arquivo `css/controle.css` para personalizar:
- Cores do tema
- Tamanhos de fonte
- Layout dos componentes

### Funcionalidades Adicionais
O sistema é modular e permite fácil extensão:
- Novos tipos de relatório
- Campos adicionais
- Integrações externas

## 🎯 Roadmap

### Em Desenvolvimento
- [ ] Dashboard com gráficos interativos
- [ ] Modo escuro/claro
- [ ] Notificações de vencimento
- [ ] Categorias personalizáveis

### Futuras Implementações
- [ ] Sincronização em nuvem
- [ ] App mobile (PWA)
- [ ] Múltiplos cartões
- [ ] Análise de gastos com IA

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Desenvolvedor Fullstack Estudante**
- Especialista em tecnologias web modernas
- Foco em código limpo e experiência do usuário
- Arquitetura modular e escalável

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [Issue](https://github.com/debem1972/projetoControleDeDespesas/issues)
- Consulte a documentação
- Entre em contato via email: **danielbemficadev@gmail.com**

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela no repositório!**