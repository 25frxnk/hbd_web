import os

folder = "/home/nicasio/Desktop/birthday_web/access"

files = []
for f in os.listdir(folder):
    if f.lower().endswith((".jpg", ".jpeg", ".png")):
        full_path = os.path.join(folder, f)
        mtime = os.path.getmtime(full_path)
        files.append((full_path, mtime))

files.sort(key=lambda x: x[1], reverse=True)

temp_paths = []
for i, (path, _) in enumerate(files):
    temp_path = os.path.join(folder, f"temp_{i}.jpg")
    os.rename(path, temp_path)
    temp_paths.append(temp_path)

for i, path in enumerate(temp_paths, start=1):
    new_path = os.path.join(folder, f"{i}.jpg")
    os.rename(path, new_path)

print("done")