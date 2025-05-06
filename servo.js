import { Gpio } from "pigpio"
const servo = new Gpio(15, { mode: Gpio.OUTPUT });

let SPEED_CW = 500; // clockwise rotation (increase for faster)

async function runServo2Seconds() {
    SPEED_CW = 500;
    return new Promise(async (resolve) => {
        console.log('? Starting servo on GPIO 15...');
        while (SPEED_CW < 1500) {
            servo.servoWrite(SPEED_CW);
            await new Promise(r => setTimeout(r, 10));
            SPEED_CW = SPEED_CW + 100
        }

        // Run for 2 seconds
        setTimeout(() => {
            console.log('? Stopping servo');
            servo.servoWrite(1500);
            resolve(true);
        }, 1000);
    });
}


runServo2Seconds()