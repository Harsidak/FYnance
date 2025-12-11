import time
import os

with open("server.log", "r") as f:
    f.seek(0, 2) # Go to end
    print("Monitoring log...")
    # Wait a bit to catch any immediate errors if I trigger a reload or request
    time.sleep(1)
    # Read last few lines
    f.seek(0, 0)
    lines = f.readlines()
    print("Last 20 lines:")
    print("".join(lines[-20:]))
