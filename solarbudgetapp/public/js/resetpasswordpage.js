let email = ''
let attempts = 0
let code = 0


setup()

function setup(){
    $('#resetForm').css("display", "block")
    $('#codeForm').css("display", "none")
    $('#passwordForm').css("display", "none")

    $('#resetForm').on("submit", function(event){
        event.preventDefault()

        let form = document.getElementById("resetForm")
        let formData = new FormData(form)
        
        fetch('/requestResetCode', {
            method: 'PUT',
            body: formData
        }).then((response)=>{

                response.json().then((responseData)=>{
                    if(responseData.status == "done"){
                        $('#resetForm').css("display", "none")
                        $('#codeForm').css("display", "block")
                        $('#passwordForm').css("display", "none")
                    }
                    if(responseData.status == "failed"){
                        alert("An error has occured.")
                    }
                    email = responseData.email
                })
            
        }).catch((reponse)=>{
            alert('An error has occured')
        })
    })

    $('#codeForm').on('submit', function(event){
        event.preventDefault()
        let form = document.getElementById('codeForm')
        let formData = new FormData(form)
            formData.append("email", email)

        fetch('/validateResetCode', {
            method: 'PUT',
            body: formData
        }).then((response)=>{
            
            response.json().then((responseData)=>{
                let attemptsRemaing = 4 - responseData.attempts
                switch(responseData.status){
                    case 'done':
                        $('#resetForm').css("display", "none")
                        $('#codeForm').css("display", "none")
                        $('#passwordForm').css("display", "block")
                        code = responseData.code
                        break;
                    case 'incorrect':
                        alert("You have "+attemptsRemaing+" attempts remaining before your account is locked.")
                        break;
                    case 'locked':
                        alert("Your account has been locked for security purposes, please contact support.")
                        break;
                    case 'failed':
                        alert("An error has occured")
                        break;
                }
            })

        }).catch((reponse)=>{

        })
    })

    $('#passwordForm').on("submit", function(event){
        event.preventDefault()

        let form = document.getElementById("passwordForm")
        let formData = new FormData(form)
            formData.append('email', email)
            formData.append('code', code)
        
        fetch('/requestPasswordReset', {
            method: 'PUT',
            body: formData
        }).then((response)=>{

                response.json().then((responseData)=>{
                   switch(responseData.status){
                       case 'done':
                           location.href = "loginpage.html"
                           break;
                       case 'mismatch':
                            alert("Your passwords do not match.")
                           break;
                       case 'failed':
                           alert('An error has occured. Please contact support.')
                           break;
                   }
                })
            
        }).catch((reponse)=>{
            alert('An error has occured')
        })
    })



}