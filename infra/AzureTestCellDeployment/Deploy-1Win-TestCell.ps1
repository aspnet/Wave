#Requires -Version 3.0
#Requires -Module AzureRM.Resources
#Requires -Module Azure.Storage

Param(
    [string] [Parameter(Mandatory=$true)] $SubscriptionId,
    [string] [Parameter(Mandatory=$true)] $ResourceGroupLocation,
    [string] [Parameter(Mandatory=$true)] $ResourceGroupName,
    [string] [Parameter(Mandatory=$true)] $AdminPassword,
    [string] [Parameter(Mandatory=$true)] $MqttBroker,
    [string] [Parameter(Mandatory=$true)] $MqttUser,
    [string] [Parameter(Mandatory=$true)] $MqttPassword
)

if ($ResourceGroupName.Length -gt 10)
{
	Write-Host "Error:  The ResourceGroupName parameter must be 10 chars or shorter.  "
    Write-Host "  This limitation is necessary because of windows machine name length limitations, "
    Write-Host "  and the fact that the ResourceGroupName will become part of the windows machine name. "
	return
}

$TemplateFile = "1Windows_CellDeployment.json"
$TemplateFile = [System.IO.Path]::Combine($PSScriptRoot, $TemplateFile)

Select-AzureRmSubscription -SubscriptionID $SubscriptionId

# Create or update the resource group using the specified template file and template parameters file
New-AzureRmResourceGroup -Name $ResourceGroupName -Location $ResourceGroupLocation -Verbose -Force -ErrorAction Stop

New-AzureRmResourceGroupDeployment -Name ((Get-ChildItem $TemplateFile).BaseName + '-' + ((Get-Date).ToUniversalTime()).ToString('MMdd-HHmm')) `
                                   -ResourceGroupName $ResourceGroupName `
                                   -TemplateFile $TemplateFile `
                                   -dnsNamePrefix $ResourceGroupName `
                                   -adminUserName "asplab" `
                                   -adminPassword $AdminPassword `
                                   -Force -Verbose

#deploy agent on Windows VM
$soptions = New-PSSessionOption -SkipCACheck
$securePwd = ConvertTo-SecureString $AdminPassword -AsPlainText -Force
$cred = new-object -typename System.Management.Automation.PSCredential -argumentlist "asplab", $securePwd

Write-Host "Starting Setup For Windows VM"
$WinIpResource1 = Get-AzureRmPublicIpAddress -ResourceGroupName $ResourceGroupName  -Name WinPublicIP
$WinFQDN1 = $WinIpResource1.DnsSettings.Fqdn
Write-Host "Windows VM Domain Name:  "$WinFQDN1

$remotePsSession1 = New-PSSession -ComputerName  $WinFQDN1  -Port 5986 -Credential $cred -SessionOption $soptions -UseSSL
Write-Host "Starting Core Setup For Windows VM"
Invoke-Command -Session $remotePsSession1 -FilePath WindowsVmSetup-Core.ps1  -ArgumentList "asplab",$AdminPassword,$MqttBroker,$MqttUser,$MqttPassword
Remove-PSSession $remotePsSession1

Restart-AzureRmVM -ResourceGroupName $ResourceGroupName -Name "Win1" 
Write-Host "Kicked off reboot of Windows VM"





