var ticketForm = document.getElementById("ticketForm")

function sendFormData(){
    
        let formData = new FormData(ticketForm)

        fetch('/put-Ticket', {
            method: 'PUT',
            body: formData
            }).then((response)=>{
                
                    response.text().then((text)=>{
                        if(text == "error"){
                            alert("An error has occured.")
                        }
                        else if(text == "success"){
                            alert("Your ticket has been submitted. Please allow 48 hours for a response. Thank you.")
                            location.href = "appmain.html"
                        }
                    })
                
               
            })
       
    
}


ticketForm.addEventListener("submit", function(event){
    event.preventDefault()
    sendFormData()
})