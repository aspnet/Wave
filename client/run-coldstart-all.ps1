param (
    [int]
    $timeout = -1
)

function RunTest($os, $framework, $appHost, $scenario, $database)
{
    $params = @{ "os" = $os; "framework" = $framework; "scenario" = $scenario }

    if ($appHost)
    {
        $params.appHost = $appHost
    }

    if ($database)
    {
        $params.database = $database
    }

    & $runTest @params
}


$runTest = Join-Path $PSScriptRoot run-coldstart.ps1

$osHostMap = @{ "win" = @($null, "iis") ; "linux" = @($null, "nginx") }
$dbscenarios = @( "musicstore" )
$osDBMap = @{ "win" = @("inmemory", "localdb", "remotedb") ; "linux" = @("inmemory", "remotedb") }

foreach ($os in @("win", "linux"))
{
    foreach ($framework in @("netcoreapp1.0"))
    {
        foreach ($appHost in $osHostMap.Get_Item($os))
        {
            foreach ($scenario in @("musicstore", "mvc", "text"))
            {
                if ($dbscenarios.Contains($scenario))
                {
                    $dbList = $osDBMap.Get_Item($os)
                }
                else
                {
                    $dbList = @( $null )
                }

                foreach ($database in $dbList)
                {
                    RunTest -os $os -framework $framework -appHost $appHost -scenario $scenario -database $database
                }
            }
        }
    }
}
