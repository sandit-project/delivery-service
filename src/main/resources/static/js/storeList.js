$(document).ready(()=>{
    checkToken();
    setupAjax();

    //최초 페이지(1)는 lastUid가 null 이어야 함
    cursorMap.set(1,null);
    initStoreList();

});

let cursorMap=new Map();//페이지번호 => lastUid 매핑
let page= 1;
let limit=10

let initStoreList=() =>{
    //최초 페이지 로드(page 1)
    loadStores({ limit, lastUid: cursorMap.get(page)});

    $('#nextPage').click(() => {
        if ($('#nextPage').prop('disabled')) return;
        //다음 페이지 커서가 있다면 페이지 번호 증가 후 해당 커서로 로드
        if (cursorMap.has(page + 1)) {
            page++;
            loadStores({limit, lastUid: cursorMap.get(page)});
        }
    });


    $('#prevPage').click(() => {
        if ($('prevPage').prop('disabled')) return;
        if(page>1){
            page--;
            loadStores({ limit, lastUid: cursorMap.get(page) });
        }
    });


    $('#firstPage').click((event)=>{
        page=1;
        //1페이지는 항상 null
        loadStores({ limit, lastUid: cursorMap.get(1) });
    });
};

let loadStores = ({ limit, lastUid }) => {
    let url = `/stores/list?limit=${limit}`;
    if (lastUid !== null && lastUid !== undefined) {
        url += `&lastUid=${lastUid}`;
    }

    $.ajax({
        type: 'GET',
        url: url,
        success: (response) => {
            $('#storeContent').empty();

            if (response.storeList.length === 0) {
                $('#storeContent').append(`<tr><td colspan="6" style="text-align: center;">지점이 존재하지 않습니다.</td></tr>`);
            } else {
                response.storeList.forEach((store) => {
                    const dateObj = new Date(store.storeCreatedDate);
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const formattedDate = `${year}년 ${month}월 ${day}일`;

                    $('#storeContent').append(`
                        <tr>
                            <td>${store.storeUid}</td>
                            <td><a href="/store/detail?storeUid=${store.storeUid}">${store.storeName}</a></td>
                            <td>${store.managerUid}</td>
                            <td>${store.storeAddress}</td>
                            <td>${store.storePostcode}</td>
                            <td>${formattedDate}</td>
                            <td>${store.storeStatus}</td>
                        </tr>
                    `);
                });

                // 1페이지에서 초기화
                if (page === 1) {
                    cursorMap.clear();
                    cursorStack = [];
                    cursorMap.set(1, null);
                }

                // 만약 현재 페이지의 데이터가 꽉 차 있고 다음 페이지 커서가 있다면,
                // 다음 페이지(lastUid)는 현재 응답의 nextCursor로 설정
                if (response.nextCursor && response.storeList.length === limit) {
                    if (!cursorMap.has(page + 1)) {
                        cursorMap.set(page + 1, response.nextCursor);
                    }
                }
            }

            updatePaginationButtons(response);
        },
        error: (error) => {
            console.error('지점 목록 조회 오류 :: ', error);
        }
    });
};

//페이지 번호 생성
let updatePaginationButtons = (response) => {
    //첫 페이지에서는 이전 버튼 비활성화
    $('#prevPage').prop('disabled', page === 1);
    // 다음 페이지 커서가 없다면 다음 버튼 비활성화
    $('#nextPage').prop('disabled', !cursorMap.has(page+1));

    const $pageNumbers = $('#pageNumbers');
    $pageNumbers.empty();

    // 지금까지 저장된 페이지 수만큼 번호 버튼 생성
    const totalPages = cursorMap.size;
    for (let i = 1; i <= totalPages; i++) {
        const $btn = $(`<button class="btn page-btn" data-page="${i}">${i}</button>`);
        if (i === page) {
            $btn.css('background-color', '#999');
        }
        $pageNumbers.append($btn);
    }

    // 페이지 번호 버튼 클릭 시 해당 페이지의 lastUid를 이용해 로드
    $('.page-btn').off('click').on('click', function () {
        const targetPage = parseInt($(this).data("page"));
        if (targetPage === page) return;
        if (!cursorMap.has(targetPage)) return; //안전 검사

        page = targetPage;
        loadStores({ limit, lastUid: cursorMap.get(page) });
    });
};

let logout = () => {
    $.ajax({
        type: 'POST',
        url: '/logout',
        success: () => {
            alert('로그아웃이 성공했습니다.');
            localStorage.removeItem('accessToken');
            window.location.href = '/member/login'
        },
        error: (error) => {
            console.log('오류발생 : ', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    });
}