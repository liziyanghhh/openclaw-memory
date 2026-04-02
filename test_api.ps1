$token = "u-c9GiiRjMB72Vabh_LqEpdJ555Y4xg5WrXoayFA80y2Xn"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 之前成功获取的 obj_token
$objToken = "HrJ3seNEwhfVnLtCyQIcCSdknRb"

Write-Host "1. Trying with obj_token: $objToken"
$url = "https://open.feishu.cn/open-apis/bitable/v1/apps/$objToken/tables"
try {
    $resp = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    Write-Host "Tables: $($resp | ConvertTo-Json -Depth 5)"
} catch {
    Write-Host "Error: $_"
}

# 如果上面的 obj_token 不行，试试 XyjTsl2NlhFDXJtE0decOa0hn8d
Write-Host "`n2. Trying with XyjTsl2NlhFDXJtE0decOa0hn8d"
$objToken2 = "XyjTsl2NlhFDXJtE0decOa0hn8d"
$url2 = "https://open.feishu.cn/open-apis/bitable/v1/apps/$objToken2/tables"
try {
    $resp2 = Invoke-RestMethod -Uri $url2 -Method Get -Headers $headers
    Write-Host "Tables2: $($resp2 | ConvertTo-Json -Depth 5)"
} catch {
    Write-Host "Error2: $_"
}