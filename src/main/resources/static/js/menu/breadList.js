$(document).ready(function () {
    checkToken();
    setupAjax();

    function loadBreads() {
        $.ajax({
            url: "/menus/breads",  // ✅ 새 API 경로
            type: "GET",
            dataType: "json",
            success: function (data) {
                const breadTableBody = $("#breadTableBody");
                breadTableBody.empty();

                data.forEach(bread => {
                    const row = `<tr>
                       
                        <td>${bread.breadName}</td>
                        <td>${bread.calorie}</td>
                        <td>${bread.price}</td>
                        <td><img src="${bread.img}" alt="빵 이미지" width="50"></td>
                        <td>${bread.status}</td>
                        <td>
                            <a href="/breads/edit/${encodeURIComponent(bread.breadName)}">수정</a>
                            <button class="delete-btn" data-breadname="${bread.breadName}">삭제</button>
                        </td>
                    </tr>`;
                    breadTableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
                console.error("빵 목록을 불러오는 중 오류 발생:", error);
            }
        });
    }

    $(document).on("click", ".delete-btn", function () {
        const breadName = $(this).data("breadname");

        if (!breadName) {
            alert("삭제할 빵 이름이 없습니다.");
            return;
        }

        if (confirm("정말 삭제하시겠습니까?")) {
            $.ajax({
                url: "/menus/breads/" + encodeURIComponent(breadName),  // ✅ 수정된 DELETE 경로
                type: "DELETE",
                success: function () {
                    alert("빵이 삭제되었습니다!");
                    loadBreads();
                },
                error: function () {
                    alert("삭제 중 오류가 발생했습니다.");
                }
            });
        }
    });

    // 페이지 로딩 시 호출
    loadBreads();
});
