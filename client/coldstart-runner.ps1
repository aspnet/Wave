param([string] $include, [string] $exclude, [int] $timeout = -1)

$coldstartDir = [System.IO.Path]::Combine($PSScriptRoot, "test", "coldstart")
$hostname = & hostname
$jobfile = [System.IO.Path]::Combine($coldstartDir, "run-job-coldstart.json")
$controller = [System.IO.Path]::Combine($PSScriptRoot, "controller.js")

$scPrefix = "run-coldstart-"
$scPostfix = "-core.json"
foreach ( $scenarioFile in (Get-ChildItem $coldstartDir -Filter "${scPrefix}*${scPostfix}") | Select -ExpandProperty Name )
{
    $scenarioName = $scenarioFile.substring($scPrefix.Length, $scenarioFile.Length - $scPrefix.Length - $scPostfix.Length)
    if ((!$include) -or ($scenarioName -match $include))
    {
        if ( $exclude -and ($scenarioName -match $exclude) )
        {
            continue;
        }

        Write-Host "Running scenario ${scenarioName}..."
        ConvertTo-Json @{ $scenarioName = @{ "spec" = "./test/coldstart/run-coldstart.md" ; env = "./test/coldstart/${scenarioFile}" }} `
            | Out-File $jobfile -Encoding Default

        $nodeProc = Start-Process "node" -ArgumentList "${controller} --job ${jobfile} --topic controller/${hostname} --verbose" -PassThru

        if ($timeout -gt 0)
        {
            Start-Sleep -s $timeout
        }
        else
        {
            Read-Host "Press enter to run the next test..."
        }

        Stop-Process $nodeProc
    }
}
