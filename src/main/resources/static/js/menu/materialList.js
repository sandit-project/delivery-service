$(document).ready(function () {
    checkToken();
    setupAjax();

    // 재료 목록 불러오기
    function loadMaterials() {
        $.ajax({
            url: "/menus/materials",
            type: "GET",
            dataType: "json",
            success: function (data) {
                const materialTableBody = $("#materialTableBody");
                materialTableBody.empty();

                data.forEach(material => {
                    const row = `<tr>
                        
                        <td>${material.materialName}</td>
                        <td>${material.calorie}</td>
                        <td>${material.price}</td>
                        <td><img src="${material.img}" alt="재료 이미지" width="50"></td>
                        <td>${material.status}</td>
                        <td>
                            <a href="/materials/edit/${encodeURIComponent(material.materialName)}">수정</a>
                            <button class="delete-btn" data-materialname="${material.materialName}">삭제</button>
                        </td>
                    </tr>`;
                    materialTableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
                console.error("재료 목록을 불러오는 중 오류 발생:", error);
            }
        });
    }

    // 삭제 버튼 클릭 이벤트
    $(document).on("click", ".delete-btn", function () {
        let materialName = $(this).data("materialname");

        if (!materialName) {
            alert("삭제할 재료 이름이 없습니다.");
            return;
        }

        if (confirm("정말 삭제하시겠습니까?")) {
            $.ajax({
                url: "/menus/materials/" + encodeURIComponent(materialName),
                type: "DELETE",
                success: function () {
                    alert("재료가 삭제되었습니다!");
                    loadMaterials(); // 목록 새로고침
                },
                error: function () {
                    alert("삭제 중 오류가 발생했습니다.");
                }
            });
        }
    });

    // 페이지 로드 시 재료 목록 불러오기
    loadMaterials();
});
