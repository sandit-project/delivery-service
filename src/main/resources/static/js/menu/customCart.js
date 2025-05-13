$(document).ready(function () {
    checkToken();
    setupAjax();
    const defaultExcludeTexts = [
        "선택 안 함", "빵을 선택하세요", "소스를 선택하세요", "재료를 선택하세요", "채소를 선택하세요"
    ];

    // 선택값 가져오는 헬퍼
    function getSelectValue(name) {
        return $(`select[name="${name}"]`).val();
    }

    // 가격 및 칼로리 계산 함수
    function calculatePriceAndCalories() {
        let totalPrice = 0;
        let totalCalorie = 0;
        let selectedItems = [];

        $('select').each(function () {
            const selected = $(this).find(':selected');
            const price = parseInt(selected.data('price')) || 0;
            const calorie = parseFloat(selected.data('calorie')) || 0;
            const text = selected.text();

            totalPrice += price;
            totalCalorie += calorie;

            if (text && !defaultExcludeTexts.includes(text)) {
                selectedItems.push(text);
            }
        });

        $('#totalPriceText').text(totalPrice);
        $('#totalCalorieText').text(totalCalorie.toFixed(1));
        $('#selectionText').text(selectedItems.length ? selectedItems.join(" / ") : "선택 항목이 없습니다.");

        $('input[name="price"]').val(totalPrice);
        $('input[name="calorie"]').val(totalCalorie.toFixed(1));
    }

    // 재료 로딩 함수
    const loadIngredients = () => {
        const ingredientEndpoints = {
            bread: { url: "/menus/ingredients/breads", nameField: "breadName" },
            cheese: { url: "/menus/ingredients/cheeses", nameField: "cheeseName" },
            material: { url: "/menus/ingredients/materials", nameField: "materialName" },
            vegetable: { url: "/menus/ingredients/vegetables", nameField: "vegetableName" },
            sauce: { url: "/menus/ingredients/sauces", nameField: "sauceName" }
        };

        const loadIngredientOptions = (type, selectorPrefix = type) => {
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
        };

        loadIngredientOptions("bread");
        loadIngredientOptions("cheese");
        loadIngredientOptions("material", "material");
        loadIngredientOptions("vegetable", "vegetable");
        loadIngredientOptions("sauce", "sauce");
    };

    // 장바구니 추가 Ajax 요청
    function addCustomCart() {
        const breadId = getSelectValue("bread");
        const material1Id = getSelectValue("material1");
        const vegetable1Id = getSelectValue("vegetable1");
        const sauce1Id = getSelectValue("sauce1");
        const cheeseId = getSelectValue("cheese");

        if (!breadId || !material1Id || !vegetable1Id || !sauce1Id || !cheeseId) {
            alert("모든 필수 항목을 선택해야 합니다.");
            return;
        }

        const customCartDTO = {
            bread: breadId,
            material1: material1Id,
            material2: getSelectValue("material2"),
            material3: getSelectValue("material3"),
            cheese: cheeseId,
            sauce1: sauce1Id,
            sauce2: getSelectValue("sauce2"),
            sauce3: getSelectValue("sauce3"),
            vegetable1: vegetable1Id,
            vegetable2: getSelectValue("vegetable2"),
            vegetable3: getSelectValue("vegetable3"),
            vegetable4: getSelectValue("vegetable4"),
            vegetable5: getSelectValue("vegetable5"),
            vegetable6: getSelectValue("vegetable6"),
            vegetable7: getSelectValue("vegetable7"),
            vegetable8: getSelectValue("vegetable8"),
            price: parseInt($('input[name="price"]').val()) || 0,
            calorie: parseFloat($('input[name="calorie"]').val()) || 0
        };

        // undefined나 문자열 "undefined"를 null 처리
        Object.keys(customCartDTO).forEach(key => {
            if (customCartDTO[key] === "undefined" || customCartDTO[key] === undefined) {
                customCartDTO[key] = null;
            }
        });

        $.ajax({
            url: '/menus/custom-carts',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(customCartDTO),
            success: function () {
                alert('저장 완료!');
                location.href = '/cart';
            },
            error: function (xhr) {
                if (xhr.status === 400 && xhr.responseJSON) {
                    const errors = xhr.responseJSON;
                    let errorMessage = "입력 오류:\n";
                    for (const [field, message] of Object.entries(errors)) {
                        errorMessage += `- ${field}: ${message}\n`;
                    }
                    alert(errorMessage);
                } else {
                    alert('저장에 실패했습니다. 다시 시도해 주세요.');
                }
            }
        });
    }

    // 폼 제출 시 처리
    $('#menuForm').on('submit', function (e) {
        e.preventDefault();

        const requiredFields = ["bread", "material1", "vegetable1", "sauce1", "cheese"];
        let allSelected = requiredFields.every(name => !!getSelectValue(name));

        if (!allSelected) {
            $('#warningMessage').fadeIn();
            return;
        }

        $('#warningMessage').fadeOut();
        addCustomCart();
    });

    // 셀렉트 변경 시 가격/칼로리 갱신
    $('select').on('change', calculatePriceAndCalories);

    // 페이지 로딩 시 초기 데이터 로드
    loadIngredients();
    calculatePriceAndCalories();
});
