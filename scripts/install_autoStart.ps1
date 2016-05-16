param(
    [string] $AdminDomain,
    [string] [Parameter(Mandatory=$true)] $AdminUser,
    [string] [Parameter(Mandatory=$true)] $AdminPassword
)

npm install -g forever

#configure autologon
..\scripts\autoLogon.ps1 -AdminDomain $AdminDomain -AdminUser $AdminUser -AdminPassword $AdminPassword

mkdir  c:\StartupConfig -Force

$waveRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$startUpBatchFileContent = @"
pushd $waveRoot
forever start app.js
"@

$startUpBatchFileContent | Set-Content c:\StartupConfig\Startup.bat

$startupRegContent = @"
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run]
"startup"="C:\\StartupConfig\\Startup.bat"
"@
$startupRegContent | Set-Content c:\StartupConfig\EnableStartup.reg
$result = cmd /c  regedit.exe /S c:\StartupConfig\EnableStartup.reg  2`>`&1 
$result = "Startup config complete  " + $result 
Write-Output $result

c:\StartupConfig\Startup.bat
