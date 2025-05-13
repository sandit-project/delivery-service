$(document).ready(function () {
    checkToken();
    setupAjax();

    // 야채 목록 불러오기
    function loadVegetables() {
        $.ajax({
            url: "/menus/vegetables",
            type: "GET",
            dataType: "json",
            success: function (data) {
                const vegetableTableBody = $("#vegetableTableBody");
                vegetableTableBody.empty();

                data.forEach(vegetable => {
                    const row = `<tr>
                        
                        <td>${vegetable.vegetableName}</td>
                        <td>${vegetable.calorie}</td>
                        <td>${vegetable.price}</td>
                        <td><img src="${vegetable.img}" alt="야채 이미지" width="50"></td>
                        <td>${vegetable.status}</td>
                        <td>
                            <a href="/vegetables/edit/${encodeURIComponent(vegetable.vegetableName)}">수정</a>
                            <button class="delete-btn" data-vegetablename="${vegetable.vegetableName}">삭제</button>
                        </td>
                    </tr>`;
                    vegetableTableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
                console.error("야채 목록을 불러오는 중 오류 발생:", error);
            }
        });
    }

    // 삭제 버튼 클릭 이벤트
    $(document).on("click", ".delete-btn", function () {
        let vegetableName = $(this).data("vegetablename");

        if (!vegetableName) {
            alert("삭제할 야채 이름이 없습니다.");
            return;
        }

        if (confirm("정말 삭제하시겠습니까?")) {
            $.ajax({
                url: "/menus/vegetables/" + encodeURIComponent(vegetableName),
                type: "DELETE",
                success: function () {
                    alert("야채가 삭제되었습니다!");
                    loadVegetables(); // 목록 새로고침
                },
                error: function () {
                    alert("삭제 중 오류가 발생했습니다.");
                }
            });
        }
    });

    // 페이지 로드 시 야채 목록 불러오기
    loadVegetables();
});
