getUserInfo()
setup()



var incomes = []
var expenses = []
var annualExpenses = []
var debts = []
var funds = []
var user

var arrayposition = 0
var collection = ''

function setup(){

    // For one time setups

    let modalButtonCreate = document.getElementById('modalButtonCreate')
    let nameModalInput = document.getElementById("nameModalInput")
    let amountModalInput = document.getElementById("amountModalInput")
    let aprModalInput = document.getElementById('aprModalInput')
    let paymentModalInput = document.getElementById('paymentModalInput')
    let modalButtonSave = document.getElementById("modalButtonSave")
    let modalButtonDelete = document.getElementById("modalButtonDelete")
    let amountCreateModalInput = document.getElementById('amountCreateModalInput')
    let nameCreateModalInput = document.getElementById('nameCreateModalInput')
    let aprCreateModalInput = document.getElementById('aprCreateModalInput')
    let paymentCreateModalInput = document.getElementById('paymentCreateModalInput')
    let balanceEmergencyFund = document.getElementById('balanceEmergencyFund')
    let balanceAnnualExpense = document.getElementById('balanceAnnualExpense')
    let balanceSpending = document.getElementById('balanceSpending')
    let logoutButton = document.getElementById('logoutButton')
    let buttonChecklist = document.getElementById('buttonChecklist')

    buttonChecklist.addEventListener('click', function(){
        alert('This is a work in progress check back soon!')
    })

    modalButtonCreate.addEventListener('click', function(){
        switch(createItemModal.dataset.collection){
            case 'incomes' :
                incomes.push({name: nameCreateModalInput.value, amount: parseInt(amountCreateModalInput.value,10)||0})
                uploadUserFinances()
            break;
            case 'expenses' :
                expenses.push({name: nameCreateModalInput.value, amount: parseInt(amountCreateModalInput.value,10)||0})
                uploadUserFinances()
            break;
            case 'annualExpenses':
                annualExpenses.push({name: nameCreateModalInput.value, amount: parseInt(amountCreateModalInput.value, 10)||0})
                uploadUserFinances()
            break;
            case 'debts':
                debts.push({name: nameCreateModalInput.value, amount: parseInt(amountCreateModalInput.value,10)||0, apr: parseInt(aprCreateModalInput.value,10)||0, payment: parseInt(paymentCreateModalInput.value,10)||0})
                uploadUserFinances()
            break;
        }
    })

        balanceEmergencyFund.addEventListener('change', (event)=>{
            funds[0].amount = parseInt(balanceEmergencyFund.value,10) || 0
            uploadUserFinances()
        })
        balanceSpending.addEventListener('change', (event)=>{
            funds[1].amount = parseInt(balanceSpending.value, 10) || 0
            uploadUserFinances()
        })
        balanceAnnualExpense.addEventListener('change', (event)=>{
            funds[2].amount = parseInt(balanceAnnualExpense.value, 10) || 0
            uploadUserFinances()
        })


        modalButtonSave.addEventListener('click', function(){
            switch(collection){
                case "expenses":
                    expenses[arrayposition].name = nameModalInput.value
                    expenses[arrayposition].amount = parseInt(amountModalInput.value, 10) || 0
                    uploadUserFinances()
                    break;
                case "annualExpenses":
                    annualExpenses[arrayposition].name = nameModalInput.value
                    annualExpenses[arrayposition].amount = parseInt(amountModalInput.value, 10) || 0
                    uploadUserFinances()
                    break;
                case "incomes":
                    incomes[arrayposition].name = nameModalInput.value
                    incomes[arrayposition].amount = parseInt(amountModalInput.value, 10) || 0
                    uploadUserFinances()
                    break;
                case "debts":
                    debts[arrayposition].name = nameModalInput.value
                    debts[arrayposition].amount = parseInt(amountModalInput.value, 10) || 0
                    debts[arrayposition].apr = parseInt(aprModalInput.value, 10) || 0
                    debts[arrayposition].payment = parseInt(paymentModalInput.value, 10) || 0
                    uploadUserFinances()
                    break;
            }
        })

        modalButtonDelete.addEventListener('click', function(){
            switch(collection){
                case 'expenses':
                    expenses.splice(arrayposition, 1)
                    uploadUserFinances()
                    break;
                case 'annualExpenses':
                    annualExpenses.splice(arrayposition, 1)
                    uploadUserFinances()
                    break;
                case 'incomes':
                    incomes.splice(arrayposition, 1)
                    uploadUserFinances()
                    break;
                case 'debts':
                    debts.splice(arrayposition, 1)
                    uploadUserFinances()
                    break;
            }
        })

        logoutButton.addEventListener('click', function(){
            fetch('/logout', {method:'GET'}).then((serverResponse)=>{
                serverResponse.text().then((serverText)=>{
                    switch(serverText){
                        case 'done':
                            location.href = 'loginpage.html'
                            break;
                        case 'error':
                            alert('an error occured')
                            break;
                    }
                })
            })
        })

}

