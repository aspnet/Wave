param (
    [string]
    $config = "run-coldstart.config.json",

    [int]
    $timeout = -1
)

function RunTest($os, $framework, $appHost, $scenario, $database, $precompileVersion)
{
    $params = @{ "os" = $os; "framework" = $framework; "scenario" = $scenario; "timeout" = $timeout }

    if ($appHost)
    {
        $params.appHost = $appHost
    }

    if ($database)
    {
        $params.database = $database
    }

    if ($precompileVersion)
    {
        $params.precompileVersion = $precompileVersion
    }

    & $runTest @params
}


$runTest = Join-Path $PSScriptRoot run-coldstart.ps1

if (! (Test-Path $config))
{
    Write-Error "Config file ${config} does not exist"
    Exit -1
}

$configObject = gc $config | ConvertFrom-Json

$osList = $configObject.os
$frameworkList =  $configObject.framework
$scenarioList = $configObject.scenario
$precompileOptionsMap = $configObject.precompile_options

$osHostMap = $configObject.os_hosts_support
$osDBMap = $configObject.os_db_support
$dbscenarios = $configObject.db_scenarios

$completedRecordsPath = Join-Path $PSScriptRoot "run-coldstart-completed.txt"
$excludePath = Join-Path $PSScriptRoot "run-coldstart-exclude.txt"

if (Test-Path $completedRecordsPath)
{
    Remove-Item $completedRecordsPath
}

if (Test-Path $excludePath)
{
    $excludeList = Get-Content $excludePath
}


foreach ($os in $osList)
{
    foreach ($framework in $frameworkList)
    {
        $hosts = $osHostMap | Select -ExpandProperty $os

        foreach ($appHost in $hosts)
        {
            # the parser has problem handle null value, use "none" instead for no app host
            if ($appHost -eq "none")
            {
                $appHost = $null
            }

            foreach ($scenario in $scenarioList)
            {
                if ($dbscenarios.Contains($scenario))
                {
                    $dbList = $osDBMap | Select -ExpandProperty $os
                }
                else
                {
                    $dbList = @( $null )
                }

                foreach ($database in $dbList)
                {
                    $precompileOptionsDefined = Get-Member -inputobject $precompileOptionsMap -name $scenario -Membertype Properties

                    if ($precompileOptionsDefined)
                    {
                        $precompileOptions = $precompileOptionsMap | Select -ExpandProperty $scenario
                        ## powershell serialization would actually automatically unwrap singleton list to a flat object, annoying...
                        if ($precompileOptions -is [System.String])
                        {
                            $precompileOptions = @( $precompileOptions )
                        }
                    }
                    else
                    {
                        $precompileOptions = @()
                    }

                    $precompileOptions += $null

                    foreach ($precompileVersion in $precompileOptions)
                    {
                        $scenarioDescription = "os:${os} framework:${framework} appHost:${appHost} scenario:${scenario} database:${database} precompileVersion:${precompileVersion}"
                        if ($excludeList -and $excludeList.Contains($scenarioDescription))
                        {
                            Write-Host "Skipping scenario: ${scenarioDescription}"
                        }
                        else
                        {
                            Write-Host "Running scenario: ${scenarioDescription}"
                            RunTest -os $os -framework $framework -appHost $appHost -scenario $scenario -database $database -precompileVersion $precompileVersion
                            $scenarioDescription | Out-File $completedRecordsPath -Append
                        }
                    }
                }
            }
        }
    }
}
