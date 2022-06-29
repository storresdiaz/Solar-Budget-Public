var accountForm = document.getElementById("accountForm")

function getStarted(){
    window.scrollTo(0, 0)
}

function sendFormData(){
    
        let formData = new FormData(accountForm)

        fetch('/put-CreateAccount', {
            method: 'PUT',
            body: formData
            }).then((response)=>{
                
                    response.text().then((text)=>{
                        if(text == "exists"){
                            alert("An account with this email already exists.")
                        }
                        else if(text == "mismatch"){
                            alert("Passwords do not match.")
                        }
                        else if(text == "invalid-email"){
                            alert("Email is not valid.")
                        }
                        else{
                            location.href = "account-creation-success.html"
                        }
                    })
                
               
            })
       
    
}


accountForm.addEventListener("submit", function(event){
    event.preventDefault()
    sendFormData()
})

