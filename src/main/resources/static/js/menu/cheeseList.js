$(document).ready(function () {
    checkToken();
    setupAjax();
    // 치즈 목록 불러오기
    function loadCheeses() {
        $.ajax({
            url: "/menus/cheeses",
            type: "GET",
            dataType: "json",
            success: function (data) {
                const cheeseTableBody = $("#cheeseTableBody");
                cheeseTableBody.empty();

                data.forEach(cheese => {
                    const row = `<tr>
                      
                        <td>${cheese.cheeseName}</td>
                        <td>${cheese.calorie}</td>
                        <td>${cheese.price}</td>
                        <td><img src="${cheese.img}" alt="치즈 이미지" width="50"></td>
                        <td>${cheese.status}</td>
                        <td>
                            <a href="/cheeses/edit/${encodeURIComponent(cheese.cheeseName)}">수정</a>
                            <button class="delete-btn" data-cheesename="${cheese.cheeseName}">삭제</button>
                        </td>
                    </tr>`;
                    cheeseTableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
                console.error("치즈 목록을 불러오는 중 오류 발생:", error);
            }
        });
    }

    // 삭제 버튼 클릭 이벤트
    $(document).on("click", ".delete-btn", function () {
        let cheeseName = $(this).data("cheesename");

        if (!cheeseName) {
            alert("삭제할 치즈 이름이 없습니다.");
            return;
        }

        if (confirm("정말 삭제하시겠습니까?")) {
            $.ajax({
                url: "/menus/cheeses/" + encodeURIComponent(cheeseName),
                type: "DELETE",
                success: function () {
                    alert("치즈가 삭제되었습니다!");
                    loadCheeses(); // 목록 새로고침
                },
                error: function () {
                    alert("삭제 중 오류가 발생했습니다.");
                }
            });
        }
    });

    // 페이지 로드 시 치즈 목록 불러오기
    loadCheeses();
});
