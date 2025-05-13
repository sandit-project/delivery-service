$(document).ready(function () {
    checkToken();
    setupAjax();

    const params = new URLSearchParams(window.location.search);
    const storeUid = params.get("storeUid");

    // 지점 상세 조회
    $.ajax({
        url: `/stores/${storeUid}`,
        method: 'GET',
        success: function (data) {
            console.log('지점 상세 조회 :',data);
            $('#store_uid').val(data.storeUid);
            $('#store_name').val(data.storeName);
            $('#store_manager').val(data.managerUid)
            $('#address').val(data.storeAddress);
            $('#postcode').val(data.storePostcode);
            $('#store_latitude').val(data.storeLatitude);
            $('#store_longitude').val(data.storeLongitude);
            $('#status').val(data.storeStatus)
        },
        error: function () {
            alert('지점 정보를 불러오는데 실패했습니다.');
        }
    });



    // 수정 요청
    $('#storeDetailForm').submit(function (e) {
        e.preventDefault();

        const formData = {
            storeName: $('#store_name').val(),
            storeAddress: $('#address').val(),
            storePostcode: $('#postcode').val(),
            storeLatitude : $('#store_latitude').val(),
            storeLongitude : $('#store_longitude').val(),
            storeStatus: $('#status').val()
        };

        $.ajax({
            url: `/stores/${storeUid}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                alert('수정 성공!');
                window.location.href = '/store/list';
            },
            error: function () {
                alert('수정 실패!');
            }
        });
    });

    // 삭제 요청
    $('#deleteBtn').click(function () {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        $.ajax({
            url: `/stores/${storeUid}`,
            method: 'DELETE',
            success: function () {
                alert('삭제 성공!');
                window.location.href = '/store/list';
            },
            error: function () {
                alert('삭제 실패!');
            }
        });
    });

    // 이전 화면
    $('#prevBtn').click(()=> {

        window.location.href = '/store/list';

    });
});
