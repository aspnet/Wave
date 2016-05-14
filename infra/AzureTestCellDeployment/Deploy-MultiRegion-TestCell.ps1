Param(
    [string] [Parameter(Mandatory=$true)] $SubscriptionId,
    [string] [Parameter(Mandatory=$true)] $ResourceGroupName,
    [string[]] [Parameter(Mandatory=$true)] $LocationList,
    [string] [Parameter(Mandatory=$true)] $OsType,
    [string] [Parameter(Mandatory=$true)] $AdminPassword,
    [string] [Parameter(Mandatory=$true)] $MqttBroker,
    [string] [Parameter(Mandatory=$true)] $MqttUser,
    [string] [Parameter(Mandatory=$true)] $MqttPassword
)


function DoWindowsDeployment()
{
    Param(
        [string[]] [Parameter(Mandatory=$true)] $locations, 
        [string[]] [Parameter(Mandatory=$true)] $locationNames
    )

    if ($ResourceGroupName.Length -gt 7)  #make max length contingent on trimmed max location length. 
    {
	    Write-Host "Error:  The ResourceGroupName parameter must be 7 chars or shorter.  "
        Write-Host "  This limitation is necessary because of windows machine name length limitations, "
        Write-Host "  and the fact that the ResourceGroupName will become part of the windows machine name. "
        return
    }

    $TemplateFile = "MultiRegion_Windows_CellDeployment.json"
    $TemplateFile = [System.IO.Path]::Combine($PSScriptRoot, $TemplateFile)

    # Create or update the resource group using the specified template file and template parameters file
    New-AzureRmResourceGroup -Name $ResourceGroupName -Location "Central US" -Verbose -Force -ErrorAction Stop

    New-AzureRmResourceGroupDeployment -Name ((Get-ChildItem $TemplateFile).BaseName + '-' + ((Get-Date).ToUniversalTime()).ToString('MMdd-HHmm')) `
                                       -ResourceGroupName $ResourceGroupName `
                                       -TemplateFile $TemplateFile `
                                       -dnsNamePrefix $ResourceGroupName `
                                       -adminUserName "asplab" `
                                       -adminPassword $AdminPassword `
                                       -locations $locations `
                                       -locationNames $locationNames `
                                       -Force -Verbose

    #Set up Windows VMs
    $FQDNs = @()
    $soptions = New-PSSessionOption -SkipCACheck
    $securePwd = ConvertTo-SecureString $AdminPassword -AsPlainText -Force
    $cred = new-object -typename System.Management.Automation.PSCredential -argumentlist "asplab", $securePwd

    for($i = 0; $i -lt $locations.Count; $i++)
    {
        $location = $locations[$i]
        Write-Host "Starting Setup for region: $location"

        $publicIpName = "WinPublicIP-" + $location
        $WinIpResource = Get-AzureRmPublicIpAddress -ResourceGroupName $ResourceGroupName  -Name $publicIpName
        $WinFQDN = $WinIpResource.DnsSettings.Fqdn
        Write-Host "VM FQ Domain Name for region"$location": "$WinFQDN
        $FQDNs += $WinFQDN

        $remotePsSession = New-PSSession -ComputerName  $WinFQDN  -Port 5986 -Credential $cred -SessionOption $soptions -UseSSL
        Write-Host "Starting Core Setup"
        Invoke-Command -Session $remotePsSession -FilePath WindowsVmSetup-Core.ps1  -ArgumentList "asplab",$AdminPassword,$MqttBroker,$MqttUser,$MqttPassword
        Remove-PSSession $remotePsSession

        $vmName = "WinVM-$location-" + ($ResourceGroupName+$locationNames[$i]).ToLower()
        Restart-AzureRmVM -ResourceGroupName $ResourceGroupName -Name $vmName
        Write-Host "Kicked off reboot of Windows VM: $vmName"
    }

    Write-Host ""
    Write-Host "******************************************************************************************"
    Write-Host "Deployment summary"
    Write-Host ""
    Write-Host ""

    "{0,-22}{1,-20}{2}" -f "Region", "Host Name", "FQDN"
    Write-Host ""
    for($i = 0; $i -lt $LocationList.Count; $i++)
    {
        $hostName = $ResourceGroupName + $locationNames[$i]
        "{0,-22}{1,-20}{2}" -f $LocationList[$i], $hostName, $FQDNs[$i]
    }
    Write-Host "******************************************************************************************"
}


