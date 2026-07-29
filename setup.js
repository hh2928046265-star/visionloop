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

// Write launcher bat with UTF-8 BOM (required for Chinese display in cmd)
const batPath = path.join(projectDir, "启动VisionLoop.bat");
const batContent = "\uFEFF" + [
  "@echo off",
  "chcp 65001 >nul",
  "echo ================================",
  "echo   VisionLoop - AI视觉导演工作台",
  "echo ================================",
  "echo.",
  "echo 正在启动...",
  "cd /d " + projectDir,
  "npm run launch",
  "pause",
].join("\r\n");
fs.writeFileSync(batPath, batContent, "utf8");

// CRITICAL: PS script must be UTF-16LE for Chinese path support
const psLines = [
  '$desktop = "' + desktop.replace(/\\/g, "\\\\") + '"',
  '$projectDir = "' + projectDir.replace(/\\/g, "\\\\") + '"',
  '$bat = Join-Path $projectDir "启动VisionLoop.bat"',
  '$ws = New-Object -ComObject WScript.Shell',
  '$lnk = Join-Path $desktop "VisionLoop.lnk"',
  '$s = $ws.CreateShortcut($lnk)',
  '$s.TargetPath = $bat',
  '$s.IconLocation = "C:\\Windows\\System32\\imageres.dll,34"',
  '$s.Description = "VisionLoop"',
  '$s.Save()',
  'Write-Host "Shortcut created: " $lnk',
];
const psContent = "\uFEFF" + psLines.join("\r\n");
fs.writeFileSync(psPath, psContent, "utf16le");

try {
  execSync('powershell -ExecutionPolicy Bypass -File "' + psPath + '"', { stdio: "inherit" });
  console.log("\nDone! Double-click VisionLoop on your desktop to start.");
} catch (e) {
  console.log("Could not create shortcut (non-Windows or permission issue)");
  console.log("Run manually: npm run launch");
} finally {
  try { fs.unlinkSync(psPath); } catch (_) {}
}