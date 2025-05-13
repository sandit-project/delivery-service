let userInfo;

$(document).ready(()=>{
    checkToken();
    setupAjax();
    requestProfileApi();

    $('#updateProfileBtn').on("click",() => {
        requestUpdateProfile();
    });
});

let requestProfileApi = () => {
    checkToken();
    setupAjax();

    $.ajax({
        type: 'GET',
        url: '/profile',
        success: (response) => {
            userInfo = response;
            $('#welcome-message').text(response.userName + '님 환영합니다!');
            $('#hiddenUserName').val(response.userName);
            $('#hiddenUserId').val(response.userId);
            $('#hiddenUserRole').val(response.role);
            $('#user_name').text(response.userName);
            $('#user_email').text(response.email);
            $('#user_phone').text(response.phone);
            $('#created_date').text(response.createdDate);
            $('#user_point').text(response.point);
            $('#user_type').text(response.type);
            $('#main_address').text(response.mainAddress);
            $('#sub_address1').text(response.subAddress1);
            $('#sub_address2').text(response.subAddress2);

            console.log(response);
        },
        error : (error) => {
            console.error('profile in error :: ',error);
            alert('프로필 요청 중 오류가 발생했습니다.');
            if(error.status === 401){
                // 토큰 만료 에러 메세지에 따라 refreshToken 보냄
                handleTokenExpiration();
            }
        }
    });
}

let requestUpdateProfile = () => {
    setupAjax();
    $.ajax({
        type: 'GET',
        url: '/member/profile/update',
        success: ()=>{
            window.location.href = "/member/profile/update"
        },
        error: (error)=>{
            console.log('오류 발생 : ',error);
        }
    });
}