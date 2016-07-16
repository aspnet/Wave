Param(
    [string] [Parameter(Mandatory=$true)] $SubscriptionId,
    [string] [Parameter(Mandatory=$true)] $ResourceGroupName
)

$currentSubscription = (Get-AzureRmContext).Subscription
if ($currentSubscription.SubscriptionId -ne $SubscriptionId)
{
	Write-Host "Setting current subscription"
    Select-AzureRmSubscription -SubscriptionID $SubscriptionId
}


$vmList = Get-AzureRmVM -ResourceGroupName $ResourceGroupName 
if ( -not $vmList -or $vmList.Count -le 0)
{
    Write-Host "Error: No VMs were found for the Resource Group: $ResourceGroupName"
    return
}

Write-Host ""
Write-Host "Discovered the following VMs in ResourceGroup $ResourceGroupName"
foreach ($vm in $vmList)
{
    Write-Host $vm.Name
}

Write-Host ""
foreach ($vm in $vmList)
{
    Write-Host Stopping $vm.Name
    Stop-AzureRmVM -ResourceGroupName $ResourceGroupName -Name $vm.Name -Force
}


