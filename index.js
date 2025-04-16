import { exec } from "child_process";
import { Client } from "@gradio/client";
import { resolve } from "path";
import fs from "fs/promises"; // Use promises for cleaner async/await
import { promisify } from "util";

const execAsync = promisify(exec);
const serverUrl = "http://127.0.0.1:7860/";
const snapshotFilename = "snap.jpg";
const cameraCommand = `libcamera-still -o ${snapshotFilename} --immediate`;
const predictEndpoint = "/predict";

async function takeSnapshot() {
  try {
    const { stdout, stderr } = await execAsync(cameraCommand);
    console.log(`Command output:\n${stdout}`);
    if (stderr) {
      console.error(`Command errors:\n${stderr}`);
    }
    console.log(
      "Successfully took a snapshot (if libcamera-still is installed and configured)."
    );
  } catch (error) {
    console.error(`Error executing command: ${error}`);
    throw error; // Re-throw the error
  }
}

async function runGradioClient() {
  try {
    const exampleImage = await fs.readFile(snapshotFilename);
    const client = await Client.connect(serverUrl);
    const result = await client.predict(predictEndpoint, {
      image: exampleImage,
    });
    console.log("Gradio Prediction Result:");
    if (result && result.data && result.data.length >= 2) {
      const annotatedImage = result.data[0];
      const detectionInfo = result.data[1];

      console.log("Annotated Image:", annotatedImage);
      console.log("Detection Information:");
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

async function main() {
  try {
    await takeSnapshot();
    await runGradioClient();
  } catch (error) {
    console.error("An error occurred during the process:", error);
  }
}

main();