function getUserInfo(){
    fetch("/get-UserSoftInfo", {method: 'GET'}).then((serverResponse)=>{
        serverResponse.json().then((result)=>{

            if(result.status == "no-login"){
                location.href = "loginpage.html"
            }
            else{

                if(result.membershipStatus == 'inactive'){
                    location.href = 'paymentpage.html'
                }
              
                if(result.hasOwnProperty("isFirstLogin")){
                    $('#modalLoading').modal('show')
                    user = JSON.parse(JSON.stringify(result))
                    incomes = user.incomes
                    expenses = user.expenses
                    annualExpenses = user.annualExpenses
                    debts = user.debts
                    funds = user.funds
                    

                   
                    let expirationString = ''+(user.membershipExpiration.month+1)+'/'+user.membershipExpiration.day+'/'+user.membershipExpiration.year
                    $('#membershipExpiration').html("Membership Expiration: "+ expirationString)
                   
                    
                    
                    generatePageValues()
                    $('#modalLoading').modal('hide')
                }
                    else{
                        startTutorial()
                    }
                }
            })
     })
}   


function startTutorial(){
    let tutorialPosition = 0
    let appTutorial = document.getElementById("app-tutorial")
    let appMain = document.getElementById("app-main")
    let buttonNext = document.getElementById("buttonNext")
    let tutorialInput = document.getElementById("tutorial-input")
    let tutorialPrompt = document.getElementById("tutorial-prompt")
        appTutorial.style.display = "block"
        appMain.style.display="none"

        funds.push({name: 'emergency', amount: 0})
        funds.push({name: 'spending', amount: 0})
        funds.push({name: 'annualExpenses', amount:0})

    buttonNext.onclick = function(){   
        captureData()
        tutorialPosition = tutorialPosition+1
    }
    
    function captureData(){
        let amount = parseInt(tutorialInput.value,10)||0
        switch(tutorialPosition){
            case 0:
                tutorialInput.value = 0
                tutorialPrompt.innerHTML = "What is your monthly income?"
                tutorialInput.style.display = "inline"
                break;
            case 1:
                // Capture income data from input
                incomes.push({name: 'my income', amount: amount})
                tutorialPrompt.innerHTML = "How much do you spend on groceries each month?"
                tutorialInput.value = 0
                break;
            case 2:
                // Capture food budget data from input
                expenses.push({name: 'groceries', amount : amount})
                tutorialPrompt.innerHTML = "What is your average electricity bill?"
                tutorialInput.value = 0
                break;
            case 3:
                // Capture electric bill
                expenses.push({name: 'electricity', amount: amount})
                tutorialPrompt.innerHTML = "What is your average water bill?"
                tutorialInput.value = 0
                break;
            case 4:
                // Capture water bill
                expenses.push({name: 'water', amount: amount})
                tutorialPrompt.innerHTML = "What is your average heating (gas) bill?"
                tutorialInput.value = 0
                break;
            case 5:
                // Capture heating bill (gas)
                expenses.push({name: "heating", amount: amount})
                tutorialPrompt.innerHTML = "How much is your monthly car payment?"
                tutorialInput.value = 0
                break;
            case 6:
                // Capture car payment
                expenses.push({name: "car payment", amount: amount})
                tutorialPrompt.innerHTML = "How much is your monthly car insurance?"
                tutorialInput.value = 0
                break;
            case 7:
                // Capture insurance
                expenses.push({name: 'car insurance', amount: amount})
                tutorialPrompt.innerHTML = "How much is your monthly rent/mortgage?"
                tutorialInput.value = 0
                break;
            case 8:
                // Capture rent
                expenses.push({name: "rent", amount: amount})
                tutorialPrompt.innerHTML = "How much is your monthly renters/home insurance?"
                tutorialInput.value = 0
                break;
            case 9:
                // Capture home insurance
                expenses.push({name: "home/renters insurance", amount: amount})
                tutorialPrompt.innerHTML = "How much is your monthly internet + cable service?"
                tutorialInput.value = 0
                break;
            case 10:
                // Capture internet + cable
                expenses.push({name: "internet/cable", amount: amount})
                tutorialPrompt.innerHTML = "If you had to guess, how much do you spend on gas for you car each month?"
                tutorialInput.value = 0
                break;
            case 11:
                // Capture car gas
                expenses.push({name: "car gas", amount: amount})
                tutorialPrompt.innerHTML = "Are you paying monthly to any collections accounts? If so, enter the total amount paid each month."
                tutorialInput.value = 0
                break;
            case 12:
                // Capture Collections
                expenses.push({name: 'collections', amount: amount})
                tutorialPrompt.innerHTML = "If you have a storage unit, what is your monthly cost?"
                tutorialInput.value = 0
                break;
            case 13:
                // Capture storage unit
                expenses.push({name: "storage unit", amount: amount})
                tutorialPrompt.innerHTML = "If you have a gym membership, what is the monthly cost?"
                tutorialInput.value = 0
                break;
            case 14:
                // Capture gym membership
                expenses.push({name: 'gym membership', amount: amount})
                tutorialPrompt.innerHTML = "How much are you paying for streaming services each month (Hulu, Netflix, Apple Music etc.)"
                tutorialInput.value = 0
                break;
            case 15:
                // Capture streaming services
                expenses.push({name: 'streaming services', amount: amount})
                tutorialPrompt.innerHTML = "Enter any monthly childcare costs if you leave your child with a caretaker."
                tutorialInput.value = 0
                break;
            case 16:
                // Capture childcare costs
                expenses.push({name: 'childcare', amount: amount})
                tutorialPrompt.innerHTML = "If you had to guess, how much are you spending each month on toiletries and cleaning supplies?"
                tutorialInput.value = 0
                break;
            case 17:
                // Capture toiletries
                expenses.push({name: 'toiletries', amount: amount})
                tutorialPrompt.innerHTML = "If you have any large annual expenses (HOA, Property Taxes, etc.), enter the total amount."
                tutorialInput.value = 0
                break;
            case 18: 
                // Capture Annual Expenses
                annualExpenses.push({name: 'annual expenses', amount: amount})
                tutorialInput.style.display = "none"
                tutorialPrompt.innerHTML = "Great, you'll now have a solid foundation to manage your finances. Remember to add your debts once you're in the app. Press 'next' to save this information and get started. "
                tutorialInput.value = 0
                break;
            case 19:
                uploadUserFinances()
                appTutorial.style.display = "none"
                appMain.style.display = "block"
                tutorialInput.value = 0
                break;
        }
    }
}

