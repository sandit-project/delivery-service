$(document).ready(()=>{

    $('#signin').on('click',()=>{

        let userId = $('#user_id').val();
        let password = $('#password').val();

        let signInData = {
            userId : userId,
            password : password
        }

        $.ajax({
           type: 'POST',
           url: '/login',
           data: JSON.stringify(signInData),
           contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: (response) => {
               alert('로그인이 성공했습니다.');
               localStorage.setItem('accessToken',response.accessToken);
               window.location.href = '/home';
            },
            error : (error) => {
                console.error('log in error :: ',error);
                alert('로그인 중 오류가 발생했습니다.');
            }
        });
    });

});