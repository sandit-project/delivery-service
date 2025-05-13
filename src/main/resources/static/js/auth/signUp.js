$(document).ready(() => {
    $('#signup').on('click', async function(e) {
        e.preventDefault();
        const btn = $(this).prop('disabled', true);

        // 1) 폼 값 수집
        const userId     = $('#user_id').val().trim();
        const password   = $('#password').val().trim();
        const userName   = $('#user_name').val().trim();
        const email      = $('#email').val().trim();
        const emailAgree = $('#emailyn').is(':checked') ? 'Y' : 'N';
        const phoneAgree = $('#phoneyn').is(':checked') ? 'Y' : 'N';
        const phone      = $('#phone').val().trim();
        const baseAddress   = $('#main_address_base').val().trim();
        const detailAddress = $('#main_address_detail').val().trim();
        const mainAddress   = detailAddress ? `${baseAddress} ${detailAddress}` : baseAddress;
        const role       = $('#role').val();

        if (!userId || !password || !userName || !mainAddress) {
            alert('필수 입력 항목을 모두 채워주세요.');
            return btn.prop('disabled', false);
        }

        // 2) hidden에서 세팅된 좌표 읽기
        const mainLat = parseFloat($('#main_latitude').val());
        const mainLan = parseFloat($('#main_longitude').val());
        if (isNaN(mainLat) || isNaN(mainLan)) {
            alert('주소 찾기 후 회원가입해주세요.');
            return btn.prop('disabled', false);
        }

        // 3) payload 구성
        const payload = {
            userId,
            password,
            userName,
            email,
            phone,
            mainAddress: `${$('#main_address_base').val().trim()} ${$('#main_address_detail').val().trim()}`.trim(),
            role: $('#role').val(),
            mainLat: mainLat,
            mainLan: mainLan,
            phoneyn: phoneAgree,
            emailyn: emailAgree
        };

        console.log('회원가입 payload:', payload);

        try {
            // 4) 실제 가입 요청
            const res = await $.ajax({
                type: 'POST',
                url: '/join',
                data: JSON.stringify(payload),
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json'
            });

            console.log(res);

            if (res.success) {
                alert('회원가입 성공!');
                location.href = '/member/login';
            } else {
                alert('회원가입에 실패했습니다.');
            }
        } catch (err) {
            const msg = err.responseJSON?.message || '오류가 발생했습니다.';
            alert(msg);
            console.error('회원가입 오류:', err);
        } finally {
            btn.prop('disabled', false);
        }
    });
});
