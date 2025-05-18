class QRScanner {
    constructor(videoElement, resultElement) {
        this.videoElement = videoElement;
        this.resultElement = resultElement;
        this.stream = null;
        this.scanning = false;
        this.canvasElement = document.createElement('canvas');
        this.canvasContext = this.canvasElement.getContext('2d', { willReadFrequently: true });
    }

    async startScan() {
        if (this.scanning) return;
        
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            this.videoElement.srcObject = this.stream;
            this.videoElement.play();
            
            this.scanning = true;
            this.resultElement.textContent = '扫描中...';
            
            const scanFrame = () => {
                if (!this.scanning) return;
                
                if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
                    this.canvasElement.height = this.videoElement.videoHeight;
                    this.canvasElement.width = this.videoElement.videoWidth;
                    this.canvasContext.drawImage(
                        this.videoElement, 
                        0, 0, 
                        this.canvasElement.width, 
                        this.canvasElement.height
                    );
                    
                    const imageData = this.canvasContext.getImageData(
                        0, 0, 
                        this.canvasElement.width, 
                        this.canvasElement.height
                    );
                    
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code) {
                        this.stopScan();
                        this.resultElement.textContent = '解码成功！';
                        window.dispatchEvent(new CustomEvent('qrScanned', { detail: code.data }));
                    }
                }
                
                requestAnimationFrame(scanFrame);
            };
            
            requestAnimationFrame(scanFrame);
            
        } catch (error) {
            console.error('启动扫描器失败:', error);
            this.resultElement.textContent = `启动扫描器失败: ${error.message}`;
            this.scanning = false;
        }
    }

    stopScan() {
        if (!this.scanning) return;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.scanning = false;
    }

    async scanFile(file) {
        try {
            this.resultElement.textContent = '正在解析文件...';
            const imageUrl = URL.createObjectURL(file);
            const image = new Image();
            
            image.onload = () => {
                this.canvasElement.height = image.naturalHeight;
                this.canvasElement.width = image.naturalWidth;
                this.canvasContext.drawImage(image, 0, 0);
                
                const imageData = this.canvasContext.getImageData(
                    0, 0, 
                    this.canvasElement.width, 
                    this.canvasElement.height
                );
                
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    this.resultElement.textContent = '解码成功！';
                    window.dispatchEvent(new CustomEvent('qrScanned', { detail: code.data }));
                } else {
                    throw new Error('未检测到二维码');
                }
            };
            
            image.src = imageUrl;
        } catch (error) {
            console.error('解析文件失败:', error);
            this.resultElement.textContent = `解析文件失败: ${error.message}`;
        }
    }
}
