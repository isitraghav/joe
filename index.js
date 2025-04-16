import { exec } from "child_process";
import { Client } from "@gradio/client";
import { resolve } from "path";
import fs from "fs/promises"; // Use promises for cleaner async/await

// Function to check if the Gradio server is active
function checkServerAndRun() {
  exec("ping -c 1 http://127.0.0.1:7860/", (error, stdout, stderr) => {
    if (error) {
      console.log("Server inactive. Attempting to start the server...");
      // Spawn a Python process to start the Gradio server
      exec("python3 yolo/main.py", (error, stdout, stderr) => {
        if (error) {
          console.error(`Failed to start server: ${error}`);
          return;
        }
        console.log("Server started successfully.");
      });
    } else {
      console.log("Server is active.");
    }
  });
}

checkServerAndRun();

exec(
  "libcamera-still -o snap.jpg --immediate",
  async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      return;
    }
    console.log(`Command output:\n${stdout}`);
    if (stderr) {
      console.error(`Command errors:\n${stderr}`);
    }
    console.log(
      "Successfully took a snapshot (if fswebcam is installed and configured)."
    );

    // Move the Gradio client code inside the callback to ensure snap.jpg exists
    async function runGradioClient() {
      try {
        const exampleImage = await fs.readFile("snap.jpg");
        const client = await Client.connect("http://127.0.0.1:7860/");
        const result = await client.predict("/predict", {
          image: exampleImage,
        });
        console.log("Gradio Prediction Result:");
        // Assuming your Python Gradio app's classify_image function returns:
        // 1. The annotated image (likely a path or base64 string)
        // 2. The detection information string
        if (result && result.data && result.data.length >= 2) {
          const annotatedImage = result.data[0];
          const detectionInfo = result.data[1];

          console.log("Annotated Image:", annotatedImage); // You might want to handle displaying this in a web page or saving it
          console.log("Detection Information:");
          // Split the detection info into lines for better readability
          const lines = detectionInfo
            .split("\n")
            .filter((line) => line.trim() !== "");
          if (lines.length > 0) {
            lines.forEach((line) => console.log(`  ${line}`));
          } else {
            console.log("  No objects detected.");
          }
        } else {
          console.warn("Unexpected response format from Gradio server.");
          console.log(result);
        }
      } catch (error) {
        console.error("Error running Gradio client:", error);
      }
    }

    runGradioClient();
  }
);
