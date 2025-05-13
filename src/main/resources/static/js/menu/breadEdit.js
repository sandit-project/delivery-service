$(document).ready(function () {
    checkToken();
    setupAjax();
    // URL에서 breadName을 가져오기 (예: /menus/breads/edit/식빵)
    const breadName = window.location.pathname.split('/').pop();  // URL에서 마지막 부분을 가져옴

    // Ajax 요청으로 서버에서 빵 정보 받아오기
    $.ajax({
        url: "/menus/breads/" + breadName,  // breadName을 URL에 사용하여 해당 빵의 정보를 가져옴
        type: "GET",
        success: function (bread) {
            // 서버에서 받은 bread 객체로 폼 채우기
            $('#uid').val(bread.uid);
            $('#breadName').val(bread.breadName);
            $('#calorie').val(bread.calorie);
            $('#price').val(bread.price);
            $('#status').val(bread.status.toLowerCase());
            $('#currentImg').attr('src', bread.img);
            $('#imgUrl').val(bread.img);  // 기존 이미지 URL 유지
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            alert("빵 정보 불러오기 중 오류가 발생했습니다.");
        }
    });

    // 수정 버튼 클릭 시 처리
    $("#updateBtn").on("click", function () {
        let fileInput = $("#img")[0].files[0];

        let breadData = {
            breadName: $("#breadName").val(),
            calorie: parseFloat($("#calorie").val()),
            price: parseInt($("#price").val(), 10),
            status: $("#status").val() === "active" ? "ACTIVE" : "DELETED",
            img: $("#imgUrl").val() // 기존 이미지 URL 유지
        };

        let formData = new FormData();
        let jsonBlob = new Blob([JSON.stringify(breadData)], { type: "application/json" });
        formData.append("bread", jsonBlob);

        if (fileInput) {
            formData.append("file", fileInput); // 새 이미지가 있을 경우 추가
        }

        $.ajax({
            url: "/menus/breads/" + encodeURIComponent(breadData.breadName),  // breadName을 경로에 사용
            type: "PUT",
            data: formData,
            enctype: "multipart/form-data",
            processData: false,
            contentType: false,  // enctype은 불필요
            success: function () {
                alert("빵 정보가 수정되었습니다!");
                window.location.href = "/breads/list";  // 수정 완료 후 목록 페이지로 이동
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                alert("빵 정보 수정 중 오류가 발생했습니다.");
            }
        });
    });
});
