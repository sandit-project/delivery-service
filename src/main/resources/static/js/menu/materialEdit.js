$(document).ready(function () {
    checkToken();
    setupAjax();
    // URL에서 materialName을 가져오기 (예: /menus/materials/edit/햄)
    const materialName = window.location.pathname.split('/').pop();

    // 서버에서 해당 material 정보 조회
    $.ajax({
        url: "/menus/materials/" + materialName,
        type: "GET",
        success: function (material) {
            $('#uid').val(material.uid);
            $('#materialName').val(material.materialName);
            $('#calorie').val(material.calorie);
            $('#price').val(material.price);
            $('#status').val(material.status.toLowerCase());
            $('#currentImg').attr('src', material.img);
            $('#imgUrl').val(material.img);  // 기존 이미지 URL 유지
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            alert("재료 정보 불러오기 중 오류가 발생했습니다.");
        }
    });

    // 수정 버튼 클릭 시
    $("#updateBtn").on("click", function () {
        let fileInput = $("#img")[0].files[0];

        let materialData = {
            materialName: $("#materialName").val(),
            calorie: parseFloat($("#calorie").val()),
            price: parseInt($("#price").val(), 10),
            status: $("#status").val() === "active" ? "ACTIVE" : "DELETED",
            img: $("#imgUrl").val()
        };

        let formData = new FormData();
        let jsonBlob = new Blob([JSON.stringify(materialData)], { type: "application/json" });
        formData.append("material", jsonBlob);

        if (fileInput) {
            formData.append("file", fileInput);
        }

        $.ajax({
            url: "/menus/materials/" + encodeURIComponent(materialData.materialName),
            type: "PUT",
            data: formData,
            enctype: "multipart/form-data",
            processData: false,
            contentType: false,
            success: function () {
                alert("재료 정보가 수정되었습니다!");
                window.location.href = "/materials/list";
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                alert("재료 정보 수정 중 오류가 발생했습니다.");
            }
        });
    });
});
