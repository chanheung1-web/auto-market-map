# Allows phones/tablets to reach the dev server on port 3002.
#
# Scoped to the Private profile only. The Tailscale adapter is Private and the
# Ethernet adapter is Public, so this opens the port to your own Tailscale
# devices while leaving it closed on the physical network.
#
# Run once, as Administrator:
#   powershell -ExecutionPolicy Bypass -File setup-firewall.ps1
#
# NOTE: ASCII only. Windows PowerShell 5.1 reads .ps1 files using the system
# ANSI codepage, so non-ASCII characters here would be mangled into a parse
# error on machines whose codepage is not UTF-8.

$ErrorActionPreference = "Stop"

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Please run this script as Administrator."
    exit 1
}

$ruleName = "auto-market-map (port 3002, private)"

$existing = $null
try { $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction Stop } catch {}

if ($existing) {
    Write-Output "Rule already exists: $ruleName"
} else {
    New-NetFirewallRule `
        -DisplayName $ruleName `
        -Description "Allow Tailscale/LAN devices to reach the Next.js server." `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort 3002 `
        -Profile Private | Out-Null
    Write-Output "Created firewall rule: $ruleName"
}

Write-Output ""
Write-Output "Open one of these from your iPhone / iPad:"
Write-Output "  http://desktop-2v0387k:3002"
Write-Output "  http://100.113.78.45:3002   (fallback if MagicDNS is off)"
