// VisionLoop Setup — creates desktop shortcut on Windows
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const desktop = path.join(os.homedir(), "Desktop");
const projectDir = __dirname;
const psPath = path.join(os.tmpdir(), "vl-setup.ps1");

console.log("VisionLoop Setup");
console.log("================");

const psLines = [
  '$desktop = "' + desktop.replace(/\\/g, "\\\\") + '"',
  '$projectDir = "' + projectDir.replace(/\\/g, "\\\\") + '"',
  '$ws = New-Object -ComObject WScript.Shell',
  '$lnk = Join-Path $desktop "VisionLoop.lnk"',
  '$s = $ws.CreateShortcut($lnk)',
  '$s.TargetPath = "cmd.exe"',
  '$s.Arguments = "/k cd /d " + [char]34 + $projectDir + [char]34 + " && npm run launch"',
  '$s.WorkingDirectory = $projectDir',
  '$s.IconLocation = "C:\\Windows\\System32\\imageres.dll,34"',
  '$s.Description = "VisionLoop"',
  '$s.WindowStyle = 1',
  '$s.Save()',
  'Write-Host "Shortcut created: " $lnk',
];
const psContent = psLines.join("\n");
fs.writeFileSync(psPath, psContent, "utf8");

try {
  execSync('powershell -ExecutionPolicy Bypass -File "' + psPath + '"', { stdio: "inherit" });
  console.log("\nDone! Double-click VisionLoop on your desktop to start.");
} catch (e) {
  console.log("Could not create shortcut (non-Windows or permission issue)");
  console.log("Run manually: npm run launch");
} finally {
  try { fs.unlinkSync(psPath); } catch (_) {}
}