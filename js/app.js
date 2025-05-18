// 初始化高德地图
let map = null;
let trackPolyline = null;

function initAMap() {
    map = new AMap.Map('map-container', {
        zoom: 13,
        center: [116.397428, 39.90923],
        viewMode: '2D'
    });
}

// 初始化二维码扫描器
function initQRScanner() {
    const videoElement = document.getElementById('scanner-view');
    const resultElement = document.getElementById('scan-result');
    const startBtn = document.getElementById('start-scan-btn');
    const stopBtn = document.getElementById('stop-scan-btn');
    const fileInput = document.getElementById('file-input');
    
    const scanner = new QRScanner(videoElement, resultElement);
    
    startBtn.addEventListener('click', () => {
        scanner.startScan();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    });
    
    stopBtn.addEventListener('click', () => {
        scanner.stopScan();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resultElement.textContent = '扫描已停止';
    });
    
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            scanner.scanFile(file);
        }
    });
    
    // 处理扫描结果
    window.addEventListener('qrScanned', (event) => {
        const qrData = event.detail;
        processQRData(qrData);
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });
}

// 处理二维码数据
function processQRData(qrData) {
    try {
        const trackData = JSON.parse(qrData);
        displayTrackInfo(trackData);
        displayTrackOnMap(trackData);
    } catch (error) {
        console.error('解析二维码数据失败:', error);
        document.getElementById('scan-result').textContent = '解析二维码数据失败';
    }
}

// 显示轨迹信息
function displayTrackInfo(trackData) {
    document.getElementById('track-id').textContent = trackData.id || '-';
    document.getElementById('start-time').textContent = trackData.startTime || '-';
    document.getElementById('end-time').textContent = trackData.endTime || '-';
    document.getElementById('points-count').textContent = trackData.points?.length || 0;
}

// 在地图上显示轨迹
function displayTrackOnMap(trackData) {
    if (!map) initAMap();
    
    // 清除旧轨迹
    if (trackPolyline) {
        map.remove(trackPolyline);
    }
    
    // 转换坐标点
    const path = trackData.points?.map(p => [p.lng, p.lat]) || [];
    
    if (path.length > 0) {
        // 创建轨迹线
        trackPolyline = new AMap.Polyline({
            path: path,
            strokeColor: "#3366FF",
            strokeWeight: 5,
            strokeStyle: "solid"
        });
        
        map.add(trackPolyline);
        map.setFitView(trackPolyline);
        
        // 添加起点终点标记
        addMarker(path[0], '起点');
        addMarker(path[path.length - 1], '终点');
    }
}

// 添加地图标记
function addMarker(position, title) {
    new AMap.Marker({
        position: position,
        title: title,
        map: map
    });
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initAMap();
    initQRScanner();
});
