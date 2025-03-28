import { FaceMeshProcessor } from './face-processor.js';

/**
 * Product Overlay Class
 * Responsible for overlaying selected product images on detected facial features
 */
export class ProductOverlay {
    constructor(canvasContext) {
        this.ctx = canvasContext;
        this.productImages = {};
        this.loadingPromises = {};
        this.isLoading = false;
        
        // Face landmark indices constants
        this.FACE_INDICES = {
            GLASSES: {
                // Key points around the eyes
                LEFT_EYE: [33, 133, 160, 159, 158, 157, 173, 243],
                RIGHT_EYE: [362, 398, 384, 385, 386, 387, 388, 466],
                // Points above the nose bridge
                NOSE_BRIDGE: [168, 6, 197, 195, 5]
            },
            HAT: {
                // Forehead and top head points
                FOREHEAD: [10, 151, 9, 8, 107, 66, 105, 104, 103, 67, 109, 10],
                // Top head points
                TOP_HEAD: [10, 109, 67, 103, 104, 105, 66, 107, 9, 8, 55, 65, 10]
            },
            // Can extend with more product types and their feature points
        };
        
        // Preload default product images
        this.preloadImages();
    }
    
    /**
     * Preload product images
     */
    async preloadImages() {
        this.isLoading = true;
        
        const productTypes = ['glasses1', 'glasses2', 'glasses3', 'hat1', 'hat2'];
        
        const loadPromises = productTypes.map(type => this.loadImage(type));
        
        try {
            await Promise.all(loadPromises);
            this.isLoading = false;
        } catch (error) {
            console.error('Error loading product images:', error);
            this.isLoading = false;
        }
    }
    
