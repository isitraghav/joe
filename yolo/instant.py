import cv2
import numpy as np
from ultralytics import YOLO

# Load the pre-trained YOLOv8 model
model = YOLO('487075bc-075a-4b6b-bf39-6a6b83121564.pt')

# Initialize video capture (0 = default webcam)
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit(1)

# Get frame width for column division
ret, frame = cap.read()
if not ret:
    print("Error: Could not read frame.")
    cap.release()
    exit(1)
height, width = frame.shape[:2]
mid_x = width // 2

print("Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # YOLO expects RGB images
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Perform inference
    results = model.predict(rgb_frame, verbose=False)[0]

    # Draw midline for left/right column (optional)
    cv2.line(frame, (mid_x, 0), (mid_x, height), (255, 255, 255), 2)

    # Iterate over detections
    for box in results.boxes:
        # Extract coordinates and class
        x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
        cls_id = int(box.cls[0])
        label = model.names[cls_id]

        # Compute center and column
        center_x = (x1 + x2) // 2
        column = 'Left' if center_x < mid_x else 'Right'

        # Draw bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        # Prepare text and put on frame
        text = f"{label}: {column}"
        (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(frame, (x1, y1 - th - 4), (x1 + tw, y1), (0, 255, 0), -1)
        cv2.putText(frame, text, (x1, y1 - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)

    # Display the result
    cv2.imshow('YOLOv8 Detection', frame)

    # Exit on 'q' key
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Clean up
cap.release()
cv2.destroyAllWindows()
