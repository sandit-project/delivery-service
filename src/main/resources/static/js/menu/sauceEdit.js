$(document).ready(function () {
    checkToken();
    setupAjax();
    const sauceName = window.location.pathname.split('/').pop();

    $.ajax({
        url: "/menus/sauces/" + sauceName,
        type: "GET",
        success: function (sauce) {
            $('#uid').val(sauce.uid);
            $('#sauceName').val(sauce.sauceName);
            $('#calorie').val(sauce.calorie);
            $('#price').val(sauce.price);
            $('#status').val(sauce.status.toLowerCase());
            $('#currentImg').attr('src', sauce.img);
            $('#imgUrl').val(sauce.img);
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            alert("소스 정보 불러오기 중 오류가 발생했습니다.");
        }
    });

    $("#updateBtn").on("click", function () {
        let fileInput = $("#img")[0].files[0];

        let sauceData = {
            sauceName: $("#sauceName").val(),
            calorie: parseFloat($("#calorie").val()),
            price: parseInt($("#price").val(), 10),
            status: $("#status").val() === "active" ? "ACTIVE" : "DELETED",
            img: $("#imgUrl").val()
        };

        let formData = new FormData();
        let jsonBlob = new Blob([JSON.stringify(sauceData)], { type: "application/json" });
        formData.append("sauce", jsonBlob);

        if (fileInput) {
            formData.append("file", fileInput);
        }

        $.ajax({
            url: "/menus/sauces/" + encodeURIComponent(sauceData.sauceName),
            type: "PUT",
            data: formData,
            enctype: "multipart/form-data",
            processData: false,
            contentType: false,
            success: function () {
                alert("소스 정보가 수정되었습니다!");
                window.location.href = "/sauces/list";
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                alert("소스 정보 수정 중 오류가 발생했습니다.");
            }
        });
    });
});
