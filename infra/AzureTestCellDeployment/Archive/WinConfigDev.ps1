$Password = "iis6!dfu"

$ShareUser = "fastfs"
$ShareKey = "+98qgRQv7trDYd42k117RsONI9Gzo2NHAdWRwtswGjiCiX3WMPM2bvavqCYBaz9/6I4cVc2wvVhyJ+IX+8lHJA=="
$MqttUser = "admin"
$MqttPassword = "Microsoft~1"

#*************************************************************
# must invoke session with hostname , not IP address !!!!!  figure out how to get host name from Azure
#*************************************************************

#$winIpResource = Get-AzureRmResource -ResourceGroupName Martinpf-winLin-02 -ResourceName "WinPublicIP" -ExpandProperties
#$winIP = $winIpResource.Properties.IpAddress
$ServerName = "martinpf-winlin-02-win1.centralus.cloudapp.azure.com"

$soptions = New-PSSessionOption -SkipCACheck
$securePwd = ConvertTo-SecureString $Password -AsPlainText -Force
$cred = new-object -typename System.Management.Automation.PSCredential -argumentlist "asplab", $securePwd

$remotePsSession = New-PSSession -ComputerName  $ServerName  -Port 5986 -Credential $cred -SessionOption $soptions -UseSSL

#Invoke-Command -Session $session -ScriptBlock { $someCommandLine }
Invoke-Command -Session $remotePsSession -FilePath .\WindowsSetup.ps1  -ArgumentList $ShareUser,$ShareKey,$MqttUser,$MqttPassword

Remove-PSSession $remotePsSession


