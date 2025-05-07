#!/usr/bin/env python3
"""
Simple Video Capture and Display Script with GUI Support on Raspberry Pi

This script captures video from the default camera (/dev/video0) and displays it in a window.

Setup Instructions:

1. **Enable the camera interface**:
   ```bash
   sudo raspi-config nonint do_camera 0
   reboot
   ```

2. **Install GUI and V4L2 dependencies** (for OpenCV window functions):
   ```bash
   sudo apt update && sudo apt install -y \
     python3-opencv libopencv-dev libgtk2.0-dev pkg-config v4l-utils
   ```

3. **Verify your camera**:
   ```bash
   v4l2-ctl --list-devices
   ls /dev/video*
   v4l2-ctl --device=/dev/video0 --list-formats-ext
   ```

   Ensure `/dev/video0` appears and supports the desired resolution.

4. **Run the script**:
   ```bash
   python3 simple_capture.py
   ```

Usage:
- Press **q** in the video window to exit cleanly.
"""
import cv2

def main():
    # Try to open the camera with V4L2 backend for better compatibility
    cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
    if not cap.isOpened():
        print("Error: Cannot open camera at /dev/video0. Check connection and permissions.")
        return

    # Set resolution explicitly to a safe value
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    print("Press 'q' in the window to exit.")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Cannot receive frame (camera read failed).")
            break

        # Display frame
        cv2.imshow('Video', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release resources
    cap.release()
    try:
        cv2.destroyAllWindows()
    except Exception:
        pass  # ignore if GUI backend is missing

if __name__ == '__main__':
    main()
