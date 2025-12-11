try:
    with open("server.log", "r") as f:
        lines = f.readlines()
        print("".join(lines[-50:]))
except Exception as e:
    print(e)
