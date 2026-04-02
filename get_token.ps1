$body = @{
    app_id = "cli_a949f94b0ffa9bc2"
    app_secret = "AL22hFMXmxOnsL6kxq68ygvfv37d1EVW"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" -Method Post -ContentType "application/json" -Body $body
$response | ConvertTo-Json