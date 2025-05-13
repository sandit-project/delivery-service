$(document).ready(() => {
    requestProfileApi();

    $('#updateProfileBtn').on("click",()=>{
        requestProfileUpdate();
    });
});

let requestProfileApi = () => {
    checkToken();
    setupAjax();

    $.ajax({
        type: 'GET',
        url: '/profile',
        success: (response) => {
            $('#welcome-message').text(response.userName + '님 환영합니다!');
            $('#user_name').val(response.userName);
            $('#email').val(response.email);
            $('#phone').val(response.phone);
            $('#main_address_base').val(response.mainAddress);
            $('#sub1_address_base').val(response.subAddress1);
            $('#sub2_address_base').val(response.subAddress2);

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

let requestProfileUpdate = () => {
    setupAjax();

    const userName = $('#user_name').val();
    const email = $('#email').val();
    const emailyn = $('#emailyn').val() === "on";
    const phone = $('#phone').val();
    const phoneyn = $('#phoneyn').val() === "on";
    const baseMainAddress   = $('#main_address_base').val().trim();
    const detailMainAddress = $('#main_address_detail').val().trim();
    const mainAddress   = detailMainAddress ? `${baseMainAddress} ${detailMainAddress}` : baseMainAddress;
    const baseSub1Address   = $('#sub1_address_base').val().trim();
    const detailSub1Address = $('#sub1_address_detail').val().trim();
    const subAddress1   = detailSub1Address ? `${baseSub1Address} ${detailSub1Address}` : baseSub1Address;
    const baseSub2Address   = $('#sub2_address_base').val().trim();
    const detailSub2Address = $('#sub2_address_detail').val().trim();
    const subAddress2   = detailSub2Address ? `${baseSub2Address} ${detailSub2Address}` : baseSub2Address;

    if (!userName || !mainAddress) {
        alert('필수 입력 항목을 모두 채워주세요.');
    }

    // 2) hidden에서 세팅된 좌표 읽기
    const mainLat = parseFloat($('#main_latitude').val());
    const mainLan = parseFloat($('#main_longitude').val());
    const sub1Lat = parseFloat($('#sub1_latitude').val());
    const sub1Lan = parseFloat($('#sub1_longitude').val());
    const sub2Lat = parseFloat($('#sub2_latitude').val());
    const sub2Lan = parseFloat($('#sub2_longitude').val());

    let updateProfileData = {
        userName : userName,
        email : email,
        emailyn : emailyn? "y" : "n" ,
        phone : phone,
        phoneyn : phoneyn? "y" : "n" ,
        mainAddress : mainAddress,
        subAddress1 : subAddress1,
        subAddress2 : subAddress2
    }
    console.log(updateProfileData);
    $.ajax({
        type : 'PUT',
        url : '/profile',
        data : JSON.stringify(updateProfileData),
        contentType : 'application/json; charset=utf-8',
        dataType : 'json',
        success : () => {
            alert('회원 정보가 수정 되었습니다.');
            window.location.href = '/member/profile';
        },
        error : (error) => {
            console.error('update error :: ',error);
            alert('회원 정보가 수정 중 오류가 발생했습니다.');
        }
    });
}