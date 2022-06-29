var accountForm = document.getElementById("accountForm")
var buttonGetStarted = document.getElementById('buttonGetStarted')

function getStarted(){
    location.href='createaccountpage.html'
}

function sendFormData(){
    
        let formData = new FormData(accountForm)

        fetch('/put-Login', {
            method: 'PUT',
            body: formData
            }).then((response)=>{
                
                    response.text().then((text)=>{
                        if(text == "incorrect"){
                            alert("Incorrect Email or Password")
                        }
                        else if(text == "success"){
                            location.href = "appmain.html"
                        }
                    })
                
               
            })
       
    
}


accountForm.addEventListener("submit", function(event){
    event.preventDefault()
    sendFormData()
})