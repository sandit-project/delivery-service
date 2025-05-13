$(document).ready(function () {
    $("#submitBtn").on("click", function () {
        checkToken();
        setupAjax();

        let fileInput = $("#img")[0].files[0];

        if (!fileInput) {
            alert("이미지를 업로드해야 합니다.");
            return;
        }

        let formData = new FormData();
        formData.append("file", fileInput); // 이미지 파일 추가

        let breadData = {
            breadName: $("#breadName").val(),
            calorie: parseFloat($("#calorie").val()),
            price: parseInt($("#price").val(), 10),
            status: $("#status").val() === "active" ? "ACTIVE" : "DELETED",
            img: fileInput.name,  // img 필드에 업로드된 파일의 이름을 추가

        };

        // ✅ JSON 데이터를 Blob으로 변환하여 FormData에 추가 (올바른 Content-Type 설정)
        let jsonBlob = new Blob([JSON.stringify(breadData)], { type: "application/json" });
        formData.append("bread", jsonBlob); // 백엔드에서 @RequestPart("bread")와 일치

        // ✅ Ajax 요청
        $.ajax({
            url: "/menus/breads",
            type: "POST",
            data: formData,
            enctype: "multipart/form-data",
            processData: false,
            contentType: false,
            success: function () {
                alert("빵 정보가 등록되었습니다!");
                window.location.href = "/breads/list";
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                alert("빵 정보 등록 중 오류가 발생했습니다.");
            }
        });
    });
});
