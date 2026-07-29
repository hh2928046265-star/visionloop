import os, subprocess

desktop = os.path.join(os.environ["USERPROFILE"], "Desktop")
project = r"C:\Users\13336\Documents\故事板\storyboard-studio"
shortcut = os.path.join(desktop, "VisionLoop.lnk")

if os.path.exists(shortcut):
    os.remove(shortcut)

ps = "$desktop = '" + desktop + "'\n"
ps += "$projectDir = '" + project + "'\n"
ps += "$ws = New-Object -ComObject WScript.Shell\n"
ps += "$lnk = Join-Path $desktop 'VisionLoop.lnk'\n"
ps += "$s = $ws.CreateShortcut($lnk)\n"
ps += "$s.TargetPath = 'cmd.exe'\n"
ps += "$s.Arguments = '/k npm run launch'\n"
ps += "$s.WorkingDirectory = $projectDir\n"
ps += "$s.IconLocation = 'C:\\Windows\\System32\\imageres.dll,34'\n"
ps += "$s.Description = 'VisionLoop'\n"
ps += "$s.Save()\n"
ps += "Write-Host 'OK'\n"

ps_path = os.path.join(os.environ["TEMP"], "vl-setup4.ps1")
with open(ps_path, "w", encoding="utf-16-le") as f:
    f.write("\uFEFF" + ps)

result = subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", ps_path], capture_output=True, text=True)
print("STDOUT:", result.stdout.strip())
if result.stderr:
    print("STDERR:", result.stderr.strip())
os.unlink(ps_path)

if os.path.exists(shortcut):
    with open(shortcut, "rb") as f:
        data = f.read()
    target = "故事板\\storyboard-studio".encode("utf-16-le")
    if target in data:
        print("PATH: CORRECT")
    else:
        print("PATH: NOT FOUND")
    if "/k npm run launch".encode("utf-16-le") in data:
        print("ARGS: CORRECT")
    print("Shortcut created successfully")
else:
    print("FAILED")