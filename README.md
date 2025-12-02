# WebP Wizard

A powerful, client-side image processing tool built with React, Tailwind CSS, and Cropper.js. This application allows users to upload images, crop them freely or with fixed aspect ratios, adjust background transparency, and generate optimized WebP images in multiple sizes instantly.

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

## How to Use

### 1. Upload
Drag and drop an image (JPG, PNG, WebP) onto the upload zone, or click to browse your files.

### 2. Edit
Once uploaded, you enter the editor mode:
*   **Mask Shape**: Select "Free" to drag corners arbitrarily, or select a preset (e.g., Square) to lock the aspect ratio.
*   **Adjust Image**: Use the sliders to Zoom in/out or Rotate the image.
*   **Background**:
    *   Select **Transparent** (checkered icon) to preserve transparency (ideal for logos/stickers).
    *   Select **White** or **Black** for standard solid backgrounds.
    *   Use the **Color Picker** to select any hex color.
*   **Output Size**: Optionally enter a target Width or Height. If left empty, the output will match the pixel dimensions of your crop area.

### 3. Download
Click "Generate WebP Images". The app will process the image and present three variations (Small, Original, Large). Click the **Download** button on any card to save the file.

## Development

This project uses standard web technologies.

*   `index.html`: Entry point.
*   `App.tsx`: Main application logic.
*   `components/`: UI components for Uploader, Editor, and Gallery.
*   `utils/`: Canvas manipulation logic.

This is a pure frontend application; no data is sent to any server.
