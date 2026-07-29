import os, subprocess, tempfile

desktop = os.path.join(os.environ["USERPROFILE"], "Desktop")
project = r"C:\Users\13336\Documents\故事板\storyboard-studio"
shortcut = os.path.join(desktop, "VisionLoop.lnk")

if os.path.exists(shortcut):
    os.remove(shortcut)

# Build PS script and write as UTF-16LE with BOM
ps = '\uFEFF'  # BOM
ps += f"""$desktop = '{desktop}'
$projectDir = '{project}'
$ws = New-Object -ComObject WScript.Shell
$lnk = Join-Path $desktop 'VisionLoop.lnk'
$s = $ws.CreateShortcut($lnk)
$s.TargetPath = 'cmd.exe'
$s.Arguments = "/k cd /d `"$projectDir`" && npm run launch"
$s.WorkingDirectory = $projectDir
$s.IconLocation = 'C:\\Windows\\System32\\imageres.dll,34'
$s.Description = 'VisionLoop'
$s.WindowStyle = 1
$s.Save()
Write-Host 'OK'
"""

ps_path = os.path.join(os.environ["TEMP"], "vl-setup3.ps1")
with open(ps_path, "w", encoding="utf-16-le") as f:
    f.write(ps)

result = subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", ps_path], capture_output=True, text=True)
print("STDOUT:", result.stdout.strip())
if result.stderr:
    print("STDERR:", result.stderr.strip())

os.unlink(ps_path)

# Verify
if os.path.exists(shortcut):
    print("Shortcut exists, checking path...")
    # Read the binary to verify
    with open(shortcut, "rb") as f:
        data = f.read()
    # Search for hex representation of "故事板"
    target = "故事板".encode("utf-16-le")
    if target in data:
        print("CORRECT - 故事板 found in shortcut")
    else:
        print("WRONG - 故事板 NOT found in shortcut, searching...")
        idx = data.find("storyboard".encode("utf-16-le"))
        if idx > 0:
            chunk = data[idx-60:idx+40]
            print(f"Context: {chunk}")
else:
    print("FAILED - no shortcut")