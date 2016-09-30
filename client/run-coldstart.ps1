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

    $precompileVersion,

    [Int]
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

function AppendScriptExtension($scriptName)
{
    if ($os -eq "win")
    {
        $scriptName + ".ps1"
    }
    elseif ($os -eq "linux")
    {
        "./" + $scriptName + ".sh"
    }
    else
    {
        Exit -1
    }
}

function AppendIISPostfix($scriptName)
{
    if ($appHost -eq "iis")
    {
        $scriptName + "-IIS"
    }
    else
    {
        $scriptName
    }
}

function AppendAppHostPostfix($scriptName)
{
    if (!$appHost)
    {
        $scriptName
    }
    elseif ($appHost -eq "iis")
    {
        $scriptName + "-IIS"
    }
    elseif ($appHost -eq "nginx")
    {
        $scriptName + "-nginx"
    }
    else
    {
        Exit -1
    }
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

$publishScript = AppendIISPostfix "Publish"
$publishScript = AppendScriptExtension $publishScript

$measureScript = AppendAppHostPostfix "Measure"
$measureScript = AppendScriptExtension $measureScript

$archiveScript = AppendAppHostPostfix "Archive"
$archiveScript = AppendScriptExtension $archiveScript

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

if ($precompileVersion)
{
    $precompileOption = "-p ${precompileVersion}"
}
else
{
    # mdparser actually ignores empty string for some reason (ln 109: return env[$1] || match)
    $precompileOption = " "
}

$testName = "${scenario}"

if ($database)
{
    $testName += "-${database}"
}

$testName += "-${osHostAbbreviation}-${frameworkAbbreviation}"

if ($precompileVersion)
{
    $testName += "-precompile-${precompileVersion}"
}

$scenarioObj = @{
    "logdir" = $logdirMap.Get_Item($os);
    "path" = $pathMap.Get_Item($os);
    "rebootCommand" = $rebootCommandMap.Get_Item($os);
    "measureScript" = $measureScript;
    "publishScript" = $publishScript;
    "archiveScript" = $archiveScript;
    "`$targets" = @{
        "server" = @{
            "name" = $serverMap.Get_Item($os);
            "testName" = $testName;
            "targetApp" = $appMap.Get_Item($scenario);
            "framework" = $framework;
            "precompileOption" = $precompileOption;
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

$outputFileName = "run-coldstart-${testName}.json"

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
