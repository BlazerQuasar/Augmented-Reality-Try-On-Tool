/**
 * Face Mesh Processor Class
 * Uses MediaPipe FaceMesh library for facial feature detection
 */
export class FaceMeshProcessor {
    constructor() {
        this.faceMesh = null;
        this.camera = null;
        this.onResultsCallback = null;
    }
    
    /**
     * Initialize FaceMesh model
     * @param {Function} onResultsCallback - Callback function after getting results
     * @returns {Promise} - Promise completed after initialization
     */
    async initialize(onResultsCallback) {
        this.onResultsCallback = onResultsCallback;
        
        // Ensure FaceMesh is loaded
        if (!window.FaceMesh) {
            throw new Error('FaceMesh library not loaded');
        }
        
        return new Promise((resolve, reject) => {
            try {
                this.faceMesh = new FaceMesh({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                    }
                });
                
                // Configure FaceMesh
                this.faceMesh.setOptions({
                    maxNumFaces: 1,                          // Only detect one face for better performance
                    refineLandmarks: true,                   // Get more precise landmarks
                    minDetectionConfidence: 0.5,             // Detection confidence threshold
                    minTrackingConfidence: 0.5,              // Tracking confidence threshold
                });
                
                // Set results handling callback
                this.faceMesh.onResults(this.onResultsCallback);
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Start processing video stream
     * @param {HTMLVideoElement} videoElement - Video element
     * @returns {Promise} - Promise completed after startup
     */
    async start(videoElement) {
        if (!this.faceMesh) {
            throw new Error('FaceMesh not initialized');
        }
        
        // Ensure Camera is loaded
        if (!window.Camera) {
            throw new Error('Camera library not loaded');
        }
        
        return new Promise((resolve, reject) => {
            try {
                // Create Camera instance connected to FaceMesh
                this.camera = new Camera(videoElement, {
                    onFrame: async () => {
                        await this.faceMesh.send({image: videoElement});
                    },
                    width: 1280,
                    height: 720
                });
                
                // Start the camera
                this.camera.start()
                    .then(() => resolve())
                    .catch(error => reject(error));
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Stop processing
     */
    stop() {
        if (this.camera) {
            this.camera.stop();
        }
    }
    
    /**
     * Get coordinates of specific facial features
     * @param {Array} landmarks - Facial landmark points array
     * @param {Array} indices - Feature point indices array
     * @returns {Object} - Calculated average position and size
     */
    static getFeaturePosition(landmarks, indices) {
        if (!landmarks || !indices || indices.length === 0) {
            return null;
        }
        
        let sumX = 0, sumY = 0, sumZ = 0;
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        
        // Calculate average position and boundaries of specified index points
        indices.forEach(index => {
            const point = landmarks[index];
            sumX += point.x;
            sumY += point.y;
            sumZ += point.z;
            
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });
        
        const avgX = sumX / indices.length;
        const avgY = sumY / indices.length;
        const avgZ = sumZ / indices.length;
        const width = maxX - minX;
        const height = maxY - minY;
        
        return {
            position: { x: avgX, y: avgY, z: avgZ },
            size: { width, height }
        };
    }
} 