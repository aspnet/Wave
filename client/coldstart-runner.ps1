param([string] $include, [string] $exclude)

$coldstartDir = [System.IO.Path]::Combine($PSScriptRoot, "test", "coldstart")
$hostname = & hostname
$jobfile = [System.IO.Path]::Combine($coldstartDir, "run-job-coldstart.json")
$controller = [System.IO.Path]::Combine($PSScriptRoot, "controller.js")

$scPrefix = "run-coldstart-"
$scPostfix = "-core.json"
foreach ( $scenarioFile in (Get-ChildItem $coldstartDir -Filter "${scPrefix}*${scPostfix}") | Select -ExpandProperty Name )
{
    if ((!$include) -or ($scenarioName -match $include))
    {
        $scenarioName = $scenarioFile.substring($scPrefix.Length, $scenarioFile.Length - $scPrefix.Length - $scPostfix.Length)
        if ( $exclude -and ($scenarioName -match $exclude) )
        {
            continue;
        }

        ConvertTo-Json @{ $scenarioName = @{ "spec" = "./test/coldstart/run-coldstart.md" ; env = "./test/coldstart/${scenarioFile}" }} `
            | Out-File $jobfile -Encoding Default

        Write-Host "Executing: node ${controller} --job ${jobfile} --topic controller/${hostname} --verbose"
        node ${controller} --job ${jobfile} --topic controller/${hostname} --verbose

        Write-Host "Job done, press enter to run the next..."
        Read-Host
    }
}
