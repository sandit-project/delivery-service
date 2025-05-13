$(function() {
    // common.js 초기화
    setupAjax();
    checkToken();

    // 1) 회원 정보 불러와서 폼에 채우기
    getUserInfo()
        .then(function(userInfo) {
            // userInfo 예시: { uid: 1, userName: '홍길동', socialUid: 123, ... }
            $('#createUserUid').val(userInfo.uid);
            $('#createSocialUid').val(userInfo.socialUid || '');
            $('#createUserName').text(userInfo.userName);
        })
        .catch(function() {
            $('#createResponse').text('❗ 회원 정보를 불러오는 데 실패했습니다.');
        });

    // 2) 리뷰 작성 이벤트
    $('#createForm').on('submit', function(e) {
        e.preventDefault();

        // payload 재구성 (userUid, socialUid는 이미 채워져 있음)
        const payload = {
            userUid:   parseInt($('#createUserUid').val(), 10),
            socialUid: parseInt($('#createSocialUid').val(), 10),
            orderUid:  parseInt($('#createOrderUid').val(), 10),
            rate:      parseFloat($('#createRate').val()),
            title:     $('#createTitle').val().trim(),
            content:   $('#createContent').val().trim()
        };

        // 유효성 검사
        if (isNaN(payload.orderUid) || isNaN(payload.rate)) {
            $('#createResponse').text('❗ 주문 UID 또는 평점을 올바르게 입력해주세요.');
            return;
        }

        // AJAX POST
        $.ajax({
            url: '/reviews',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload)
        })
            .done(function(res) {
                $('#createResponse').text('✅ ' + JSON.stringify(res, null, 2));
                $('#createForm')[0].reset();
                // 사용자 이름은 초기화되지 않도록 재세팅
                getUserInfo().then(ui => $('#createUserName').text(ui.userName));
            })
            .fail(function(xhr) {
                if (xhr.status === 401) return; // 로그인/토큰 문제는 common.js에서 처리
                let msg = `❌ (${xhr.status}) 서버 오류`;
                try {
                    const err = JSON.parse(xhr.responseText);
                    msg = err.message || JSON.stringify(err);
                } catch (ignored) {}
                $('#createResponse').text(msg);
            });
    });
});
