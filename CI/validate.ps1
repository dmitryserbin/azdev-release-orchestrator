[CmdletBinding()]
Param
(
	[Parameter(Mandatory=$True)]
	[String]$Path,

	[Parameter(Mandatory=$False)]
	[Switch]$Required
)

function Get-LocalExtension
{
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[String]$Path
	)

	if (-not (Test-Path -Path $Path))
	{
		throw "Directory <$Path> not found"
	}

	$ExtensionFile = Get-ChildItem `
		-Path $Path `
		-Filter vss-extension.json `
		-File `
		-ErrorAction Stop | Select-Object -First 1

	if (-not (Test-Path -Path $ExtensionFile))
	{
		throw "File <$ExtensionFile> not found"
	}

	$Extension = Get-Content `
		-Path $ExtensionFile `
		-ErrorAction Stop | ConvertFrom-Json `
			-Depth 100 `
			-ErrorAction Stop

	return $Extension
}

function Get-MarketplaceExtension
{
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[String]$Name,

		[Parameter(Mandatory=$True)]
		[String]$ApiVersion
	)

	$Uri = ("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version={0}" -f $ApiVersion)

	$Query = @{
		filters = @(
			@{
				criteria = @(
					@{
						filterType = 7
						value = $Name
					}
				)
			}
		)
		flags = 103
	}

	$Body = $Query | ConvertTo-Json `
		-Depth 100 `
		-Compress `
		-ErrorAction Stop

	$Extension = (Invoke-RestMethod `
		-Method Post `
		-Uri $Uri `
		-ContentType application/json `
		-Body $Body `
		-ErrorAction Stop).results.extensions[0].versions[0]

	if (-not $Extension)
	{
		throw "Extension <$Name> not found"
	}

	return $Extension
}

$ReleaseExtension = Get-LocalExtension `
	-Path $Path

$LatestExtension = Get-MarketplaceExtension `
	-Name ("{0}.{1}" -f $ReleaseExtension.publisher, $ReleaseExtension.id) `
	-ApiVersion 6.1-preview.1

Write-Host ("Latest extension version: {0}" -f $LatestExtension.version)
Write-Host ("Release extension version: {0}" -f $ReleaseExtension.version)

if ($ReleaseExtension.version -le $LatestExtension.version)
{
	$ErrorMessage = "Extension version <$($ReleaseExtension.version)> cannot be released"

	if ($Required)
	{
		throw $ErrorMessage
	}
	else
	{
		Write-Warning $ErrorMessage
	}
}
