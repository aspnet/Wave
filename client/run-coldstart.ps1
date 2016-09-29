param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("text","mvc","musicstore")]
    $scenario,

    [ValidateSet("inmemory","localdb","remotedb")]
    $database,

    [Parameter(Mandatory=$true)]
    [ValidateSet("win","linux")]
    $os,

    [ValidateSet("iis","nginx")]
    $appHost,

    [Parameter(Mandatory=$true)]
    [ValidateSet("netcoreapp1.0")]
    $framework,

    [int]
    $timeout = -1
)

function CombinePath()
{
    if ($os -eq "win")
    {
        $separator = "\"
    }
    else
    {
        $separator = "/"
    }
    [System.String]::Join($separator, $args)
}

$logdirMap = @{
    "win" = "c:\`$(testid)";
    "linux" = "/home/asplab/`$(testid)"
}

$pathMap = @{
    "win" = "%localappdata%\microsoft\dotnet;%ProgramFiles%\Git\cmd";
    "linux" = "/home/asplab/.dotnet"
}

$rebootCommandMap = @{
    "win" = "shutdown /r /f /t 0";
    "linux" = "sudo shutdown -r now"
}

$measureScriptMap = @{
    "win" = "Measure-IIS.ps1";
    "linux" = "./Measure.sh"
}

$publishScriptMap = @{
    "win" = "Publish-IIS.ps1";
    "linux" = "./Publish.sh"
}

$archiveScriptMap = @{
    "win" = "Archive-IIS.ps1";
    "linux" = "./Archive.sh"
}

$serverMap = @{
    "win" = "Asp-xHPc7";
    "linux" = "Asp-xHPSLC1"
}

if ($appHost)
{
    $osHostAbbreviation = $appHost
}
else
{
    $osHostAbbreviation = $os
}

if ($framework -eq "netcoreapp1.0")
{
    $frameworkAbbreviation = "core"
}
else
{
    $frameworkAbbreviation = $framework
}

$appMap = @{
    "musicstore" = "MusicStore";
    "mvc" = "HelloWorldMvc";
    "text" = "BasicKestrel"
}

if ($os -eq "win")
{
    $gitHome = "D:\git\aspnet"
}
else
{
    $gitHome = "/home/asplab/git/aspnet"
}

$perfHome = CombinePath $gitHome "Performance"
$scriptHome = CombinePath $perfHome "test" "ColdStart"

if ($database -eq "inmemory")
{
    $testAppBranch = "shhsu/coldstart_inmemory"
}
elseif ($database -eq "remotedb")
{
    $testAppBranch = "shhsu/coldstart_remote_sql2016"
}
else
{
    $testAppBranch = "shhsu/coldstart"
    ## musicstore localdb or non-database scenarios
}

if ($scenario -eq "musicstore")
{
    $testAppSource = "https://github.com/aspnet/MusicStore.git"
    $testAppHome = CombinePath $gitHome "MusicStore"
    $testAppDir = CombinePath $testAppHome "samples" "MusicStore"
}
else
{
    $testAppSource = "https://github.com/aspnet/Performance.git"
    $testAppHome = $perfHome
    $testAppDir = "null"
}

$testName = "${scenario}-${osHostAbbreviation}-${frameworkAbbreviation}"
$scenarioObj = @{
    "logdir" = $logdirMap.Get_Item($os);
    "path" = $pathMap.Get_Item($os);
    "rebootCommand" = $rebootCommandMap.Get_Item($os);
    "measureScript" = $measureScriptMap.Get_Item($os);
    "publishScript" = $publishScriptMap.Get_Item($os);
    "archiveScript" = $archiveScriptMap.Get_Item($os);
    "`$targets" = @{
        "server" = @{
            "name" = $serverMap.Get_Item($os);
            "testName" = $testName;
            "targetApp" = $appMap.Get_Item($scenario);
            "framework" = $framework;
            "gitHome" = $gitHome;
            "scriptSource" = "https://github.com/aspnet/Performance.git";
            "perfHome" = $perfHome;
            "perfBranch" = "shhsu/coldstart";
            "scriptHome" = $scriptHome;
            "testAppBranch" = $testAppBranch;
            "testAppSource" = $testAppSource;
            "testAppHome" = $testAppHome;
            "testAppDir" = $testAppDir
        }
    }
}

if ($database)
{
    $outputFileName = "run-coldstart-${scenario}-${database}-${osHostAbbreviation}-${frameworkAbbreviation}.json"
}
else
{
    $outputFileName = "run-coldstart-${scenario}-${osHostAbbreviation}-${frameworkAbbreviation}.json"
}

$coldstartTestsDir = [System.IO.Path]::Combine($PSScriptRoot, "test", "coldstart")
$scenarioFile = [System.IO.Path]::Combine($coldstartTestsDir, $outputFileName)
ConvertTo-Json $scenarioObj | Out-File $scenarioFile -Encoding Default

$jobfile = [System.IO.Path]::Combine($coldstartTestsDir, "run-job-coldstart.json")
ConvertTo-Json @{ $testName = @{ spec = "./test/coldstart/run-coldstart.md" ; env = "./test/coldstart/${outputFileName}" }} `
            | Out-File $jobfile -Encoding Default

$program = [System.IO.Path]::Combine($PSScriptRoot, "controller.js")
$hostname = & hostname

$nodeProc = Start-Process "node" -ArgumentList "${program} --job ${jobfile} --topic controller/${hostname} --verbose" -PassThru

if ($timeout -gt 0)
{
    Start-Sleep -s $timeout
}
else
{
    Read-Host "Press enter to run the next test..."
}

Stop-Process $nodeProc
