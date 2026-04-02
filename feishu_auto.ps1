param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$true)]
    [string]$DateFrom,
    
    [Parameter(Mandatory=$true)]
    [string]$DateTo
)

$BaseUrl = "https://open.feishu.cn/open-apis"
$NodeToken = "S65QwGl3BiUjFekvznHc7XMcnOd"

# 先获取节点信息
Write-Host "Getting node info..."
$nodeUrl = "$BaseUrl/wiki/v2/nodes/$NodeToken"
$nodeHeaders = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

try {
    $nodeResp = Invoke-RestMethod -Uri $nodeUrl -Method Get -Headers $nodeHeaders
    Write-Host "Node info: $($nodeResp | ConvertTo-Json)"
    $objToken = $nodeResp.data.node.obj_token
    $objType = $nodeResp.data.node.obj_type
    Write-Host "Object token: $objToken, Type: $objType"
} catch {
    Write-Host "Failed to get node: $_"
    exit 1
}

if ($objType -ne "sheet") {
    Write-Host "Not a sheet/bitable, cannot process"
    exit 1
}

# 获取多维表格记录
Write-Host "Getting records..."
$recordsUrl = "$BaseUrl/bitable/v1/apps/$objToken/tables/$objToken/records"
$recordsHeaders = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

try {
    $recordsResp = Invoke-RestMethod -Uri $recordsUrl -Method Get -Headers $recordsHeaders
    $records = $recordsResp.data.items
    Write-Host "Found $($records.Count) records"
} catch {
    Write-Host "Failed to get records: $_"
    exit 1
}

# 查找日期为 DateFrom 的行
$sourceRow = $null
foreach ($record in $records) {
    $fields = $record.fields
    $timeField = $fields["时间"]
    if ($timeField -like "*$DateFrom*") {
        $sourceRow = $fields
        Write-Host "Found source row ($DateFrom): $($fields | ConvertTo-Json)"
        break
    }
}

if (-not $sourceRow) {
    Write-Host "Could not find row with date $DateFrom"
    $dates = $records | ForEach-Object { $_.fields["时间"] }
    Write-Host "Available dates: $dates"
    exit 1
}

# 创建新记录
$newFields = @{}
foreach ($key in $sourceRow.Keys) {
    $newFields[$key] = $sourceRow[$key]
}
$newFields["时间"] = $DateTo

Write-Host "Creating new record for $DateTo..."
$createUrl = "$BaseUrl/bitable/v1/apps/$objToken/tables/$objToken/records"
$createBody = @{"fields" = $newFields} | ConvertTo-Json -Depth 10

try {
    $createResp = Invoke-RestMethod -Uri $createUrl -Method Post -Headers $recordsHeaders -Body $createBody
    if ($createResp.data) {
        Write-Host "Success! Copied $DateFrom data to $DateTo"
    } else {
        Write-Host "Failed: $($createResp | ConvertTo-Json)"
    }
} catch {
    Write-Host "Failed to create record: $_"
    exit 1
}