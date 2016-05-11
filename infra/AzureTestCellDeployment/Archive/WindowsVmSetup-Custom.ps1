
Param(
	[string] [Parameter(Mandatory=$true)] $AdminUser,
    [string] [Parameter(Mandatory=$true)] $AdminPassword,
    [string] [Parameter(Mandatory=$true)] $MqttUser,
    [string] [Parameter(Mandatory=$true)] $MqttPassword
)

# set up share
mkdir  c:\WinConfig

# install git
Copy-Item x:\Tools\Git-2.7.4-64-bit.exe c:\WinConfig
& c:\WinConfig\Git-2.7.4-64-bit.exe /Silent | Out-Null  -Verbose

#install nodejs
# ;c:\Users\"+$AdminUser+"\AppData\Roaming\npm"
Copy-Item x:\Tools\node-v5.10.1-x64.msi c:\WinConfig
& msiexec /i c:\WinConfig\node-v5.10.1-x64.msi /quiet | Out-Null  -Verbose
$env:Path += ";C:\Program Files\nodejs;c:\Users\" + $AdminUser + "\AppData\Roaming\npm"

#install wcat
Copy-Item x:\Tools\wcat.amd64.msi  c:\WinConfig
& msiexec /i c:\WinConfig\wcat.amd64.msi /quiet | Out-Null  -Verbose
Copy-Item -Path  "C:\Program Files\wcat\"  -Filter *.*  -Destination c:\windows\wcat\ -Recurse  -Verbose

#install node-red agent
(new-object net.webclient).DownloadString('https://raw.githubusercontent.com/SajayAntony/cmdport/master/scripts/Install.ps1') | Set-Content c:\WinConfig\CmdPortInstall.ps1
#Copy-Item x:\scripts\cmdPortInstall.ps1  c:\WinConfig 
c:\WinConfig\CmdPortInstall.ps1 -target_dir c:\cmdport  -broker_addr coreperfbroker.westus.cloudapp.azure.com -broker_username $MqttUser -broker_password $MqttPassword
