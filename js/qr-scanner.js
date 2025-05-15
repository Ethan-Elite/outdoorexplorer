class QRScanner {
    constructor(videoElement, resultElement) {
        this.videoElement = videoElement;
        this.resultElement = resultElement;
        this.codeReader = new ZXing.BrowserQRCodeReader();
        this.scanning = false;
    }

    async startScan() {
        if (this.scanning) return;
        
        try {
            const devices = await ZXing.BrowserQRCodeReader.listVideoInputDevices();
            
            this.scanning = true;
            this.resultElement.textContent = '扫描中...';
            
            await this.codeReader.decodeFromVideoDevice(
                devices[0].deviceId,
                this.videoElement,
                (result, error) => {
                    if (result) {
                        this.stopScan();
                        this.resultElement.textContent = '解码成功！';
                        window.dispatchEvent(new CustomEvent('qrScanned', { detail: result.text }));
                    }
                    
                    if (error && !(error instanceof ZXing.NotFoundException)) {
                        console.error('扫描错误:', error);
                        this.resultElement.textContent = `扫描错误: ${error.message}`;
                    }
                }
            );
            
        } catch (error) {
            console.error('启动扫描器失败:', error);
            this.resultElement.textContent = `启动扫描器失败: ${error.message}`;
            this.scanning = false;
        }
    }

    stopScan() {
        if (!this.scanning) return;
        
        this.codeReader.reset();
        this.scanning = false;
    }
}
