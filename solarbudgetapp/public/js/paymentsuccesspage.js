

checkMembership()
function checkMembership(){

        fetch('/get-UserSoftInfo', {method:'GET'}).then((result)=>{
            result.json().then((userInfo)=>{
                if(userInfo.membershipStatus == 'active'){
                    location.href = 'appmain.html'
                }else{
                    setTimeout(function(){checkMembership()}, 2000)
                }
            }).catch(()=>{})
        }).catch(()=>{})
    

    
    
}