function generatePageValues(){
    let statIncome = document.getElementById("statIncome")
    let statExpenses = document.getElementById("statExpenses")
    let statRemainder = document.getElementById("statRemainder")
    let statRemainderYearly = document.getElementById("statRemainderYearly")
    let statPercentage = document.getElementById("statPercentage")
    let balanceEmergencyFund = document.getElementById("balanceEmergencyFund")
    let balanceAnnualExpense = document.getElementById("balanceAnnualExpense")
    let balanceSpending = document.getElementById("balanceSpending")
    let assignmentSpending = document.getElementById("assignmentSpending")
    let assignmentEmergency = document.getElementById("assignmentEmergency")
    let assignmentAnnualExpenses = document.getElementById("assignmentAnnualExpenses")
    let assignmentDebt = document.getElementById("assignmentDebt")
    let assignmentRemaing = document.getElementById("assignmentRemaining")
    let incomesList = document.getElementById("incomesList")
    let expensesList = document.getElementById("expensesList")
    let annualExpensesList = document.getElementById("annualExpensesList")
    let debtsList = document.getElementById("debtsList")
    let totalIncome = 0
    let totalExpenses = 0
    let totalMonthlyRemainder = 0
    let totalAnnualExpenses = 0
    let totalDebts = 0

    while(incomesList.hasChildNodes()){
        incomesList.removeChild(incomesList.lastChild)
    }
    while(expensesList.hasChildNodes()){
        expensesList.removeChild(expensesList.lastChild)
    }
    while(annualExpensesList.hasChildNodes()){
        annualExpensesList.removeChild(annualExpensesList.lastChild)
    }
    while(debtsList.hasChildNodes()){
        debtsList.removeChild(debtsList.lastChild)
    }

    incomes = incomes.sort(function(a,b){return b.amount-a.amount})
    expenses = expenses.sort(function(a,b){return b.amount-a.amount})
    annualExpenses = annualExpenses.sort(function(a,b){return b.amount-a.amount})
    debts =  debts.sort(function(a,b){return b.amount-a.amount})
   
    

    for(let i = 0; i < incomes.length; i++){
        let incomeName = incomes[i].name
        let incomeAmount = incomes[i].amount
        let row = generateRow(incomeName, incomeAmount)
            row.dataset.name = incomeName
            row.dataset.amount = incomeAmount
            row.dataset.collection = "incomes"
            row.dataset.arrayposition = i
        incomesList.appendChild(row)
        totalIncome += parseInt(incomeAmount)
    }

    for(let i = 0; i < expenses.length; i++){
        let expenseName = expenses[i].name
        let expenseAmount = expenses[i].amount
        let row = generateRow(expenseName, expenseAmount)
            row.dataset.name = expenseName
            row.dataset.amount = expenseAmount
            row.dataset.collection = "expenses"
            row.dataset.arrayposition = i
        expensesList.appendChild(row)
        totalExpenses += parseInt(expenseAmount)
    }   

    for(let i = 0; i < annualExpenses.length; i++){
        let annualExpenseName = annualExpenses[i].name
        let annualExpenseAmount = annualExpenses[i].amount
        let row = generateRow(annualExpenseName, annualExpenseAmount)
            row.dataset.name = annualExpenseName
            row.dataset.amount = annualExpenseAmount
            row.dataset.collection = "annualExpenses"
            row.dataset.arrayposition = i
        annualExpensesList.appendChild(row)
        totalAnnualExpenses += parseInt(annualExpenseAmount)
    }

    for(let i = 0; i < debts.length; i++){
        let debtName = debts[i].name
        let debtAmount = debts[i].amount
        let debtApr = debts[i].apr
        let debtPayment = debts[i].payment
        let row = generateRow(debtName, debtAmount)
            row.dataset.name = debtName
            row.dataset.amount = debtAmount
            row.dataset.apr = debtApr
            row.dataset.payment = debtPayment
            row.dataset.collection = "debts"
            row.dataset.arrayposition = i
        debtsList.appendChild(row)
        totalDebts += parseInt(debtAmount)
    }

    incomesList.appendChild(generateButtonDiv("Add Income", "incomes"))
    expensesList.appendChild(generateButtonDiv("Add Expense", "expenses"))
    annualExpensesList.appendChild(generateButtonDiv("Add Annual Expense", "annualExpenses"))
    debtsList.appendChild(generateButtonDiv("Add Debt", "debts"))

    totalIncome = parseInt(totalIncome, 10)
    totalExpenses = parseInt(totalExpenses, 10)
    totalAnnualExpenses = parseInt(totalAnnualExpenses, 10)
    totalMonthlyRemainder = totalIncome - totalExpenses

    let percentage = parseInt((totalExpenses / totalIncome)*100, 10) || 0


    statIncome.innerHTML = "Total Income: $"+totalIncome
    statExpenses.innerHTML = "Total Expenses: $"+totalExpenses
    statRemainder.innerHTML = "Remaining Monthly: $"+(totalIncome-totalExpenses)
    statRemainderYearly.innerHTML = "Remaining Yearly - Annual Expenses: $"+((totalIncome*12)-(totalExpenses*12)-totalAnnualExpenses)
    statPercentage.innerHTML = "Percentage of Expenses to Income: "+percentage+"%"
    balanceEmergencyFund.value = funds[0].amount
    balanceSpending.value = funds[1].amount
    balanceAnnualExpense.value = funds[2].amount

    calculatePageAlgorithms()

    function calculatePageAlgorithms(){
        let date = new Date()
        let month = String(date.getMonth()+1).padStart(2,'0') // Jan is 0
        let monthsRemaining = 12-parseInt(month)+1
        let toAnnualExpenses = 0
        let toEmergencyFund = 0
        let toDebt = 0
        let toSpending = 0
        
        if(totalAnnualExpenses > 0 &&  balanceAnnualExpense.value < totalAnnualExpenses){
            toAnnualExpenses = (totalAnnualExpenses - balanceAnnualExpense.value) / monthsRemaining
            if(toAnnualExpenses<0)toAnnualExpenses=0
            assignmentAnnualExpenses.innerHTML = "To Annual Expense Fund: $"+parseInt(toAnnualExpenses, 10)
        }
        else{
            assignmentAnnualExpenses.innerHTML = "To Annual Expense Fund: $0"
        }

        toSpending = parseInt((totalMonthlyRemainder - toAnnualExpenses) * .30, 10)
            if(toSpending<0)toSpending = 0
            assignmentSpending.innerHTML = "To Spendable Money: $"+toSpending

        if(balanceEmergencyFund.value < 1000){
            toEmergencyFund = totalMonthlyRemainder - toAnnualExpenses - toSpending
            if(balanceEmergencyFund.value + toEmergencyFund > 1000){
                toEmergencyFund = 1000 - balanceEmergencyFund.value
            }
            if(toEmergencyFund<0)toEmergencyFund=0
            assignmentEmergency.innerHTML = "To Emergency Fund: $"+parseInt(toEmergencyFund, 10)
        }
        else{
            toEmergencyFund = 0
            assignmentEmergency.innerHTML = "To Emergency Fund: $0"
        }

        if(totalDebts > 0){
            toDebt = totalMonthlyRemainder - toAnnualExpenses - toEmergencyFund - toSpending
            if(toDebt<0)toDebt=0
            if(toDebt > totalDebts){
                toDebt = totalDebts
            }
            assignmentDebt.innerHTML = "To Debt: $"+parseInt(toDebt, 10)
        }
        else{
            assignmentDebt.innerHTML = "To Debt: $0"
        }

        let remainingExtra = parseInt(totalMonthlyRemainder - toAnnualExpenses - toDebt - toEmergencyFund - toSpending, 10)
        if(remainingExtra > 0){
           let remainingExtraToEmergency = parseInt(remainingExtra*0.4, 10)
               toEmergencyFund += remainingExtraToEmergency
           let remainingExtraToSpending = parseInt(remainingExtra*.06, 10)
            toSpending += remainingExtraToSpending
            assignmentSpending.innerHTML = "To Spendable Money: $"+toSpending
            assignmentEmergency.innerHTML = "To Emergency Fund: $"+toEmergencyFund
        }

        calculateMonthsUntilDebtFree()

       function calculateMonthsUntilDebtFree(){
            let totalDebtRemaining = 0
            let monthsPassed = 0
            let debtsListForCalculation = JSON.parse(JSON.stringify(debts));
            let steps = 0

            for(let i = 0; i < debtsListForCalculation.length; i++){
                totalDebtRemaining += debtsListForCalculation[i].amount
              }

           
            while(totalDebtRemaining > 0){

              let remainingToDebt = toDebt
                  totalDebtRemaining = 0

              for(let i = 0; i < debtsListForCalculation.length; i++){
                totalDebtRemaining += debtsListForCalculation[i].amount
              }

              
                for(let i = 0; i < debtsListForCalculation.length; i++){
                    let debtAmount = debtsListForCalculation[i].amount
                    let debtRate = (debtsListForCalculation[i].apr / 12) / 100
                    let debtPayment = debtsListForCalculation[i].payment

                    debtsListForCalculation[i].amount -= debtPayment-(debtAmount * debtRate)
                    
                          
                    if(debtsListForCalculation[i].amount >= remainingToDebt){
                        debtsListForCalculation[i].amount -= remainingToDebt
                        remainingToDebt = 0

                    }else{
                        let toSubtract = remainingToDebt - debtsListForCalculation[i].amount
                            debtsListForCalculation[i].amount -= toSubtract
                    }

                    if(debtsListForCalculation[i].amount < 0){
                        debtsListForCalculation[i].amount = 0
                    }  
                 
                }

                for(let i = 0; i < debtsListForCalculation.length; i++){
                    totalDebtRemaining += debtsListForCalculation[i].amount
                  }

                monthsPassed += 1
                steps += 1

                if(steps > 2000){
                    totalDebtRemaining = 0
                }

                if(totalDebtRemaining <= 0){
                    if(steps < 2000){
                        $('#debtFreeBanner').css('display', 'block')
                        $('#debtFreeText').html("Months Until Debt Free: "+monthsPassed)
                    }
                    else{
                        $('#debtFreeBanner').css('display', 'block')
                        $('#debtFreeText').html("Months Until Debt Free: >2000")
                    } 

                }         

            }

            if(monthsPassed <= 1){
                $('#debtFreeBanner').css('display', 'none')
            }

        }

        toAnnualExpenses = 0
        toEmergencyFund = 0
        toDebt = 0
        toSpending = 0
        remainingExtra = 0
    
    }

}

