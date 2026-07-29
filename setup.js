// VisionLoop Setup — creates desktop shortcut on Windows
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const desktop = path.join(require("os").homedir(), "Desktop");
const projectDir = __dirname;

console.log("VisionLoop Setup");
console.log("================");

// Build the PowerShell shortcut creation script
const psScript = `
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("${desktop}\\VisionLoop.lnk")
$s.TargetPath = "cmd.exe"
$s.Arguments = '/c "cd /d ${projectDir} && npm run launch"'
$s.WorkingDirectory = "${projectDir}"
$s.IconLocation = "C:\\Windows\\System32\\imageres.dll,34"
$s.Description = "VisionLoop - AI视觉导演工作台"
$s.Save()
Write-Host "Desktop shortcut created!"
`;

try {
  execSync(`powershell -ExecutionPolicy Bypass -Command "${psScript.replace(/"/g, '\\"')}"`, { stdio: "inherit" });
  console.log("\nDone! Double-click VisionLoop on your desktop to start.");
} catch (e) {
  console.log("Could not create shortcut (non-Windows or permission issue)");
  console.log("Run manually: npm run launch");
}