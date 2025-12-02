# WebP Wizard

A powerful, client-side image processing tool built with React, Tailwind CSS, and Cropper.js. This application allows users to upload images, crop them freely or with fixed aspect ratios, adjust background transparency, and generate optimized WebP images in multiple sizes instantly.

## Google AI Studio

This application was generated using Google AI Studio. It demonstrates how to build a fully functional client-side image manipulation tool using modern web technologies without requiring a backend server.

## Features

*   **Free & Fixed Cropping**: Drag handles to crop freely, or use presets like 1:1, 16:9, 4:3.
*   **Rotation & Zoom**: Fine-tune your image composition.
*   **Background Control**: Choose between Transparent, White, Black, or a Custom Color for the image background.
*   **Output Resizing**: Specify exact output dimensions or let it auto-calculate.
*   **Multi-Size Generation**: Automatically produces three versions of your image:
    *   **Original**: The exact crop and size you defined.
    *   **Small**: 50% scale (thumbnail friendly).
    *   **Large**: 200% scale (high-res upscale).
*   **WebP Conversion**: All outputs are converted to the modern, efficient WebP format.

## Application Usage Guide

### 1. Upload Image
*   **Drag & Drop**: Simply drag your image file (JPG, PNG, WebP) into the upload area.
*   **Browse**: Click the upload area to open your file explorer and select an image.

### 2. Edit & Crop
Once your image is loaded, you have full control:

*   **Mask Shape**:
    *   Select **Free** to adjust the crop box freely.
    *   Select presets like **1:1 (Square)**, **16:9**, etc., to lock the aspect ratio.
*   **Adjust Image**:
    *   **Zoom**: Use the slider to zoom in/out.
    *   **Rotate**: Rotate the image if it's crooked or for creative effect.
*   **Background Color**:
    *   **Transparent** (Checkered Icon): Keeps the background transparent (perfect for PNGs/Logos).
    *   **White / Black**: Adds a solid background behind the image.
    *   **Color Picker**: Click the colored square to choose any custom hex color.
*   **Output Size**:
    *   Enter a specific **Width** or **Height** in pixels if you need exact dimensions.
    *   Leave blank to keep the original resolution of the cropped area.

### 3. Generate & Download
*   Click the **Generate WebP Images** button.
*   The app will instantly process your image and create three variations:
    *   **Small Size**: Scaled down (50%).
    *   **Original Crop**: Your specified crop.
    *   **Large Size**: Upscaled (200%).
*   Click the **Download** button on any of the cards to save the specific version to your device.

## Development

This project uses standard web technologies.

*   `index.html`: Entry point.
*   `App.tsx`: Main application logic.
*   `components/`: UI components for Uploader, Editor, and Gallery.
*   `utils/`: Canvas manipulation logic.

This is a pure frontend application; no data is sent to any server.
