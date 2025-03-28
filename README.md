# AR Virtual Try-On Tool

This is a web-based Augmented Reality (AR) try-on tool that allows users to virtually try on accessories like glasses and hats through their webcam.

## Features

- Real-time face tracking and feature detection
- Multiple product try-on options (glasses, hats, etc.)
- Real-time adjustment of product position, size, and angle
- Responsive design for both mobile and desktop devices
- Runs entirely in the browser with no backend required

## Technology Stack

- HTML5/CSS3/JavaScript
- MediaPipe Face Mesh (for face detection and landmark extraction)
- Canvas API (for image rendering and overlay)

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, or Safari latest versions recommended)
- Webcam
- Local network or internet connection (for loading MediaPipe libraries)

### Installation and Running

1. Clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/ar-try-on-tool.git
cd ar-try-on-tool
```

2. Run the project using a local server:

You can use any static file server, for example:

- Using Node.js http-server:
```bash
npm install -g http-server
http-server
```

- Using Python's simple HTTP server:
```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

3. Visit the provided URL in your browser (typically http://localhost:8080 or http://127.0.0.1:8000)

## Usage Guide

1. Allow browser to access your camera
2. Select a product you want to try on (glasses, hat, etc.) from the product selection area
3. Use the adjustment controls to adjust the size, position, and angle of the product
4. Switch between different products at any time

## Adding New Products

To add new products:

1. Add the product image (PNG format with transparent background) to the `public/images/` directory
2. Add a product item under the appropriate product category in `index.html`
3. Ensure the product item has a unique `data-product` attribute that matches the image filename

## Privacy Statement

This application:
- Processes camera data locally on your device only
- Does not send any image data to any servers
- Does not save or record any user data

## License

MIT

## Contact

For any questions or suggestions, please contact: your.email@example.com 