function generateRow(name, amount){

    // Used to generate items in generatePageValues()

    let div = document.createElement('div')
          div.classList.add("p-3")
          div.classList.add("m-2")
          div.classList.add("mx-auto")
          div.classList.add("w-100")
          div.classList.add("rounded-3")
          div.classList.add("budgetItem")
          div.style.background = 'rgba(255,255,255,0.1)'
          div.style.color = 'white'
          div.onclick = function(){
              setCurrentItem(div.dataset)
          }
         div.dataset.bsToggle = "modal"
         div.dataset.bsTarget = "#itemModal"
    let text = document.createTextNode(name+":  $"+amount)
    
          div.appendChild(text)
        
          return div

}

function setCurrentItem(dataset){
    let nameModalInput = document.getElementById("nameModalInput")
    let amountModalInput = document.getElementById("amountModalInput")
    let aprModalInput = document.getElementById("aprModalInput")
    let paymentModalInput = document.getElementById("paymentModalInput")
    let nextPayoff = document.getElementById("nextPayoff")
    let apr = dataset.apr
    let payment = dataset.payment
    let amount = dataset.amount
    let name = dataset.name
    let nextPayoffAmount = parseInt((amount-(payment-amount*(apr/12/100))))||0

    // Leave these two alone, used globally to track selected items
    arrayposition = dataset.arrayposition
    collection = dataset.collection
    

    switch(collection){
        case 'debts':
            aprModalInput.value = apr
            paymentModalInput.value = payment
            nextPayoff.innerHTML = "Next Payoff: $"+nextPayoffAmount
            $('.debtInput').css('display', 'block')
            break;
        default:
            $('.debtInput').css('display', 'none')
            break;
    }
    
    nameModalInput.value = name
    amountModalInput.value = amount
}

