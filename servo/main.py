import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
SERVO = 18
GPIO.setup(SERVO, GPIO.OUT)

p = GPIO.PWM(SERVO, 50)  # 50?Hz
p.start(0)

def move(angle):
    duty = angle / 18 + 2
    p.ChangeDutyCycle(duty)
    time.sleep(0.5)
    p.ChangeDutyCycle(0)

try:
    while True:
        for a in (0, 90, 180):
            move(a)
            time.sleep(1)
except KeyboardInterrupt:
    pass
finally:
    p.stop()
    GPIO.cleanup()