function DoLinuxDeployment()
{
    Param(
        [string[]] [Parameter(Mandatory=$true)] $locations, 
        [string[]] [Parameter(Mandatory=$true)] $locationNames
    )

	$res = cmd /c where plink.exe
	if (-not $res) 
	{
		Write-Host "Error:  To configure Linux VMs, the plink.exe ssh utility must be in the path. "
		return
	}

    $TemplateFile = "MultiRegion_Linux_CellDeployment.json"
    $TemplateFile = [System.IO.Path]::Combine($PSScriptRoot, $TemplateFile)

    # Create or update the resource group using the specified template file and template parameters file
    New-AzureRmResourceGroup -Name $ResourceGroupName -Location "Central US" -Verbose -Force -ErrorAction Stop

    New-AzureRmResourceGroupDeployment -Name ((Get-ChildItem $TemplateFile).BaseName + '-' + ((Get-Date).ToUniversalTime()).ToString('MMdd-HHmm')) `
                                       -ResourceGroupName $ResourceGroupName `
                                       -TemplateFile $TemplateFile `
                                       -dnsNamePrefix $ResourceGroupName `
                                       -adminUserName "asplab" `
                                       -adminPassword $AdminPassword `
                                       -locations $locations `
                                       -locationNames $locationNames `
                                       -Force -Verbose

    #Set up Linux VMs
    $IPAddresses = @()

    for($i = 0; $i -lt $locations.Count; $i++)
    {
        $location = $locations[$i]
        Write-Host "Starting Setup for region: $location"

        $publicIpName = "LinuxPublicIP-" + $location
		$linuxIpResource = Get-AzureRmResource -ResourceGroupName $ResourceGroupName -ResourceName $publicIpName -ExpandProperties
		$linuxIP = $linuxIpResource.Properties.IpAddress
		Write-Host "Linux VM IP:  "$linuxIP
		$IPAddresses += $linuxIP

		$tempScriptName = [System.IO.Path]::GetTempFileName() + ".ssh"
		$sshScriptContent = Get-Content "LinuxSetup.ssh"
		$sshScriptContent = $sshScriptContent -replace "<mqttBroker>", $MqttBroker
		$sshScriptContent = $sshScriptContent -replace "<mqttUserName>", $MqttUser
		$sshScriptContent = $sshScriptContent -replace "<mqttPassword>", $MqttPassword
		Set-Content $tempScriptName -Value $sshScriptContent

		Write-Host "Doing linux config using temporary file: " $tempScriptName
		cmd /c echo "Y`r" |  plink.exe  $linuxIP  -ssh -l "asplab" -pw $AdminPassword -m $tempScriptName 

		Remove-Item $tempScriptName 
    }

    Write-Host ""
    Write-Host "******************************************************************************************"
    Write-Host "Deployment summary"
    Write-Host ""
    Write-Host ""

    "{0,-22}{1,-20}{2}" -f "Region", "Host Name", "IP"
    Write-Host ""
    for($i = 0; $i -lt $LocationList.Count; $i++)
    {
        $hostName = $ResourceGroupName + $locationNames[$i]
        "{0,-22}{1,-20}{2}" -f $LocationList[$i], $hostName, $IPAddresses[$i]
    }
    Write-Host "******************************************************************************************"
}



function GetLocationNameArray
{
    Param(
        [string[]] [Parameter(Mandatory=$true)] $Locations
    )

    $nameArray = @()
    for($i = 0; $i -lt $Locations.Count; $i++)
    {
        $loc = $Locations[$i]

        $trimmedLoc = $loc -replace " ", ""
        if ($trimmedLoc.Length -le 8)
        {
            $nameArray += $trimmedLoc
        }
        else
        {
            $tokens = -split $loc 
            $nameArray += ""
            foreach ($token in $tokens)
            {
               if ($token.Length -le 3)
               {
                 $nameArray[$i] = $nameArray[$i] + $token
               }
               else
               {
                 if ($tokens.Count -le 2)
                 {
                   $nameArray[$i] = $nameArray[$i] + $token.Substring(0,4)
                 }
                 else
                 {
                   $nameArray[$i] = $nameArray[$i] + $token.Substring(0,3)
                 }
               }
            }
            if ($nameArray[$i].Length -gt 8)
            {
                $nameArray[$i] = $nameArray[$i].Substring(0,8)
            }
        }

    }
    return $nameArray
}




$currentSubscription = (Get-AzureRmContext).Subscription
if ($currentSubscription.SubscriptionId -ne $SubscriptionId)
{
	Write-Host "Setting current subscription"
    Select-AzureRmSubscription -SubscriptionID $SubscriptionId
}

# validate passed in locations
$azureLocations = ((Get-AzureRmResourceProvider -ProviderNamespace Microsoft.Compute).ResourceTypes | Where-Object ResourceTypeName -eq virtualMachines).Locations
foreach ($loc in  $LocationList)
{
    if (-not $azureLocations.Contains($loc) )
    {
        Write-Host "Error: Invalid location specified.  The location '" $loc "' does not exist or does not support VMs"
        Write-Host "Valid locations are:"
        $azureLocations
        return
    }
}

# create short location acryonyms and remove white space from location list
$locationNames = GetLocationNameArray($LocationList)
$locations = @()
for($i = 0; $i -lt $LocationList.Count; $i++)
{
    $locations += $LocationList[$i] -replace " ",""
}

if ($OsType.ToLower() -eq "windows")
{
    DoWindowsDeployment -locations $locations  -locationNames $locationNames  
}
elseif ($OsType.ToLower() -eq "linux")
{
    DoLinuxDeployment -locations $locations  -locationNames $locationNames  
}
else 
{
    Write-Host "Error:  Please specify 'Windows' or 'Linux' for OsType" 
}