function uploadUserFinances(){
    $('#modalLoading').modal('show')

    let userInfo = [{incomes: incomes,
                    expenses: expenses,
                    debts: debts,
                    annualExpenses: annualExpenses,
                    funds: funds,
                    isFirstLogin: false}]

    fetch("/post-UserFinances", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body : JSON.stringify(userInfo)
    }).then((response)=>{
        getUserInfo()
        $('#modalLoading').modal('hide')
    }).catch(()=>{
       
    })

}

function generateButtonDiv(buttonText, buttonCollection){
    // Creates row div with button. Used in generatePageValues() to append these buttons at end of generation
    let createItemModal = document.getElementById("createItemModal")
    let createItemModalHeader = document.getElementById("createItemModalHeader")
    let div = document.createElement("div")
        div.classList.add('row')
        div.classList.add('w-auto')
    let button = document.createElement("button")
        button.classList.add("btn")
        button.classList.add("btn-primary")
        button.dataset.bsToggle = "modal"
        button.dataset.bsTarget = "#createItemModal"
        button.innerHTML = buttonText
        

    switch(buttonCollection){
        case 'incomes':
            button.addEventListener('click', function(){
                createItemModalHeader.innerHTML = "Add Income"
                createItemModal.dataset.collection = "incomes"
                $('.debtInput').css('display', 'none')
            })
            break;
        case 'expenses':
            button.addEventListener('click', function(){
                createItemModalHeader.innerHTML = "Add Expense"
                createItemModal.dataset.collection = "expenses"
                $('.debtInput').css('display', 'none')
            })
            break;
        case 'annualExpenses':
            button.addEventListener('click', function(){
                createItemModalHeader.innerHTML = "Add Annual Expense"
                createItemModal.dataset.collection = "annualExpenses"
                $('.debtInput').css('display', 'none')
            })
            break;
        case 'debts':
            button.addEventListener('click', function(){
                createItemModalHeader.innerHTML = "Add Debt"
                createItemModal.dataset.collection = "debts"
                $('.debtInput').css('display', 'block')
            })
            break;
    }

        div.appendChild(button)
        return div
}
