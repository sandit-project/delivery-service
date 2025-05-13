$(document).ready(function () {
    checkToken();
    setupAjax();
    // URL에서 cheeseName을 가져오기 (예: /menus/cheeses/edit/치즈이름)
    const cheeseName = window.location.pathname.split('/').pop();  // URL에서 마지막 부분을 가져옴

    // Ajax 요청으로 서버에서 치즈 정보 받아오기
    $.ajax({
        url: "/menus/cheeses/" + cheeseName,  // cheeseName을 URL에 사용하여 해당 치즈의 정보를 가져옴
        type: "GET",
        success: function (cheese) {
            // 서버에서 받은 cheese 객체로 폼 채우기
            $('#uid').val(cheese.uid);
            $('#cheeseName').val(cheese.cheeseName);
            $('#calorie').val(cheese.calorie);
            $('#price').val(cheese.price);
            $('#status').val(cheese.status.toLowerCase());
            $('#currentImg').attr('src', cheese.img);
            $('#imgUrl').val(cheese.img);  // 기존 이미지 URL 유지
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            alert("치즈 정보 불러오기 중 오류가 발생했습니다.");
        }
    });

    // 수정 버튼 클릭 시 처리
    $("#updateBtn").on("click", function () {
        let fileInput = $("#img")[0].files[0];

        let cheeseData = {
            cheeseName: $("#cheeseName").val(),
            calorie: parseFloat($("#calorie").val()),
            price: parseInt($("#price").val(), 10),
            status: $("#status").val() === "active" ? "ACTIVE" : "DELETED",
            img: $("#imgUrl").val() // 기존 이미지 URL 유지
        };

        let formData = new FormData();
        let jsonBlob = new Blob([JSON.stringify(cheeseData)], { type: "application/json" });
        formData.append("cheese", jsonBlob); // 백엔드에서 @RequestPart로 받음

        if (fileInput) {
            formData.append("file", fileInput); // 새 이미지가 있을 경우만 추가
        }

        $.ajax({
            url: "/menus/cheeses/" + encodeURIComponent(cheeseData.cheeseName),  // cheeseName을 경로에 사용
            type: "PUT",
            data: formData,
            enctype: "multipart/form-data",
            processData: false,
            contentType: false,
            success: function () {
                alert("치즈 정보가 수정되었습니다!");
                window.location.href = "/cheeses/list";  // 수정 완료 후 목록 페이지로 이동
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                alert("치즈 정보 수정 중 오류가 발생했습니다.");
            }
        });
    });
});
