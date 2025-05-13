$(document).ready(function () {
    checkToken();
    setupAjax();

    const menuName = window.location.pathname.split('/').pop(); // URL에서 메뉴 이름 추출

    // 메뉴 상세 정보 Ajax 호출
    $.ajax({
        type: "GET",
        url: `/menus/${menuName}`,
        success: function (data) {
            // 타이틀 업데이트
            $("#pageTitle").text("메뉴 상세 - " + data.menuName);
            $("#menuTitle").text(data.menuName);
            $("#menuImage").attr("src", data.img);
            $("#menuPrice").text(data.price);
            $("#menuCalorie").text(data.calorie);
            $("#breadName").text(data.breadName);
            $("#cheeseName").text(data.cheeseName);

            // 재료 목록 배열 정의
            const materials = [
                { name: data.material1Name, img: data.material1Img },
                { name: data.material2Name, img: data.material2Img },
                { name: data.material3Name, img: data.material3Img }
            ];
            const sauces = [
                { name: data.sauce1Name, img: data.sauce1Img },
                { name: data.sauce2Name, img: data.sauce2Img },
                { name: data.sauce3Name, img: data.sauce3Img }
            ];
            const vegetables = [
                { name: data.vegetable1Name, img: data.vegetable1Img },
                { name: data.vegetable2Name, img: data.vegetable2Img },
                { name: data.vegetable3Name, img: data.vegetable3Img },
                { name: data.vegetable4Name, img: data.vegetable4Img },
                { name: data.vegetable5Name, img: data.vegetable5Img },
                { name: data.vegetable6Name, img: data.vegetable6Img },
                { name: data.vegetable7Name, img: data.vegetable7Img },
                { name: data.vegetable8Name, img: data.vegetable8Img }
            ];

            // 태그 렌더링
            renderTags(materials, "#materialTags");
            renderTags(sauces, "#sauceTags");
            renderTags(vegetables, "#vegetableTags");
        },
        error: function (xhr) {
            alert("정보를 불러오는 데 오류가 발생했습니다.");
        }
    });

    // 태그 렌더링 함수
    function renderTags(items, targetElement) {
        items.forEach(item => {
            if (item.name) {
                const imageUrl = item.img || "/images/default.png"; // 이미지 없을 시 대체 이미지
                const tagHtml = `
                    <span class="tag tag-with-img">
                        <img src="${imageUrl}" class="tag-icon" alt="${item.name}" />
                        ${item.name}
                    </span>
                `;
                $(targetElement).append(tagHtml);
            }
        });
    }
});
