
Param(
    [string] $AdminDomain,
    [string] [Parameter(Mandatory=$true)] $AdminUser,
    [string] [Parameter(Mandatory=$true)] $AdminPassword
)

mkdir  c:\StartupConfig -Force

$autoLogonRegContent = @"
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon]
"DefaultUserName"="<adminUser>"
"DefaultPassword"="<adminPassword>"
"AutoAdminLogon"="1"
"@

if ($AdminDomain) {
    $autoLogonRegContent += @"
	
"DefaultDomainName"="<adminDomain>"
"@
}

$autoLogonRegContent = $autoLogonRegContent -replace "<adminUser>", $AdminUser
$autoLogonRegContent = $autoLogonRegContent -replace "<adminPassword>", $AdminPassword
$autoLogonRegContent = $autoLogonRegContent -replace "<adminDomain>", $AdminDomain


$autoLogonRegContent | Set-Content c:\StartupConfig\EnableAutoLogon.reg
$result = cmd /c regedit.exe /S c:\StartupConfig\EnableAutoLogon.reg 2`>`&1 
