Param(
    [string] [Parameter(Position=0,Mandatory=$true)] $UserName,
    [string] [Parameter(Position=1,Mandatory=$true)] $SharePath,
    [string] [Parameter(Position=2,Mandatory=$true)] $ShareKey
)


Write-Output "Starting file share install" 

$result =  cmd /c net use x: $SharePath /u:$UserName $ShareKey /PERSISTENT:YES 2`>`&1  
Write-Output $result 

Write-Output "Completed file share install" 

