[CmdletBinding()]
Param
(
	[Parameter(Mandatory=$True)]
	[String]$Path,

	[Parameter(Mandatory=$True)]
	[Int]$Patch,

	[Parameter(Mandatory=$False)]
	[Switch]$UpdateBuildNumber
)

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

function Find-ExtensionPath
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

	$ExtensionJsonPath = Get-ChildItem `
		-Path $Path `
		-Filter vss-extension.json `
		-File `
		-ErrorAction Stop | Select-Object -First 1

	if (-not (Test-Path -Path $ExtensionJsonPath))
	{
		throw "File <$ExtensionJsonPath> not found"
	}

	return $ExtensionJsonPath
}

function Update-ExtensionVersion
{
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[String]$Path,

		[Parameter(Mandatory=$True)]
		[Int]$Patch
	)

	if (-not (Test-Path -Path $Path))
	{
		throw "File <$Path> not found"
	}

	$ExtensionDefinition = Get-Content `
		-Path $Path `
		-ErrorAction Stop | ConvertFrom-Json `
			-Depth 100 `
			-ErrorAction Stop

	# Update version
	$ExtensionDefinition = Set-ExtensionVersion `
		-Definition $ExtensionDefinition `
		-Patch $Patch

	# Update JSON file
	$ExtensionDefinition | ConvertTo-Json `
		-Depth 100 `
		-ErrorAction Stop | Set-Content `
			-Path $Path `
			-Force `
			-ErrorAction Stop

	$TaskContributions = $ExtensionDefinition.contributions | `
		Where-Object { $_.type -eq "ms.vss-distributed-task.task" }

	ForEach ($Contribution in $TaskContributions)
	{
		$Tasks = Get-ChildItem `
			-Path $Contribution.properties.name `
			-Directory `
			-ErrorAction Stop

		ForEach ($Task in $Tasks)
		{
			$TaskPath = Join-Path `
				-Path $Task.FullName `
				-ChildPath task.json

			if (-not (Test-Path -Path $TaskPath))
			{
				throw "File <$TaskPath> not found"
			}

			$TaskDefinition = Get-Content `
				-Path $TaskPath `
				-ErrorAction Stop | ConvertFrom-Json `
					-Depth 100 `
					-ErrorAction Stop

			# Update version
			$TaskDefinition = Set-TaskVersion `
				-Definition $TaskDefinition `
				-Patch $Patch

			# Update JSON file
			$TaskDefinition | ConvertTo-Json `
				-Depth 100 `
				-ErrorAction Stop | Set-Content `
					-Path $TaskPath `
					-Force `
					-ErrorAction Stop

		}
	}

	return $ExtensionDefinition
}

function Confirm-ExtensionVersion
{
	[Diagnostics.CodeAnalysis.SuppressMessageAttribute("PSAvoidUsingWriteHost", "")]
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[Object]$Release,

		[Parameter(Mandatory=$True)]
		[Object]$Latest,

		[Parameter(Mandatory=$False)]
		[Switch]$Required
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

function Set-ExtensionVersion
{
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[Object]$Definition,

		[Parameter(Mandatory=$True)]
		[Int]$Patch
	)

	$OldVersion = [Version]$Definition.Version
	$NewVersion = "{0}.{1}.{2}" -f $OldVersion.Major, $OldVersion.Minor, $Patch

	$Definition.Version = $NewVersion.ToString()

	return $Definition
}

function Set-TaskVersion
{
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[Object]$Definition,

		[Parameter(Mandatory=$True)]
		[Int]$Patch
	)

	$Definition.Version.Patch = $Patch

	return $Definition
}

function Set-BuildNumber
{
	[Diagnostics.CodeAnalysis.SuppressMessageAttribute("PSAvoidUsingWriteHost", "")]
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[String]$Value
	)

	Write-Host ("##vso[build.updatebuildnumber]{0}" -f $Value)
}

$ExtensionPath = Find-ExtensionPath `
	-Path $Path

$ReleaseExtension = Update-ExtensionVersion `
	-Path $ExtensionPath `
	-Patch $Patch

$LatestExtension = Get-MarketplaceExtension `
	-Name ("{0}.{1}" -f $ReleaseExtension.publisher, $ReleaseExtension.id) `
	-ApiVersion 6.1-preview.1

Confirm-ExtensionVersion `
	-Release $ReleaseExtension `
	-Latest $LatestExtension `
	-Required

if ($UpdateBuildNumber)
{
	if (-not $Env:BUILD_BUILDNUMBER)
	{
		throw "Variable <BUILD_BUILDNUMBER> not found"
	}

	Set-BuildNumber `
		-Value ("{0}-{1}" -f $ReleaseExtension.version, $Env:BUILD_BUILDNUMBER)
}
