// Import other modules
import { FaceMeshProcessor } from './face-processor.js';
import { ProductOverlay } from './product-overlay.js';
import { UIController } from './ui-controller.js';

class ARTryOnApp {
    constructor() {
        // DOM elements
        this.webcamElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('overlay');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        
        // Context and variables
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.currentProduct = null;
        this.adjustments = {
            scale: 1.0,
            yPosition: 0,
            rotation: 0
        };
        
        // Initialize components
        this.faceMesh = new FaceMeshProcessor();
        this.productOverlay = new ProductOverlay(this.canvasCtx);
        this.uiController = new UIController(this);
        
        // Bind methods
        this.onResults = this.onResults.bind(this);
        this.initWebcam = this.initWebcam.bind(this);
        this.updateCanvasSize = this.updateCanvasSize.bind(this);
        
        // Initialize application
        this.init();
    }
    
    async init() {
        try {
            // Initialize Canvas size
            this.updateCanvasSize();
            
            // Listen for window resize events
            window.addEventListener('resize', this.updateCanvasSize);
            
            // Initialize FaceMesh
            await this.faceMesh.initialize(this.onResults);
            
            // Initialize webcam
            await this.initWebcam();
            
            // Start processing video stream
            await this.faceMesh.start(this.webcamElement);
            
            // Hide loading indicator
            this.loadingElement.style.display = 'none';
        } catch (error) {
            console.error('Initialization failed:', error);
            this.loadingElement.style.display = 'none';
            this.errorElement.style.display = 'flex';
        }
    }
    
    async initWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            
            this.webcamElement.srcObject = stream;
            
            return new Promise((resolve) => {
                this.webcamElement.onloadedmetadata = () => {
                    this.webcamElement.play();
                    resolve();
                };
            });
        } catch (error) {
            console.error('Camera access failed:', error);
            throw new Error('Cannot access camera');
        }
    }
    
    updateCanvasSize() {
        const containerWidth = this.webcamElement.clientWidth;
        const containerHeight = this.webcamElement.clientHeight;
        
        this.canvasElement.width = containerWidth;
        this.canvasElement.height = containerHeight;
    }
    
    onResults(results) {
        // Clear Canvas
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // If a product is selected and face is detected, draw the product
        if (this.currentProduct && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            
            // Apply product overlay based on adjustment settings
            this.productOverlay.drawProduct(
                this.currentProduct,
                landmarks,
                this.adjustments.scale,
                this.adjustments.yPosition,
                this.adjustments.rotation
            );
        }
    }
    
    setProduct(productId) {
        this.currentProduct = productId;
    }
    
    updateAdjustment(type, value) {
        this.adjustments[type] = value;
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ARTryOnApp();
}); 