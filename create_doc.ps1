$token = "t-g1043paJRQE6LUJK6JN33KSJD7YO36JDON4MT6LT"

$body = @{
    "folder_token" = "xxx"
    "title" = "测试文档 " + (Get-Date -Format "yyyy-MM-dd HH:mm")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/document/v1/documents" `
        -Method Post -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $token" } -Body $body -ErrorAction Stop
    $response | ConvertTo-Json
} catch {
    Write-Host "错误: $($_.Exception.Message)"
    Write-Host "状态码: $($_.Exception.Response.StatusCode)"
}