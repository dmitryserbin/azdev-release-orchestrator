[CmdletBinding()]
Param
(
	[Parameter(Mandatory=$True)]
    [String]$Path,

    [Parameter(Mandatory=$True)]
    [String]$Account,

    [Parameter(Mandatory=$True)]
    [String]$Token
)

try
{
    # Get task path
    $TaskJson = Join-Path -Path $Path -ChildPath task.json

    if (-not (Test-Path -Path $TaskJson))
    {
        throw "Definition <$TaskJson> not found"
    }

    # Read task
    $Task = Get-Content -Path $TaskJson `
        -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop

    if (-not $Task.id)
    {
        throw "Invalid task <$TaskJson> definition"
    }

    Write-Host "##[section] Installing <TFX-CLI> pre-requisites"

    # Install TFX
    npm install --global tfx-cli

    if ($LASTEXITCODE -ne 0)
    {
        throw "Error installing pre-requisites"
    }

    Write-Host "##[section] Connecting to <$Account> account"
    
    # Login
    tfx login --service-url ("https://dev.azure.com/{0}" -f $Account) --token $Token
    
    Write-Host "##[section] Deleting existing <$($Task.id)> task"

    # Delete task
    tfx build tasks delete --task-id $Task.id

    Write-Host "##[section] Uploading new <$Path> task"
    
    # Upload task
    tfx build tasks upload --task-path $Path
}
catch
{
    throw "Unable to publish task. $_"
}
