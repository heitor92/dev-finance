const Modal = {
    open(){
        //Abrir Modal
        // Adicionar a class active ao modal
        /**
         * - document -
         * Para cada página carregada no browser, existe um objeto Document.
         * 
         * - Document.querySelector(selectors) - 
         * Retorna o primeiro nó Element dentro do documento,
         * na ordem do documento, que corresponde aos seletores especificados.
         * 
         * - Element.classList - 
         * Retorna um DOMTokenList contendo a lista de atributos de classe.
         *
         * - DOMTokenList.add(token1 [, ...tokenN]) -
         * O método add() da interface DOMTokenList adiciona o token fornecido à lista.
         * 
         */
        document.querySelector('.modal-overlay')
        .classList.add('active')
    },
    close() {
        //fechar o modal
        //remover a class active do modal
        Form.clearFields()
        document.querySelector('.modal-overlay')
        .classList.remove('active')
    }
}
const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finance:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finance:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    ADD: 'add',
    REMOVE: 'remove',
    status: '',
    lastTransaction: Storage.get()[Storage.get().length - 1],
    all: Storage.get(),
    add(transaction){
        Transaction.status = Transaction.ADD
        Transaction.lastTransaction = transaction
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index){
        Transaction.status = Transaction.REMOVE
        Transaction.lastTransaction = Transaction.all.splice(index, 1)[0]
        App.reload()
    },
    incomes(){
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },
    expenses(){
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },
    total(){
        return Transaction.incomes() + Transaction.expenses()
    },
    getExpenses(){
        let transactions = Transaction.all.slice()
        transactions = transactions.filter(function (transaction) {
            return transaction.amount < 0
        })

        return transactions
    },
    getIncomes(){
        let transactions = Transaction.all.slice()
        transactions = transactions.filter(function (transaction) {
            return transaction.amount > 0
        })
        return transactions
    },
    getLastExpense(){
        let expenses = Transaction.getExpenses()
        return expenses[expenses.length - 1]
    },
    getLastIncomes(){
        let incomes = Transaction.getIncomes()
        return incomes[incomes.length - 1]
    },
    getLastTransaction(){
        return Transaction.all[Transaction.all.length - 1]
    },
    clearStatus(){
        Transaction.status = ''
        Transaction.lastTransaction = {}
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTrasanction(transaction, index){
        //cria elementos na DOM
        /**
         * - Document.createElement(name) -
         * Cria um novo elemento com o nome de tag fornecido.
         * 
         * - Element.innerHTML -
         * É um DOMString representando a marcação do conteúdo do elemento.
         * 
         * - Element.appendChild(filho) -
         * Adiciona um nó ao final da lista de filhos de um nó pai especificado. 
         * Se o nó já existir no documento, ele é removido de seu nó pai atual 
         * antes de ser adicionado ao novo pai.
         * 
         * - HTMLOrForeignElement.dataset -
         * Retorna um DOMStringMap que permite acesso para ler e 
         * gravar os atributos de dados personalizados do elemento (data- *).
         * 
         */
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? 'income': 'expense'

        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img class="btn-delete" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html;
    },
    updateBalance() {
        let incomeDisplay = document.getElementById('incomeDisplay')
        let expenseDisplay = document.getElementById('expenseDisplay')
        let totalDisplay = document.getElementById('totalDisplay')
        let totalIncome = Transaction.incomes()
        let totalExpenses = Transaction.expenses()
        let totalTransactions = Transaction.total()
        let lastTransaction = Transaction.lastTransaction?.amount ?? 0


        if(lastTransaction > 0 && Transaction.status === Transaction.ADD){
            DOM.animationBalance(incomeDisplay, (totalIncome - lastTransaction), totalIncome)
            DOM.animationBalance(totalDisplay, (totalTransactions - lastTransaction), totalTransactions)

        }else if(lastTransaction > 0 && Transaction.status === Transaction.REMOVE){
            DOM.animationBalance(incomeDisplay, (totalIncome + lastTransaction), totalIncome)
            DOM.animationBalance(totalDisplay, (totalTransactions + lastTransaction), totalTransactions)

        }else if(lastTransaction < 0 && Transaction.status === Transaction.ADD){
            DOM.animationBalance(expenseDisplay, (totalExpenses - lastTransaction), totalExpenses)
            DOM.animationBalance(totalDisplay, (totalTransactions - lastTransaction), totalTransactions)

        }else if(lastTransaction < 0 && Transaction.status === Transaction.REMOVE){
            DOM.animationBalance(expenseDisplay, (totalExpenses + lastTransaction), totalExpenses)
            DOM.animationBalance(totalDisplay, (totalTransactions + lastTransaction), totalTransactions)

        } else{
            incomeDisplay.innerHTML = Utils.formatCurrency(Transaction.incomes())
            expenseDisplay.innerHTML = Utils.formatCurrency(Transaction.expenses())
            totalDisplay.innerHTML = Utils.formatCurrency(Transaction.total())

        }
        
        Transaction.clearStatus()
        /*
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
        */
        
    },
    animationBalance(element, inicio = 0, fim = 0){
        //console.log(inicio, fim)
        let obj = {
            valor: inicio
        }
        anime({
            targets: obj,
            valor: fim,
            easing: 'linear',
            round: 1,
            update: function() {
                element.innerHTML = Utils.formatCurrency(obj.valor);
            }
        });
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = Number(value) * 100
        return value
    },
    formatDate(date){
        /**
         * - str.split([separator[, limit]]) -
         * O método split() divide uma String em uma lista ordenada de substrings, 
         * coloca essas substrings em um array e retorna o array. 
         */
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        /**
         * - Number(value) -
         * O objeto JavaScript Number é um objeto encapsulado que permite você trabalhar com valores numéricos. 
         * Um objeto Number é criado utilizando o construtor Number().
         * 
         * - String(value) -
         * O objeto global String  é um construtor para strings, ou uma sequência de caracteres.
         * 
         * - toLocaleString() -
         * O método toLocaleString() retorna uma string com uma representação sensível ao idioma deste número.
         * 
         */
        const signal = Number(value) < 0 ? "-" : "" 
        
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        
        return signal + value
    },

    formatarMoeda(event){
        let amount = Form.getValues().amount
        let signal = Number(amount) < 0 ? "-" : ""
        if(amount.trim() === ""){
            amount = "0"
        }
        if(!(amount.search(/\./) !== -1)){
            amount = parseFloat(amount).toFixed(2).toString()
        }else if (event.keyCode !== 8) {
            amount = amount.replace(/\.([0-9]{1})$/g, ".$10")
        }
        amount = amount.replace(/[\D]+/g, '')
        amount = amount.replace(/([0-9]{2})$/g, ".$1")
        amount = parseFloat(amount).toFixed(2).toString()
        //amount = amount.replace(/[\D]+/g, '')
        //amount = parseFloat(amount.replace(/^([0-9]+)/g, "$1")).toFixed(2).toString()
        //amount = parseFloat(amount.replace(/([0-9]{2})$/g, ".$1")).toFixed(2).toString()
        //amount = amount.replace(/([0-9]+)\.([0-9]{2})$/g, "$1.$2")
        Form.amount.value = signal + amount
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        /**
         * - str.trim() -
         * O método trim() remove os espaços em branco (whitespaces) do início e/ou fim de um texto. 
         * É considerado espaço em branco (espaço, tabulação, espaço fixo/rígido, etc.) 
         * e todo sinal de fim de linha de texto (LF, CR, etc.).
         */
        const { description, amount, date} = Form.getValues()
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "" ){
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let { description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = "0.00"
        Form.date.value = ""
    },

    submit(event){
        /**
         * 
         * - event.preventDefault() -
         * Cancela o evento (caso seja cancelável).
         */
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)

            Form.clearFields()
            Modal.close();

        } catch (error) {
            alert(error.message)
        }

        
    }
}

const App = {
    init(){

        /**
        * - .forEach(callback(currentvalue[, index [, array]])[, thisArg]) -
        * O método forEach() executa uma dada função em cada elemento de um array.
        */
       /*
        Transaction.all.forEach((transaction, index) => {
            DOM.addTrasanction(transaction, index)
        })
        */
        Transaction.all.forEach(DOM.addTrasanction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }

}

App.init()