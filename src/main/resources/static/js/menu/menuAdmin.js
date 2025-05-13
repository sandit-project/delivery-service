$(document).ready(function () {
    checkToken();
    setupAjax();
    // 빵, 재료, 치즈, 소스 옵션 로딩
    loadIngredientOptions("bread");
    loadIngredientOptions("cheese");
    loadIngredientOptions("material", "material");
    loadIngredientOptions("vegetable", "vegetable");
    loadIngredientOptions("sauce", "sauce");

    // 채소 셀렉트박스 8개 동적 생성
    for (let i = 1; i <= 8; i++) {
        $('#vegetableSelects').append(`<select name="vegetable${i}" id="vegetable${i}Select"><option value="">선택 안 함</option></select><br>`);
    }

    // 메뉴 등록 버튼 이벤트
    $("#submitBtn").on("click", function (event) {
        event.preventDefault();

        const fileInput = $("#img")[0].files[0];
        if (!fileInput) {
            alert("이미지를 업로드해야 합니다.");
            return;
        }

        const getValue = (name, allowEmpty = false) => {
            const val = $(`[name='${name}']`).val();
            return allowEmpty ? val : val || null;
        };

        const price = parseInt(getValue("price"), 10);
        const calorie = parseFloat(getValue("calorie"));

        if (isNaN(price) || price <= 0) {
            alert("가격은 0보다 큰 숫자여야 합니다.");
            return;
        }

        if (isNaN(calorie) || calorie < 0) {
            alert("칼로리는 0 이상 숫자여야 합니다.");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileInput);

        const menuData = {
            menuName: getValue("menuName"),
            price: price,
            calorie: calorie,
            bread: getValue("bread"),
            material1: getValue("material1"),
            material2: getValue("material2"),
            material3: getValue("material3"),
            cheese: getValue("cheese"),
            sauce1: getValue("sauce1"),
            sauce2: getValue("sauce2"),
            sauce3: getValue("sauce3"),
            status: getValue("status") === "active" ? "ACTIVE" : "DELETED"
        };

        // 채소 추가
        for (let i = 1; i <= 8; i++) {
            menuData[`vegetable${i}`] = getValue(`vegetable${i}`, true);
        }

        const jsonBlob = new Blob([JSON.stringify(menuData)], { type: "application/json" });
        formData.append("menu", jsonBlob);

        $.ajax({
            url: "/menus",
            type: "POST",
            data: formData,
            enctype: "multipart/form-data",
            processData: false,
            contentType: false,
            success: function () {
                alert("메뉴가 성공적으로 등록되었습니다!");
                window.location.href = "/menus/list";
            },
            error: function (xhr) {
                console.error("등록 실패:", xhr.status, xhr.responseText);
                alert("메뉴 등록 중 오류가 발생했습니다:\n" + xhr.responseText);
            }
        });
    });
});

// 재료 로딩 함수
function loadIngredientOptions(type, selectorPrefix = type) {
    const ingredientEndpoints = {
        bread: { url: "/menus/ingredients/breads", nameField: "breadName" },
        cheese: { url: "/menus/ingredients/cheeses", nameField: "cheeseName" },
        material: { url: "/menus/ingredients/materials", nameField: "materialName" },
        vegetable: { url: "/menus/ingredients/vegetables", nameField: "vegetableName" },
        sauce: { url: "/menus/ingredients/sauces", nameField: "sauceName" }
    };

    const { url, nameField } = ingredientEndpoints[type];

    $.get(url, function (data) {
        $(`select[name^="${selectorPrefix}"]`).each(function () {
            const select = $(this);
            select.empty();
            select.append(`<option value="">선택 안 함</option>`);

            data.forEach(item => {
                const name = item[nameField];
                const option = `<option value="${item.uid}" data-price="${item.price}" data-calorie="${item.calorie}">${name}</option>`;
                select.append(option);
            });
        });
    });
}
