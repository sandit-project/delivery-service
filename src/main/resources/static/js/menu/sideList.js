$(document).ready(function () {
    checkToken();
    setupAjax();

    // 사이드 목록 불러오기
    function loadSides() {
        $.ajax({
            url: "/menus/sides",
            type: "GET",
            dataType: "json",
            success: function (data) {
                const sideTableBody = $("#sideTableBody");
                sideTableBody.empty();

                data.forEach(side => {
                    const row = `<tr>
                      
                        <td>${side.sideName}</td>
                        <td>${side.calorie}</td>
                        <td>${side.price}</td>
                        <td><img src="${side.img}" alt="사이드 이미지" width="50"></td>
                        <td>${side.status}</td>
                        <td>
                            <a href="/sides/edit/${encodeURIComponent(side.sideName)}">수정</a>
                            <button class="delete-btn" data-sidename="${side.sideName}">삭제</button>
                        </td>
                    </tr>`;
                    sideTableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
                console.error("사이드 목록을 불러오는 중 오류 발생:", error);
            }
        });
    }

    // 삭제 버튼 클릭 이벤트
    $(document).on("click", ".delete-btn", function () {
        let sideName = $(this).data("sidename");

        if (!sideName) {
            alert("삭제할 사이드 이름이 없습니다.");
            return;
        }

        if (confirm("정말 삭제하시겠습니까?")) {
            $.ajax({
                url: "/menus/sides/" + encodeURIComponent(sideName),
                type: "DELETE",
                success: function () {
                    alert("사이드가 삭제되었습니다!");
                    loadSides(); // 목록 새로고침
                },
                error: function () {
                    alert("삭제 중 오류가 발생했습니다.");
                }
            });
        }
    });

    // 페이지 로드 시 사이드 목록 불러오기
    loadSides();
});
