$(document).ready(() => {
    let timerInterval;

    function formatTime(sec) {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    function startTimer() {
        let timeLeft = 180;
        $('#timer').text(formatTime(timeLeft));
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                $('#timer').text('만료');
                $('#email-verify').prop('disabled', true);
            } else {
                $('#timer').text(formatTime(timeLeft));
            }
        }, 1000);
    }

    // 1) 코드 전송
    $('#email-submit').on('click', async () => {
        const rawEmail = $('#email').val().trim();
        if (!rawEmail) return alert('이메일을 입력해주세요!');
        const email = encodeURIComponent(rawEmail);

        try {
            await $.ajax({
                type: 'GET',
                url: `/auths/email/${email}/authcode`,
                dataType: 'text'
            });
            alert('인증 코드가 발송되었습니다!');
            $('#email-code-group').show();
            startTimer();
        } catch (err) {
            if (err.status === 400) {
                // 400번만 특별 처리
                alert('이미 사용 중인 이메일입니다.');
            } else {
                alert('인증 코드 발송에 실패했습니다.');
            }
        }
    });

    // 2) 코드 검증
    $('#email-verify').on('click', async () => {
        const rawEmail = $('#email').val().trim();
        if (!rawEmail) return alert('이메일을 입력해주세요!');
        const email = encodeURIComponent(rawEmail);

        const code = $('#email_code').val().trim();
        if (!code) return alert('코드를 입력해주세요!');

        try {
            const token = await $.ajax({
                type: 'POST',
                url: `/auths/email/${email}/authcode`,
                data: JSON.stringify({ email: rawEmail, code }),
                contentType: 'application/json; charset=utf-8',
                dataType: 'text'
            });

            console.log('검증 토큰:', token);
            // 토큰 문자열이 비어있지 않으면 성공
            if (token && token.length > 0) {
                clearInterval(timerInterval);
                alert('이메일 인증 완료!');
                $('#email, #email-submit, #email_code, #email-verify').prop('disabled', true);
                // 필요하다면 token을 로컬스토리지나 hidden field 등에 저장
            } else {
                alert('인증 코드가 올바르지 않습니다.');
            }
        } catch (err) {
            // 404 → 코드 불일치
            if (err.status === 404) {
                alert('인증 코드가 올바르지 않습니다.');
            } else {
                console.error('검증 오류:', err.status, err.responseText);
                alert('검증 중 오류가 발생했습니다.');
            }
        }
    });
});
