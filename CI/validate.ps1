[CmdletBinding()]
Param
(
	[Parameter(Mandatory=$True)]
	[String]$Path,

	[Parameter(Mandatory=$False)]
	[Switch]$Required,

	[Parameter(Mandatory=$False)]
	[Switch]$UpdateBuildNumber
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

function Confirm-ExtensionVersion
{
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[Object]$Release,

		[Parameter(Mandatory=$True)]
		[Object]$Latest
	)

	Write-Host ("Release extension version: {0}" -f $Release.version)
	Write-Host ("Latest extension version: {0}" -f $Latest.version)

	if ($Release.version -le $Latest.version)
	{
		$ErrorMessage = "Extension version <$($Release.version)> cannot be released"

		if ($Required)
		{
			throw $ErrorMessage
		}
		else
		{
			Write-Warning $ErrorMessage
		}
	}
}

$ReleaseExtension = Get-LocalExtension `
	-Path $Path

$LatestExtension = Get-MarketplaceExtension `
	-Name ("{0}.{1}" -f $ReleaseExtension.publisher, $ReleaseExtension.id) `
	-ApiVersion 6.1-preview.1

Confirm-ExtensionVersion `
	-Release $ReleaseExtension `
	-Latest $LatestExtension `
	-Required:$Required

if ($UpdateBuildNumber)
{
	Write-Host ("##vso[build.updatebuildnumber]{0}-{1}" -f $Env:BUILD_BUILDNUMBER, $ReleaseExtension.version)
}