    /**
     * Load a single product image
     * @param {string} productId - Product ID
     * @returns {Promise} - Promise completed after loading
     */
    loadImage(productId) {
        // If already loaded or loading, return existing Promise
        if (this.loadingPromises[productId]) {
            return this.loadingPromises[productId];
        }
        
        this.loadingPromises[productId] = new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Allow cross-domain images
            
            img.onload = () => {
                this.productImages[productId] = img;
                resolve(img);
            };
            
            img.onerror = () => {
                reject(new Error(`Unable to load product image: ${productId}`));
            };
            
            img.src = `public/images/${productId}.png`;
        });
        
        return this.loadingPromises[productId];
    }
    
    /**
     * Draw a product based on product ID and facial landmarks
     * @param {string} productId - Product ID
     * @param {Array} landmarks - Facial landmark points array
     * @param {number} scale - Scale factor
     * @param {number} yOffset - Y-axis offset
     * @param {number} rotation - Rotation angle
     */
    async drawProduct(productId, landmarks, scale = 1.0, yOffset = 0, rotation = 0) {
        if (this.isLoading) {
            return; // If images are still loading, wait for next frame
        }
        
        try {
            // Ensure the image is loaded
            if (!this.productImages[productId]) {
                await this.loadImage(productId);
            }
            
            const img = this.productImages[productId];
            
            // Determine product type
            let productType = 'GLASSES';
            if (productId.startsWith('hat')) {
                productType = 'HAT';
            }
            
            // Get corresponding feature indices
            const featureIndices = this.FACE_INDICES[productType];
            
            // Calculate placement position based on product type
            switch (productType) {
                case 'GLASSES':
                    this.drawGlasses(img, landmarks, featureIndices, scale, yOffset, rotation);
                    break;
                case 'HAT':
                    this.drawHat(img, landmarks, featureIndices, scale, yOffset, rotation);
                    break;
                default:
                    console.warn('Unknown product type:', productType);
            }
        } catch (error) {
            console.error('Error drawing product:', error);
        }
    }
    
    /**
     * Draw glasses
     * @param {Image} img - Glasses image
     * @param {Array} landmarks - Facial landmarks
     * @param {Object} featureIndices - Feature indices
     * @param {number} scale - Scale factor
     * @param {number} yOffset - Y-axis offset
     * @param {number} rotation - Rotation angle
     */
    drawGlasses(img, landmarks, featureIndices, scale, yOffset, rotation) {
        // Get left and right eye positions
        const leftEye = FaceMeshProcessor.getFeaturePosition(landmarks, featureIndices.LEFT_EYE);
        const rightEye = FaceMeshProcessor.getFeaturePosition(landmarks, featureIndices.RIGHT_EYE);
        
        if (!leftEye || !rightEye) {
            return;
        }
        
        // Calculate glasses position and size
        const eyeDistance = Math.sqrt(
            Math.pow(rightEye.position.x - leftEye.position.x, 2) +
            Math.pow(rightEye.position.y - leftEye.position.y, 2)
        );
        
        // Calculate midpoint and angle
        const centerX = (leftEye.position.x + rightEye.position.x) / 2;
        const centerY = (leftEye.position.y + rightEye.position.y) / 2;
        
        // Base angle - calculated from eye positions
        let angle = Math.atan2(
            rightEye.position.y - leftEye.position.y,
            rightEye.position.x - leftEye.position.x
        );
        
        // Apply additional rotation (convert to radians)
        angle += rotation * Math.PI / 180;
        
        // Calculate glasses scale - based on eye distance and image width
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        // Set base width to 2.5 times the eye distance
        const baseWidth = eyeDistance * 2.5;
        const baseHeight = baseWidth * (imgHeight / imgWidth);
        
        // Apply scale factor
        const width = baseWidth * scale;
        const height = baseHeight * scale;
        
        // Apply Y-axis offset
        const yPositionOffset = yOffset * 0.01 * this.ctx.canvas.height;
        
        // Draw glasses
        this.ctx.save();
        
        // Move to center point
        this.ctx.translate(
            centerX * this.ctx.canvas.width,
            (centerY * this.ctx.canvas.height) + yPositionOffset
        );
        
        // Apply rotation
        this.ctx.rotate(angle);
        
        // Draw image (from center point)
        this.ctx.drawImage(
            img,
            -width / 2,
            -height / 2,
            width,
            height
        );
        
        this.ctx.restore();
    }
    
    /**
     * Draw hat
     * @param {Image} img - Hat image
     * @param {Array} landmarks - Facial landmarks
     * @param {Object} featureIndices - Feature indices
     * @param {number} scale - Scale factor
     * @param {number} yOffset - Y-axis offset
     * @param {number} rotation - Rotation angle
     */
    drawHat(img, landmarks, featureIndices, scale, yOffset, rotation) {
        // Get forehead position
        const forehead = FaceMeshProcessor.getFeaturePosition(landmarks, featureIndices.FOREHEAD);
        const topHead = FaceMeshProcessor.getFeaturePosition(landmarks, featureIndices.TOP_HEAD);
        
        if (!forehead || !topHead) {
            return;
        }
        
        // Calculate head width and height
        const headWidth = forehead.size.width * this.ctx.canvas.width;
        
        // Calculate hat position and size
        const centerX = forehead.position.x;
        const centerY = forehead.position.y - 0.05; // Place hat slightly above forehead
        
        // Base angle - estimated from head orientation
        let angle = 0; // Default to horizontal
        
        // Apply additional rotation (convert to radians)
        angle += rotation * Math.PI / 180;
        
        // Calculate hat scale
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        // Set base width to 1.5 times the head width
        const baseWidth = headWidth * 1.5;
        const baseHeight = baseWidth * (imgHeight / imgWidth);
        
        // Apply scale factor
        const width = baseWidth * scale;
        const height = baseHeight * scale;
        
        // Apply Y-axis offset
        const yPositionOffset = yOffset * 0.01 * this.ctx.canvas.height;
        
        // Draw hat
        this.ctx.save();
        
        // Move to center point
        this.ctx.translate(
            centerX * this.ctx.canvas.width,
            (centerY * this.ctx.canvas.height) + yPositionOffset
        );
        
        // Apply rotation
        this.ctx.rotate(angle);
        
        // Draw image (from center point)
        this.ctx.drawImage(
            img,
            -width / 2,
            -height / 2,
            width,
            height
        );
        
        this.ctx.restore();
    }
} 