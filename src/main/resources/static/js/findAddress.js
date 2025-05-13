function execDaumPostcode(addressType) {
    new daum.Postcode({
        oncomplete: async function(data) {
            // 1) 화면에 표시
            if(addressType === "main"){
                $('#main_postcode').val(data.zonecode);
                $('#main_address_base').val(data.address);
            }else if(addressType === "sub1"){
                $('#sub1_postcode').val(data.zonecode);
                $('#sub1_address_base').val(data.address);
            }else if(addressType === "sub2"){
                $('#sub2_postcode').val(data.zonecode);
                $('#sub2_address_base').val(data.address);
            }else if(addressType === "store"){
                $('#store_postcode').val(data.zonecode);
                $('#store_address_base').val(data.address);
            }


            // 2) 백엔드에 좌표 요청
            try {
                const coords = await $.ajax({
                    type: 'GET',
                    url: '/api/geocode',
                    data: { address: data.address },
                    dataType: 'json'
                });

                // 3) 받아온 lat/lng를 hidden 필드에 세팅
                if (coords.lat != null && coords.lng != null) {
                    if(addressType === "main"){
                        $('#main_latitude').val(coords.lat);
                        $('#main_longitude').val(coords.lng);
                    }else if(addressType === "sub1"){
                        $('#sub1_latitude').val(coords.lat);
                        $('#sub1_longitude').val(coords.lng);
                    }else if(addressType === "sub2"){
                        $('#sub2_latitude').val(coords.lat);
                        $('#sub2_longitude').val(coords.lng);
                    }else if(addressType === "store"){
                        $('#store_latitude').val(coords.lat);
                        $('#store_longitude').val(coords.lng);
                    }
                } else {
                    console.warn('좌표 변환 결과가 비어있습니다.', coords);
                }
            } catch (err) {
                console.error('좌표 조회 에러:', err);
                alert('주소 변환에 실패했습니다.');
            }
        }
    }).open();
}

$(document).ready(() => {
    // "우편번호" 입력란이나 "주소 찾기" 버튼 클릭 시 팝업 띄우기
    $('#main_postcode, #mainAddress-kakao').on('click', ()=>{
        execDaumPostcode("main");
    });
    $('#sub1_postcode, #subAddress1-kakao').on('click', ()=>{
        execDaumPostcode("sub1");
    });
    $('#sub2_postcode, #subAddress2-kakao').on('click', ()=>{
        execDaumPostcode("sub2");
    });
    $('#store_postcode, #store_address_base').on('click', ()=>{
        execDaumPostcode("store");
    });
});
