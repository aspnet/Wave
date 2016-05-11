Stop-Transcript | out-null

Start-Transcript -path C:\Install-WCatLog.log -append

$webResponse

Write-Output "Starting wcat install" 

md c:\WCatInstall  -Verbose

Write-Output "Starting wcat msi download" 

for($i=1; $i -le 3; $i++)
{
    try
    {
        $webResponse = Invoke-WebRequest -Uri "http://www.iis.net/community/files/wcat/wcat.amd64.msi" -OutFile "c:\WCatInstall\wcat.amd64.msi" -TimeoutSec 180 -ErrorAction:Stop -Verbose
        break
    }
    catch 
    {
        Write-Output $webResponse
        continue
    }
}

Write-Output "Starting wcat installation" 
& msiexec.exe /i c:\WCatInstall\wcat.amd64.msi  /quiet | Out-Null  -Verbose

Write-Output "Writing client folder" 
Copy-Item -Path  "C:\Program Files\wcat\"  -Filter *.*  -Destination c:\windows\wcat\ -Recurse  -Verbose

Write-Output "Writing test ubr files" 

$settingsText=@"
settings
{
    clients         = 1;
    virtualclients  = 1;
    server          = "www.google.com";
}
"@
$settingsText | Set-Content "C:\Program Files\wcat\settings-test.ubr"


$scenarioText=@"
Scenario
{ 
    warmup      = 1;
    duration    = 20;
    cooldown    = 1;

    default
    {
        version     = HTTP11;
        statuscode  = 200;
        cookies	    = false;
        close       = ka;
    }

    transaction
    {
        id = "TestPage";
        weight = 1;
        request
        {
            url         = "/";
            statuscode  = 200;
        }
    }
}
"@
$scenarioText | Set-Content "C:\Program Files\wcat\scenario-test.ubr"

$commandText=@"
cscript //H:Cscript
wcat.wsf -terminate -run -clients localhost -t scenario-test.ubr -f settings-test.ubr
"@
$commandText | Set-Content "C:\Program Files\wcat\commandLines.txt"

Write-Output "Completed wcat install" 

Stop-Transcript 