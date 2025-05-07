import { exec } from "child_process";
import { Client } from "@gradio/client";
import path, { resolve } from "path";
import fs from "fs/promises"; // Use promises for cleaner async/await
import { promisify } from "util";

const execAsync = promisify(exec);
const serverUrl = "http://127.0.0.1:7860/";
const snapshotFilename = "snap.jpg";
const cameraCommand = `libcamera-still -o ${snapshotFilename} --immediate --width 640 --height 640`;
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

      setServoTo(detectionInfo)
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


import { Gpio } from "pigpio"

const servo = new Gpio(18, { mode: Gpio.OUTPUT });

// === CALIBRATE THESE ===
// STOP should be the pulse width (�s) that *just* stops your servo.
// CW_SPEED is a bit above STOP to spin one way.
// CCW_SPEED is a bit below STOP to spin the other.
const STOP = 1500;
const CW_SPEED = 2000;  // adjust up/down 50?�s until it spins at the speed you like
const CCW_SPEED = 1000;  // ditto for reverse direction

async function setServoTo(dir) {
  return new Promise(async (res) => {
    if (dir == "none") return;
    // const dir = (process.argv[2] || '').toLowerCase();
    let pulse;
    if (dir === 'left') {
      pulse = CCW_SPEED;
    } else if (dir === 'right') {
      pulse = CW_SPEED;
    }

    console.log(`? Spinning ${dir} (pulse = ${pulse}?�s)`);
    servo.servoWrite(pulse);

    // run for 3?s, then brake
    await new Promise(r => setTimeout(r, 3000));
    console.log('? Stopping');
    servo.servoWrite(STOP);
    res();
  })
}

// import { spawn } from 'child_process';

// async function runServo() {
//   return new Promise((resolve, reject) => {
//     const nodeBin = process.execPath;                   // e.g. "/usr/bin/node"
//     const proc = spawn('sudo', [nodeBin, "/home/pi/Desktop/joe/servo.js"], {
//       stdio: 'inherit'
//     });

//     proc.on('error', reject);
//     proc.on('close', code =>
//       code === 0
//         ? resolve()
//         : reject(new Error(`servo.js exited with code ${code}`))
//     );
//   });
// }



async function main() {
  try {
    // while (true) {
    // await runServo();
    await takeSnapshot();
    await runGradioClient();
    // }
    // await operateServo()
  } catch (error) {
    console.error("An error occurred during the process:", error);
  }
}

main();
