# Creates a desktop shortcut that launches this app.
#
# Run when the shortcut is missing (new machine, deleted by mistake, or the
# project moved). Safe to run repeatedly - it overwrites the same .lnk.
#
#   powershell -ExecutionPolicy Bypass -File create-shortcut.ps1
#
# No administrator rights needed.
#
# NOTE: ASCII only. Windows PowerShell 5.1 reads .ps1 files using the system
# ANSI codepage, so non-ASCII characters here would be mangled into a parse
# error on machines whose codepage is not UTF-8.

$ErrorActionPreference = "Stop"

# Derived from this script's location so moving the project keeps it working.
$ProjectDir = $PSScriptRoot

# The desktop lives inside OneDrive on this machine, and its name is localized,
# so ask Windows for it rather than building the path by hand.
$Desktop = [Environment]::GetFolderPath("Desktop")
$LinkPath = Join-Path $Desktop "AutoMarketMap.lnk"

$Shell = New-Object -ComObject WScript.Shell
$Link = $Shell.CreateShortcut($LinkPath)
$Link.TargetPath = Join-Path $ProjectDir "start-app.bat"
$Link.WorkingDirectory = $ProjectDir
$Link.IconLocation = (Join-Path $ProjectDir "public\auto-market-map.ico") + ",0"
# 7 = start minimized. The batch window is only a host for the dev server;
# the browser is what the user actually looks at.
$Link.WindowStyle = 7
$Link.Description = "Automotive value-chain market map (port 3002)"
$Link.Save()

Write-Output "Created shortcut: $LinkPath"
Write-Output "Double-click it to start the server and open http://localhost:3002"
