
Write-Output "Starting Git install" 

md c:\GitInstall  -Verbose

Write-Output "Starting Git Installer download" 

$webResponse
for($i=1; $i -le 3; $i++)
{
    try
    {
        $webResponse = Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.8.1.windows.1/Git-2.8.1-32-bit.exe" -OutFile "c:\GitInstall\Git-Install.exe" -TimeoutSec 180 -ErrorAction:Stop -Verbose
        break
    }
    catch 
    {
        Write-Output $webResponse
        continue
    }
}

Write-Output "Starting Git installation" 
& c:\GitInstall\Git-Install.exe /Silent | Out-Null  -Verbose

Write-Output "Completed Git install" 


