$(document).ready(()=>{
    // 지도 초기화
    const mapContainer = document.getElementById('map');
    const mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청
        level: 5
    };
    const map = new kakao.maps.Map(mapContainer, mapOption);

    // 점포(출발지) & 배달지(도착지) 좌표
    const store = { lat: 37.5665, lng: 126.9780 };       // 서울 시청
    const customer = { lat: 37.5755, lng: 126.9760 };    // 서울역

    // 마커 표시 함수
    function placeMarker(position, title) {
        const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(position.lat, position.lng),
            map: map,
            title: title
        });

        const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:13px;">${title}</div>`
        });
        infowindow.open(map, marker);
    }

    // 점포와 배달지 마커 표시
    placeMarker(store, '점포');
    placeMarker(customer, '배달지');

    let pathCoords = [];  // 경로 좌표 배열
    let deliveryMarker;   // 배달원 마커
    let moveIndex = 0;    // 현재 위치 인덱스

    $.ajax({
        type: 'GET',
        url: '/delivery?origin='+store.lng+','+store.lat+'&destination='+customer.lng+','+customer.lat,
        dataType : 'json',
        success:(data)=>{
            const roads = data.routes[0].sections[0].roads;
            pathCoords = roads.flatMap(road =>
                road.vertexes.reduce((arr, val, idx, array) => {
                    if (idx % 2 === 0) {
                        arr.push(new kakao.maps.LatLng(array[idx + 1], val));
                    }
                    return arr;
                }, [])
            );

            // 경로선 그림
            const polyline = new kakao.maps.Polyline({
                path: pathCoords,
                strokeWeight: 5,
                strokeColor: '#FF0000',
                strokeOpacity: 0.9,
                strokeStyle: 'solid'
            });
            polyline.setMap(map);

            // 배달원 마커 초기화
            deliveryMarker = new kakao.maps.Marker({
                position: pathCoords[0],
                map: map,
                title: '배달원'
            });

            // 배달원 이동 시작
            moveIndex = 0;
            moveDeliveryMan();
        },
        error: (error)=>{
            console.log("error :: ",error);
        }
    })

    // 배달원 위치 갱신
    function moveDeliveryMan() {
        setInterval(function() {
            if (moveIndex < pathCoords.length) {
                deliveryMarker.setPosition(pathCoords[moveIndex]);
                moveIndex++;
            }
        }, 1000); // 1초마다 이동
    }
});