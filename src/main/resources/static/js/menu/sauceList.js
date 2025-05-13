$(document).ready(function () {
    checkToken();
    setupAjax();
    // 소스 목록 불러오기
    function loadSauces() {
        $.ajax({
            url: "/menus/sauces",
            type: "GET",
            dataType: "json",
            success: function (data) {
                const sauceTableBody = $("#sauceTableBody");
                sauceTableBody.empty();

                data.forEach(sauce => {
                    const row = `<tr>
                       
                        <td>${sauce.sauceName}</td>
                        <td>${sauce.calorie}</td>
                        <td>${sauce.price}</td>
                        <td><img src="${sauce.img}" alt="소스 이미지" width="50"></td>
                        <td>${sauce.status}</td>
                        <td>
                            <a href="/sauces/edit/${encodeURIComponent(sauce.sauceName)}">수정</a>
                            <button class="delete-btn" data-saucename="${sauce.sauceName}">삭제</button>
                        </td>
                    </tr>`;
                    sauceTableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
                console.error("소스 목록을 불러오는 중 오류 발생:", error);
            }
        });
    }

    // 삭제 버튼 클릭 이벤트
    $(document).on("click", ".delete-btn", function () {
        let sauceName = $(this).data("saucename");

        if (!sauceName) {
            alert("삭제할 소스 이름이 없습니다.");
            return;
        }

        if (confirm("정말 삭제하시겠습니까?")) {
            $.ajax({
                url: "/menus/sauces/" + encodeURIComponent(sauceName),
                type: "DELETE",
                success: function () {
                    alert("소스가 삭제되었습니다!");
                    loadSauces(); // 목록 새로고침
                },
                error: function () {
                    alert("삭제 중 오류가 발생했습니다.");
                }
            });
        }
    });

    // 페이지 로드 시 소스 목록 불러오기
    loadSauces();
});
