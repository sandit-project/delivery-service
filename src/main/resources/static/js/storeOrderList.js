let storeInfo;
$(document).ready(async ()=>{
    // 1) 토큰 유효성 확인 및 AJAX 헤더 설정
    checkToken();
    setupAjax();

    // 2) 로그인한 유저 정보 조회
    let userInfo;
    try {
        userInfo = await getUserInfo();      // common.js 에 정의된 함수 호출
    } catch (err) {
        console.error('유저 정보 조회 실패:', err);
        alert('유저 정보를 불러오지 못했습니다. 다시 로그인 해주세요.');
        return;
    }

    const managerUid = userInfo.id;       // 여기에서 매니저 UID 획득
    console.log('로그인한 매니저 UID:', managerUid);

    // 3) 매니저 UID로 storeUid 조회


    storeInfo = await fetchStoreUidByManager(managerUid);
    if (storeInfo==null) {
        alert('지점 정보를 불러오는 데 실패했습니다.');
        return;
    }
    console.log("storeUid :"+storeInfo.storeUid);
    // 4) 화면 헤더 업데이트
    $('#welcome-message').text(`${storeInfo.storeName} 주문 목록`);

    //최초 페이지(1)는 lastUid가 null 이어야 함
    cursorMap.set(1,null);
    initStoreOrderList();
});

let cursorMap=new Map();//페이지번호 => lastUid 매핑
let page= 1;
let limit=10

/**
 * 매니저 UID로 storeUid를 조회
 * GET /stores/storeUid?managerUid={managerUid}
 */
function fetchStoreUidByManager(managerUid) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: `/stores/storeUid?managerUid=${managerUid}`,
            dataType: 'json',
            success: response => {
                console.log(response);
                resolve(response);
            },
            error: xhr => {
                console.error('storeUid 조회 실패:', xhr.status);
                reject(null);
            }
        });
    });
}

/**
 * 초기 페이지 버튼&리스트 설정
 */
let initStoreOrderList=() =>{
    //최초 페이지 로드(page 1)
    loadStoreOrders({ limit, lastUid: cursorMap.get(page)});

    $('#nextPage').click(() => {
        if ($('#nextPage').prop('disabled')) return;
        //다음 페이지 커서가 있다면 페이지 번호 증가 후 해당 커서로 로드
        if (cursorMap.has(page + 1)) {
            page++;
            loadStoreOrders({limit, lastUid: cursorMap.get(page)});
        }
    });


    $('#prevPage').click(() => {
        if ($('#prevPage').prop('disabled')) return;
        if(page>1){
            page--;
            loadStoreOrders({ limit, lastUid: cursorMap.get(page) });
        }
    });


    $('#firstPage').click((event)=>{
        page=1;
        //1페이지는 항상 null
        loadStoreOrders({ limit, lastUid: cursorMap.get(1) });
    });
};

/**
 * storeUid로 주문 목록을 불러와 렌더링(jQuery AJAX 사용)
 */
function loadStoreOrders({ limit, lastUid }) {
    const params = new URLSearchParams({limit});
    if (lastUid != null) params.append('lastUid', lastUid)
    else params.append('lastUid', 0);

    $.ajax({
        type: 'GET',
        url: `/orders/store/${storeInfo.storeUid}`,
        data: params,
        dataType: 'json',
        success: function (response) {
            const $tbody = $('#storeContent').empty();
            if (!response.orders || response.orders.length === 0) {
                $tbody.append(`
                    <tr>
                      <td colspan="8" style="text-align:center">주문 내역이 없습니다.</td>
                    </tr>
                `);
            } else {
                response.orders.forEach(o => {
                    const created = new Date(o.createdDate).toLocaleString();
                    const reserve = o.reservationDate
                        ? new Date(o.reservationDate).toLocaleString()
                        : '-';
                    const itemsCnt = o.items ? o.items.length : 0;
                    $tbody.append(`
                        <tr>
                          <td>${o.uid}</td>
                          <td>${o.userUid}</td>
                          <td>${o.payment}</td>
                          <td>${o.status}</td>
                          <td>${created}</td>
                          <td>${reserve}</td>
                          <td>${itemsCnt}</td>
                          <td><a href="/stores/${storeInfo.storeUid}/orders/detail?uid=${o.uid}">상세</a></td>
                        </tr>
                    `);
                });
            }

            // 1페이지에서 초기화
            if (page === 1) {
                cursorMap.clear();
                cursorMap.set(1, null);
            }

            // 만약 현재 페이지의 데이터가 꽉 차 있고 다음 페이지 커서가 있다면,
            // 다음 페이지(lastUid)는 현재 응답의 nextCursor로 설정
            if (response.nextCursor && response.orders.length === limit) {
                if (!cursorMap.has(page + 1)) {
                    cursorMap.set(page + 1, response.nextCursor);
                }
            }

            updatePaginationButtons(response);

        },
        error: (xhr, status, error) => {
            console.error('주문 목록 조회 오류 ::', error);
        }
    });
}

/**
 * 페이지 버튼 업데이트
 */
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
        loadStoreOrders({ limit, lastUid: cursorMap.get(page) });
    });
};
/**
 * 로그아웃 처리
 */
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