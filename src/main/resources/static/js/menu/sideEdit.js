$(document).ready(function () {
    checkToken();
    setupAjax();
    const sideName = window.location.pathname.split('/').pop();

    $.ajax({
        url: "/menus/sides/" + sideName,
        type: "GET",
        success: function (side) {
            $('#uid').val(side.uid);
            $('#sideName').val(side.sideName);
            $('#calorie').val(side.calorie);
            $('#price').val(side.price);
            $('#status').val(side.status.toLowerCase());
            $('#currentImg').attr('src', side.img);
            $('#imgUrl').val(side.img);
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            alert("사이드 정보 불러오기 중 오류가 발생했습니다.");
        }
    });

    $("#updateBtn").on("click", function () {
        let fileInput = $("#img")[0].files[0];

        let sideData = {
            sideName: $("#sideName").val(),
            calorie: parseFloat($("#calorie").val()),
            price: parseInt($("#price").val(), 10),
            status: $("#status").val() === "active" ? "ACTIVE" : "DELETED",
            img: $("#imgUrl").val()
        };

        let formData = new FormData();
        let jsonBlob = new Blob([JSON.stringify(sideData)], { type: "application/json" });
        formData.append("side", jsonBlob);

        if (fileInput) {
            formData.append("file", fileInput);
        }

        $.ajax({
            url: "/menus/sides/" + encodeURIComponent(sideData.sideName),
            type: "PUT",
            data: formData,
            enctype: "multipart/form-data",
            processData: false,
            contentType: false,
            success: function () {
                alert("사이드 정보가 수정되었습니다!");
                window.location.href = "/sides/list";
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                alert("사이드 정보 수정 중 오류가 발생했습니다.");
            }
        });
    });
});
