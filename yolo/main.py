import gradio as gr
from ultralytics import YOLO
from PIL import Image
import numpy as np

# Load a pre-trained YOLO model
model = YOLO('487075bc-075a-4b6b-bf39-6a6b83121564.pt')

def classify_image(image):
    """
    Performs YOLO object detection and classifies each object into left or right column.

    Args:
        image: A PIL Image object or a NumPy array.

    Returns:
        A tuple containing:
            - The image with bounding boxes and labels drawn on it.
            - A string containing the label, center coordinates, and column (Left or Right) for each detected object.
    """
    if isinstance(image, np.ndarray):
        image = Image.fromarray(image)

    results = model.predict(image)
    annotated_image = results[0].plot()
    detections_info = ""
    image_width = image.width
    mid_column = image_width / 2

    if results and results[0].boxes:
        for i, box in enumerate(results[0].boxes):
            xyxy = box.xyxy[0].cpu().numpy().astype(int)
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            center_x = int((xyxy[0] + xyxy[2]) / 2)
            center_y = int((xyxy[1] + xyxy[3]) / 2)

            # Determine the column (Left or Right) based on the center x-coordinate
            if center_x < mid_column:
                column = "left"
            else:
                column = "right"

            # if class_name == "person": # for now
            detections_info = class_name
    else:
        detections_info = "none"

    return annotated_image, detections_info

iface = gr.Interface(
    fn=classify_image,
    inputs=gr.Image(label="Upload Image"),
    outputs=[
        gr.Image(label="Classified Image"),
        gr.Textbox(label="Detection Information")
    ],
    title="YOLO Object Classification with Left/Right Column Classification",
    description="Upload an image and see the detected objects with bounding boxes, their center coordinates, and whether they are in the left or right column.",
    examples=[["bus.jpg"], ["zidane.jpg"]]
)

iface.launch(share=False)