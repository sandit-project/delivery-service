let storeMap = {
    1: '강동점',
    2: '강남점',
    3: '잠실점'
};

$(document).ready(async () => {
    checkToken();
    setupAjax();

    try {
        const profile = await fetchProfile();
        userUid = profile.uid;
        fetchOrders();
    } catch (err) {
        console.error('프로필 조회 실패', err);
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
    }
});
function fetchStores() {
    return $.ajax({
        type: 'GET',
        url: '/stores/list?limit=1000'
    }).then(response => {
        response.storeList.forEach(store => {
            storeMap[store.storeUid] = store.storeName;
        });
    });
}

function fetchProfile() {
    return $.ajax({ url: '/profile', method: 'GET' });
}

function fetchOrders() {
    $.ajax({
        url: `/orders/user/${userUid}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        success: function (response) {
            renderOrders(response); // response 자체가 배열
        },
        error: function (err) {
            console.error('주문 목록 불러오기 실패', err);
            alert('주문 목록을 가져오는 데 실패했습니다.');
        }
    });
}


function renderOrders(orders) {
    const $tbody = $('#order-table tbody');
    $tbody.empty();

    orders.forEach(order => {
        const storeName = storeMap[order.storeUid] || '알 수 없음';
        const firstMenuName = order.items.length > 0 ? order.items[0].menuName : '알 수 없음';

        const totalPrice = order.items.reduce((sum, item) => sum + item.unitPrice * item.amount, 0);
        const totalAmount = order.items.reduce((sum, item) => sum + item.amount, 0);

        const row = `
            <tr>
                <td>${order.uid}</td>
                <td>${mapOrderStatus(order.status)}</td>
                <td>${storeName}</td>
                <td>${firstMenuName}</td>
                <td>${totalPrice.toLocaleString()}원</td>
                <td>${totalAmount}</td>
                <td>${formatDate(order.createdDate)}</td>
            </tr>
        `;
        $tbody.append(row);
    });
}


function formatDate(dateString) {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    const hh = ('0' + date.getHours()).slice(-2);
    const min = ('0' + date.getMinutes()).slice(-2);
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function mapOrderStatus(status) {
    switch (status) {
        case 'PAYMENT_COMPLETED': return '결제 완료';
        case 'ORDER_CONFIRMED': return '주문 확정';
        case 'ORDER_CANCELLED': return '주문 취소';
        case 'ORDER_COOKING': return '조리 중';
        case 'ORDER_DELIVERING': return '배달 중';
        case 'ORDER_DELIVERED': return '배달 완료';
        //default: return status;
    }
}