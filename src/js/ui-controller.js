/**
 * UI Controller Class
 * Responsible for handling user interface interactions and updating application state
 */
export class UIController {
    constructor(appInstance) {
        this.app = appInstance;
        
        // Product selection elements
        this.productItems = document.querySelectorAll('.product-item');
        
        // Adjustment controls
        this.scaleControl = document.getElementById('scale');
        this.yPositionControl = document.getElementById('y-position');
        this.rotationControl = document.getElementById('rotation');
        
        // Bind event handlers
        this.bindEvents();
    }
    
    /**
     * Bind all UI event listeners
     */
    bindEvents() {
        // Product selection events
        this.productItems.forEach(item => {
            item.addEventListener('click', () => {
                this.handleProductSelection(item);
            });
        });
        
        // Scale control
        this.scaleControl.addEventListener('input', () => {
            this.handleAdjustmentChange('scale', parseFloat(this.scaleControl.value));
        });
        
        // Y-axis position control
        this.yPositionControl.addEventListener('input', () => {
            this.handleAdjustmentChange('yPosition', parseFloat(this.yPositionControl.value));
        });
        
        // Rotation control
        this.rotationControl.addEventListener('input', () => {
            this.handleAdjustmentChange('rotation', parseFloat(this.rotationControl.value));
        });
    }
    
    /**
     * Handle product selection event
     * @param {HTMLElement} selectedItem - The selected product element
     */
    handleProductSelection(selectedItem) {
        // Clear all selection states
        this.productItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add new selection state
        selectedItem.classList.add('active');
        
        // Get product ID and update application state
        const productId = selectedItem.getAttribute('data-product');
        this.app.setProduct(productId);
        
        // Reset adjustment controls
        this.resetAdjustmentControls();
    }
    
    /**
     * Handle adjustment control changes
     * @param {string} type - Adjustment type
     * @param {number} value - Adjustment value
     */
    handleAdjustmentChange(type, value) {
        this.app.updateAdjustment(type, value);
    }
    
    /**
     * Reset all adjustment controls to default values
     */
    resetAdjustmentControls() {
        this.scaleControl.value = 1.0;
        this.yPositionControl.value = 0;
        this.rotationControl.value = 0;
        
        // Update application state
        this.app.updateAdjustment('scale', 1.0);
        this.app.updateAdjustment('yPosition', 0);
        this.app.updateAdjustment('rotation', 0);
    }
} 