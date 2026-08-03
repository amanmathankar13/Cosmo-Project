import login from '@salesforce/apex/LoginController.login';


handleLogin(){

    login({
        username:this.username,
        password:this.password
    })
    .then(result=>{

        window.location.href = result;

    })
    .catch(error=>{

        this.errorMessage =
        error.body.message;

    });

}