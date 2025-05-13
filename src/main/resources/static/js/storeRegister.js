$(document).ready(() => {
    checkToken();
    setupAjax();

    // 지점 등록 버튼 클릭 이벤트
    $('#storeRegister').click(async (event) => {
        event.preventDefault(); // 기본 동작 막기

        const button = $(event.target);
        button.prop('disabled', true); // 버튼 비활성화

        try {
            // 입력 데이터 수집
            const storeName = $('#store_name').val();
            const storeManagerUid = $('#store_manager_uid').val();
            const address = $('#store_address_base').val();
            const addressDetail = $('#store_address_detail').val();
            const fullAddress = addressDetail? `${address} ${addressDetail}` : address ;
            const postcode = $('#store_postcode').val();
            const storeLatitude = $('#store_latitude').val();
            const storeLongitude = $('#store_longitude').val();
            const status = 'ACTIVE';

            if (!storeName || !address || !postcode) {
                alert('모든 항목을 입력해주세요.');
                return;
            }

            // 서버로 전송할 데이터 생성
            const formData = {
                storeName,
                managerUid: storeManagerUid,
                storeAddress: fullAddress,
                storePostcode: postcode,
                storeLatitude: storeLatitude,
                storeLongitude: storeLongitude,
                storeStatus: status,
            };

            console.log('전송 데이터: ', formData);

            // 서버로 데이터 전송
            await sendDataToServer(formData);

            alert('지점가입이 성공했습니다.');
            window.location.href = '/store/list'; // 페이지 이동
        } catch (error) {
            console.error('오류 발생: ', error);
            alert('처리 중 문제가 발생했습니다. 다시 시도해주세요.');
        } finally {
            button.prop('disabled', false); // 버튼 활성화
        }
    });


    // 서버 데이터 전송 함수
    const sendDataToServer = async (formData) => {
        return $.ajax({
            type: 'POST',
            url: '/stores',
            data: JSON.stringify(formData),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        });
    };

    // 이전 화면
    $('#prevBtn').click(()=> {

        window.location.href = '/store/list';

    });
});