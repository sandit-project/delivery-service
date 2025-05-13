let checkToken = () => {
    let token = localStorage.getItem("accessToken");
    if(token == null || token.trim() === ''){
        window.location.href = '/member/login';
    }
}

let setupAjax = () => {
    $.ajaxSetup({
        beforeSend: (xhr) => {
            let token = localStorage.getItem("accessToken");
            if(token){
                xhr.setRequestHeader('Authorization','Bearer ' + token);
            }
        }
    })
}

let getUserInfo = () => {
    return new Promise((resolve,reject)=>{
        $.ajax({
            type: 'GET',
            url: '/user/info',
            success:(response)=>{
                resolve(response);
            },
            error: (xhr)=>{
                console.log("xhr :: ",xhr);
                if(xhr.status === 401){
                    // 토큰 만료 에러 메세지에 따라 refreshToken 보냄
                    handleTokenExpiration();
                }else{
                    reject(xhr);
                }
            }
        })
    });
}

let handleTokenExpiration = () => {
    $.ajax({
       type : 'POST',
       url : '/refresh-token',
       contentType : 'application/json; charset=utf-8',
       dataType : 'json',
       xhrFields : {
           withCredentials : true
       },
        success : (response) => {
           localStorage.setItem('accessToken',response.accessToken);
            location.reload();
        },
        error : (error) => {
           console.error('token error :: ',error);
           alert('로그인이 필요합니다.\n다시 로그인해주세요.');
           window.location.href = '/member/login';
        }
    });
}