#Requires -Version 3.0
#Requires -Module AzureRM.Resources
#Requires -Module Azure.Storage

Param(
    [string] [Parameter(Mandatory=$true)] $SubscriptionId,
    [string] [Parameter(Mandatory=$true)] $ResourceGroupLocation,
    [string] [Parameter(Mandatory=$true)] $ResourceGroupName,
    [string] [Parameter(Mandatory=$true)] $AdminPassword,
    [string] [Parameter(Mandatory=$true)] $TemplateFile,
    [string] [Parameter(Mandatory=$true)] $GlobalSharePath,
    [string] [Parameter(Mandatory=$true)] $GlobalShareKey
)

$TemplateFile = [System.IO.Path]::Combine($PSScriptRoot, $TemplateFile)

Select-AzureRmSubscription -SubscriptionID $SubscriptionId

# Create or update the resource group using the specified template file and template parameters file
New-AzureRmResourceGroup -Name $ResourceGroupName -Location $ResourceGroupLocation -Verbose -Force -ErrorAction Stop 

New-AzureRmResourceGroupDeployment -Name ((Get-ChildItem $TemplateFile).BaseName + '-' + ((Get-Date).ToUniversalTime()).ToString('MMdd-HHmm')) `
                                   -ResourceGroupName $ResourceGroupName `
                                   -TemplateFile $TemplateFile `
                                   -adminUsername "asplab" `
                                   -adminPassword $AdminPassword `
                                   -dnsNamePrefix $ResourceGroupName `
                                   -Force -Verbose

Write-Output "GlobalSharePath: "  $GlobalSharePath;
Write-Output "GlobalShareKey: "  $GlobalShareKey;
