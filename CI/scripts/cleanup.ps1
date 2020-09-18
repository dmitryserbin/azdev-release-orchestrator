[CmdletBinding()]
Param
(
	[Parameter(Mandatory=$True)]
	[String]$OrganizationName,

	[Parameter(Mandatory=$True)]
	[String]$ProjectName,

	[Parameter(Mandatory=$True)]
	[String]$DefinitionName,

	[Parameter(Mandatory=$False)]
	[String]$AccessToken = $Env:SYSTEM_ACCESSTOKEN,

	[Parameter(Mandatory=$False)]
	[ValidateSet("Basic", "Bearer")]
	[String]$TokenType = "Bearer"
)

function Get-Releases
{
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[String]$OrganizationName,

		[Parameter(Mandatory=$True)]
		[String]$ProjectName,

		[Parameter(Mandatory=$True)]
		[String]$DefinitionName,

		[Parameter(Mandatory=$True)]
		[String]$AccessToken,

		[Parameter(Mandatory=$False)]
		[ValidateSet("Basic", "Bearer")]
		[String]$TokenType,

		[Parameter(Mandatory=$True)]
		[String]$ApiVersion
	)

	$Uri = ('https://vsrm.dev.azure.com/{0}/{1}/_apis/release/releases?definitionId={2}&$top=1000&api-version={3}' `
		-f $OrganizationName, $ProjectName, $DefinitionName, $ApiVersion)

	$Headers = @{
		Authorization = ("{0} {1}" -f $TokenType, $AccessToken)
	}

	$Result = Invoke-RestMethod `
		-Method Get `
		-Uri $Uri `
		-ContentType application/json `
		-Headers $Headers `
		-ErrorAction Stop

	$Releases = $Result.value | `
		Where-Object { -not $_.keepForever }

	return $Releases
}

function Remove-Release
{
	[Diagnostics.CodeAnalysis.SuppressMessageAttribute("PSAvoidUsingWriteHost", "")]
	[CmdletBinding()]
	Param
	(
		[Parameter(Mandatory=$True)]
		[Object]$Release,

		[Parameter(Mandatory=$True)]
		[String]$Comment,

		[Parameter(Mandatory=$True)]
		[String]$AccessToken,

		[Parameter(Mandatory=$False)]
		[ValidateSet("Basic", "Bearer")]
		[String]$TokenType,

		[Parameter(Mandatory=$True)]
		[String]$ApiVersion
	)

	Write-Host "Removing <$($Release.releaseDefinition.name)> definition <$($Release.name)> ($($Release.id)) release"

	$Uri = ('{0}?comment={1}&api-version={2}' `
		-f $Release.url, $Comment, $ApiVersion)

	$Headers = @{
		Authorization = ("{0} {1}" -f $TokenType, $AccessToken)
	}

	$Result = Invoke-RestMethod `
		-Method Delete `
		-Uri $Uri `
		-ContentType application/json `
		-Headers $Headers `
		-SkipHttpErrorCheck

	return $Result
}

$Releases = Get-Releases `
	-OrganizationName $OrganizationName `
	-ProjectName $ProjectName `
	-DefinitionName $DefinitionName `
	-AccessToken $AccessToken `
	-TokenType $TokenType `
	-ApiVersion 6.0

ForEach ($Release in $Releases)
{
	$Result = Remove-Release `
		-Release $Release `
		-Comment "Deleted by Orchestrator CI cleanup" `
		-AccessToken $AccessToken `
		-TokenType $TokenType `
		-ApiVersion 6.0

	if ($Result.message)
	{
		Write-Warning $Result.message
	}
}
