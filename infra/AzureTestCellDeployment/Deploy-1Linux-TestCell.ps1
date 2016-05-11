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

$res = cmd /c where plink.exe
if (-not $res) 
{
	Write-Host "Error:  To configure Linux VMs, the plink.exe ssh utility must be in the path. "
	return
}

$TemplateFile = "1Linux_CellDeployment.json"
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


#deploy agent on Linux VM
Write-Host "Starting Setup For Linux VM"
$linuxIpResource = Get-AzureRmResource -ResourceGroupName $ResourceGroupName -ResourceName "LinuxPublicIP" -ExpandProperties
$linuxIP = $linuxIpResource.Properties.IpAddress
Write-Host "Linux VM IP:  "$linuxIP

$tempScriptName = [System.IO.Path]::GetTempFileName() + ".ssh"
$sshScriptContent = Get-Content "LinuxSetup.ssh"
$sshScriptContent = $sshScriptContent -replace "<mqttBroker>", $MqttBroker
$sshScriptContent = $sshScriptContent -replace "<mqttUserName>", $MqttUser
$sshScriptContent = $sshScriptContent -replace "<mqttPassword>", $MqttPassword
Set-Content $tempScriptName -Value $sshScriptContent

Write-Host "Doing linux config using temporary file:  " + $tempScriptName
cmd /c echo "Y`r" |  plink.exe  $linuxIP  -ssh -l "asplab" -pw $AdminPassword -m $tempScriptName 
Remove-Item $tempScriptName 





