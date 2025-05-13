$(document).ready(function () {
    checkToken();
    setupAjax();
    loadCartItems();

    $("#selectAll").on("change", function () {
        $(".item-checkbox").prop("checked", this.checked);
    });

    $(document).on("change", ".item-checkbox", function () {
        const allChecked = $(".item-checkbox").length === $(".item-checkbox:checked").length;
        $("#selectAll").prop("checked", allChecked);
    });

    $(document).on("click", ".update-btn", function () {
        const row = $(this).closest("tr");
        const id = row.data("id");
        const newAmount = parseInt(row.find(".amount-input").val());

        if (!newAmount || newAmount < 1) {
            alert("수량은 1 이상이어야 합니다.");
            return;
        }

        updateCartItemAmount(id, newAmount);
    });

    $(document).on("click", ".delete-btn", function () {
        const row = $(this).closest("tr");
        const id = row.data("id");

        if (confirm("정말 삭제하시겠습니까?")) {
            deleteCartItem(id, row);
        }
    });

    $("#deleteSelected").click(function () {
        const selectedIds = $(".item-checkbox:checked").map(function () {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            alert("삭제할 항목을 선택하세요.");
            return;
        }

        if (!confirm(`${selectedIds.length}개 항목을 삭제할까요?`)) return;

        $.post("/menus/cart/delete-selected", $.param({ selectedIds }))
            .done(response => renderCartItems(response.cartItems))
            .fail(() => alert("선택 삭제 실패"));
    });

    $("#checkout").click(function () {
        const $btn = $(this).prop("disabled", true).text("처리 중...");
        $.post("/menus/cart/order/checkout")
            .done(() => {
                alert("결제 완료!");
                loadCartItems();
            })
            .fail(response => {
                alert(response.responseText);
            })
            .always(() => $btn.prop("disabled", false).text("결제하기"));
    });

    $("#backToHome").click(function () {
        window.location.href = "/";
    });
});

function loadCartItems() {
    $.get("/menus/cart", function (response) {
        console.log(response);  // 응답 내용 확인
        renderCartItems(response.cartItems);
    }).fail(() => alert("장바구니 로딩 실패"));
}

function renderCartItems(items) {
    const $tbody = $("#cartTableBody").empty();
    let totalQuantity = 0;
    let totalPrice = 0;

    items.forEach(item => {
        const rowHtml = `
            <tr data-id="${item.uid}">
                <td><input type="checkbox" class="item-checkbox" value="${item.uid}"></td>
                <td class="menu-name">
                    <img src="${item.img}" alt="${item.menuName}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                    ${item.menuName}
                </td>
                <td>
                    <input type="number" min="1" value="${item.amount}" class="amount-input">
                    <button type="button" class="update-btn">변경</button>
                </td>
                <td class="item-price">${item.unitPrice.toLocaleString()}</td>
                <td class="total-cell">${(item.unitPrice * item.amount).toLocaleString()}</td>
                <td><button type="button" class="delete-btn">삭제</button></td>
            </tr>
        `;

        $tbody.append(rowHtml);
        totalQuantity += item.amount;
        totalPrice += item.unitPrice * item.amount;
    });

    $("#totalQuantity").text(totalQuantity);
    $("#totalPrice").text(totalPrice.toLocaleString());
}

function updateCartItemAmount(id, newAmount) {
    $.ajax({
        url: `/menus/cart/update/${id}`,
        type: "POST",
        data: { amount: newAmount },
        success: function (response) {
            renderCartItems(response.cartItems);
        },
        error: function () {
            alert("수량 변경 실패");
        }
    });
}

function deleteCartItem(id, row) {
    $.ajax({
        url: `/menus/cart/delete/${id}`,
        type: "POST",
        success: function (response) {
            row.remove();
            renderCartItems(response.cartItems);
        },
        error: function () {
            alert("삭제 실패");
        }
    });
}
