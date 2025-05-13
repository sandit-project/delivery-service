$(document).ready(function () {
    checkToken();
    setupAjax();

    // 메뉴 수정 정보를 불러옵니다.
    const menuName = window.location.pathname.split('/').pop();
    $.ajax({
        url: "/menus/"+ menuName,
        method: "GET",
        success: function (menu) {
            // 불러온 메뉴 정보로 폼 초기화
            $('input[name="menuName"]').val(menu.menuName);
            $('input[name="price"]').val(menu.price);
            $('input[name="calorie"]').val(menu.calorie);
            $('select[name="status"]').val(menu.status.toLowerCase());

            // 기존 이미지 URL 설정
            $("#imgUrl").val(menu.img);

            // 기존 재료 데이터에 맞게 select 박스 선택 값 설정
            setSelectedValue('bread', menu.bread);
            setSelectedValue('material1', menu.material1);
            setSelectedValue('material2', menu.material2);
            setSelectedValue('material3', menu.material3);
            setSelectedValue('cheese', menu.cheese);
            setSelectedValue('sauce1', menu.sauce1);
            setSelectedValue('sauce2', menu.sauce2);
            setSelectedValue('sauce3', menu.sauce3);

            // 채소 데이터 설정
            for (let i = 1; i <= 8; i++) {
                setSelectedValue(`vegetable${i}`, menu[`vegetable${i}`]);
            }
        },
        error: function (xhr) {
            console.error("메뉴 정보 로딩 실패:", xhr.status, xhr.responseText);
        }
    });

    // 메뉴 수정 버튼 클릭 시 처리
    $("#updateBtn").on('click', function () {
        const formData = new FormData();
        const fileInput = $('#img')[0].files[0];

        if (fileInput) {
            formData.append("file", fileInput); // 새 이미지가 있을 때만
        }

        // 셀렉터에서 값 추출 (null 허용)
        const getValue = (name, allowEmpty = false) => {
            const val = $(`[name="${name}"]`).val();
            return allowEmpty ? val : val || null;
        };

        const menuData = {
            menuName: getValue('menuName'),
            price: parseInt(getValue('price'), 10),
            calorie: parseFloat(getValue('calorie')),

            bread: getValue('breadId'),
            material1: getValue('material1Id'),
            material2: getValue('material2Id'),
            material3: getValue('material3Id'),
            cheese: getValue('cheeseId'),

            vegetable1: getValue('vegetable1Id'),
            vegetable2: getValue('vegetable2Id'),
            vegetable3: getValue('vegetable3Id'),
            vegetable4: getValue('vegetable4Id'),
            vegetable5: getValue('vegetable5Id'),
            vegetable6: getValue('vegetable6Id'),
            vegetable7: getValue('vegetable7Id'),
            vegetable8: getValue('vegetable8Id'),

            sauce1: getValue('sauce1Id'),
            sauce2: getValue('sauce2Id'),
            sauce3: getValue('sauce3Id'),

            status: getValue('status') === "active" ? "ACTIVE" : "DELETED",
            img: $("#imgUrl").val() || null
        };

        const jsonBlob = new Blob([JSON.stringify(menuData)], { type: "application/json" });
        formData.append("menu", jsonBlob);

        $.ajax({
            url: "/menus/" + encodeURIComponent(menuData.menuName),
            type: "PUT",
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                alert("메뉴 정보가 성공적으로 수정되었습니다.");
                window.location.href = "/menus/list";
            },
            error: function (xhr) {
                console.error("수정 실패:", xhr.status, xhr.responseText);
                alert("수정 중 오류가 발생했습니다. \n" + xhr.responseText);
            }
        });
    });

    // 메뉴 수정 시 선택 가능한 재료와 옵션을 Ajax로 불러옵니다.
    loadIngredientOptions('bread', 'bread');
    loadIngredientOptions('cheese', 'cheese');
    loadIngredientOptions('material', 'material');
    loadIngredientOptions('vegetable', 'vegetable');
    loadIngredientOptions('sauce', 'sauce');


    // Select 박스 옵션 채우기
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
        }).fail(function (xhr) {
            console.error(`${type} 로딩 실패:`, xhr.status, xhr.responseText);
        });
    }

    // 선택된 값을 셀렉트 박스에 설정
    function setSelectedValue(selectorPrefix, selectedValue) {
        if (selectedValue) {
            $(`select[name="${selectorPrefix}Id"]`).val(selectedValue);
        }
    }
});
