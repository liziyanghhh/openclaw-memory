# 飞书 API 操作脚本
param(
    [ValidateSet("createDoc", "writeDoc")]
    [string]$Action,
    [string]$Token,
    [string]$DocToken,
    [string]$Content
)

$BaseUrl = "https://open.feishu.cn/open-apis"

# 1. 创建文档
function Create-Doc {
    if (-not $Token) { Write-Error "需要 Token"; return }
    
    $body = @{
        "node_type" = "doc"
        "title" = "数据同步 " + (Get-Date -Format "yyyy-MM-dd HH:mm")
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/drive/v1/files/files/create_from_template" `
        -Method Post -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $Token" } -Body $body
    
    if ($response.code -eq 0) {
        Write-Output $response.data.token
    } else {
        Write-Error "创建失败: $($response.msg)"
    }
}

# 2. 写入文档内容
function Write-DocContent {
    if (-not $Token -or -not $DocToken -or -not $Content) {
        Write-Error "需要 Token, DocToken, Content"
        return
    }
    
    # 先获取文档块信息
    $docInfo = Invoke-RestMethod -Uri "$BaseUrl/document/v1/documents/$DocToken" `
        -Headers @{ "Authorization" = "Bearer $Token" }
    
    # 获取第一个可插入的位置
    $blocks = $docInfo.data.document.blocks
    $insertBlockId = $blocks[0].block_id
    
    $body = @{
        "insert_block_id" = $insertBlockId
        "content" = @(
            @{
                "tag" = "text"
                "text" = $Content
            }
        )
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/document/v1/documents/$DocToken/blocks/append" `
        -Method Post -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $Token" } -Body $body
    
    if ($response.code -eq 0) {
        Write-Output "写入成功"
    } else {
        Write-Error "写入失败: $($response.msg)"
    }
}

# 执行
switch ($Action) {
    "createDoc" { Create-Doc }
    "writeDoc"  { Write-DocContent }
}