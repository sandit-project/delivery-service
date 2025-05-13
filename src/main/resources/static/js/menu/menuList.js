$(document).ready(function () {
    checkToken();
    setupAjax();
    // 메뉴 목록을 Ajax로 로드
    function loadMenus() {
        $.ajax({
            url: "/menus", // 메뉴 데이터를 반환하는 API URL
            type: "GET",
            dataType: "json", // 서버에서 JSON 형식으로 응답 받음

            success: function (data) {
                renderMenuList(data);
            },
            error: function (xhr, status, error) {
                console.error(`메뉴 목록 불러오기 실패 [${status}]:`, error);
                alert("메뉴 목록을 불러오는 중 오류가 발생했습니다.");
            }
        });
    }

    // 메뉴 목록을 HTML 테이블에 렌더링
    function renderMenuList(menus) {
        const menuTableBody = $("#menuTableBody");
        menuTableBody.empty(); // 기존 내용을 비웁니다.

        menus.forEach(menu => {
            const imgTag = menu.img
                ? `<img src="${menu.img}" alt="메뉴 이미지" width="50">`
                : `<span>이미지 없음</span>`;

            const rowHtml = `
                <tr>
                    <td>${menu.menuName}</td>
                    <td>${menu.price}</td>
                    <td>${menu.calorie}</td>
                    <td>${imgTag}</td>
                    <td>${menu.breadName || '없음'}</td>
                    <td>${menu.material1Name || '없음'}</td>
                    <td>
                        <ul>
                            <li>${menu.material2Name || ''}</li>
                            <li>${menu.material3Name || ''}</li>
                        </ul>
                    </td>
                    <td>${menu.cheeseName || '없음'}</td>
                    <td>
                        <ul>
                            <li>${menu.vegetable1Name || ''}</li>
                            <li>${menu.vegetable2Name || ''}</li>
                            <li>${menu.vegetable3Name || ''}</li>
                            <li>${menu.vegetable4Name || ''}</li>
                            <li>${menu.vegetable5Name || ''}</li>
                            <li>${menu.vegetable6Name || ''}</li>
                            <li>${menu.vegetable7Name || ''}</li>
                            <li>${menu.vegetable8Name || ''}</li>
                        </ul>
                    </td>
                    <td>
                        <ul>
                            <li>${menu.sauce1Name || ''}</li>
                            <li>${menu.sauce2Name || ''}</li>
                            <li>${menu.sauce3Name || ''}</li>
                        </ul>
                    </td>
                    <td>${menu.status}</td>
                    <td>
                        <a href="/menus/edit/${encodeURIComponent(menu.menuName)}">수정</a>
                    </td>
                    <td>
                        <button class="delete-btn" data-menuName="${menu.menuName}">삭제</button>
                    </td>
                </tr>
            `;
            menuTableBody.append(rowHtml);
        });
    }

    // 메뉴 목록 로드
    loadMenus();

    // 삭제 버튼 클릭 처리
    $(document).on("click", ".delete-btn", function () {
        const menuName = $(this).data("menuname");
        deleteMenu(menuName);
    });

    // 메뉴 삭제
    function deleteMenu(menuName) {
        if (!menuName) {
            alert("삭제할 메뉴 이름이 없습니다.");
            return;
        }

        if (!confirm(`'${menuName}' 메뉴를 삭제하시겠습니까?`)) return;

        $.ajax({
            url: "/menus/" + encodeURIComponent(menuName),
            type: "DELETE",
            success: function () {
                alert("메뉴가 삭제되었습니다!");
                loadMenus(); // 삭제 후 메뉴 목록 새로 고침
            },
            error: function (xhr, status, error) {
                console.error(`삭제 실패 [${status}]:`, error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        });
    }
});
