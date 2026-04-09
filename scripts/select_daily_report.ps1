# 小红书基础报表 → 选择「日报」视图
# 固化第4步操作
# 使用: powershell -File select_daily_report.ps1
# CDP: http://127.0.0.1:18800 (OpenClaw 固定端口)

param(
    [string]$CdpUrl = "http://127.0.0.1:18800"
)

$ErrorActionPreference = "Stop"

function Get-CdpWebSocket {
    param([string]$TargetUrl, [string]$PageId)
    
    $resp = Invoke-RestMethod "$TargetUrl/json" -TimeoutSec 5
    $page = $resp | Where-Object { $_.id -eq $PageId -or $_.url -match "xiaohongshu" } | Select-Object -First 1
    if (-not $page) {
        $page = $resp | Select-Object -First 1
    }
    if (-not $page) { throw "No CDP page found" }
    
    $wsUrl = $page.webSocketDebuggerUrl
    Write-Host "CDP WebSocket: $wsUrl"
    
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $ct = [Threading.CancellationToken]::None
    $ws.ConnectAsync($wsUrl, $ct).Wait()
    
    return $ws
}

function Send-Cdp {
    param($ws, [int]$id, [string]$method, [hashtable]$params)
    
    $payload = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
    $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()
}

function Recv-Cdp {
    param($ws, [int]$timeoutMs = 10000)
    $buf = [byte[]]::new(32768)
    $end = (Get-Date).AddMilliseconds($timeoutMs)
    $msg = ""
    
    while ((Get-Date) -lt $end -and $ws.State -eq 'Open') {
        $tok = $ct
        $remaining = ($end - (Get-Date)).TotalMilliseconds
        if ($remaining -le 0) { break }
        
        $recv = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $tok)
        if ($recv.Wait([int]$remaining) -and $recv.Result.Count -gt 0) {
            $msg += [Text.Encoding]::UTF8.GetString($recv.Result.Array, 0, $recv.Result.Count)
            if ($msg -match "`n") { break }
        }
    }
    
    # Return last complete JSON line
    $lines = $msg -split "`n" | Where-Object { $_ -match '\S' }
    return ($lines | Select-Object -Last 1) | ConvertFrom-Json
}

function Invoke-CdpCommand {
    param($ws, [string]$method, [hashtable]$params = @{}, [int]$timeoutMs = 10000)
    $script:cmdId++
    Send-Cdp -ws $ws -id $script:cmdId -method $method -params $params
    return Recv-Cdp -ws $ws -timeoutMs $timeoutMs
}

# ──────────────────────────────────────────
Write-Host "连接 CDP..."
$ws = Get-CdpWebSocket -TargetUrl $CdpUrl
$script:cmdId = 0

# 获取当前页面 ID
$resp = Invoke-RestMethod "$CdpUrl/json" -TimeoutSec 5
$currentPage = $resp | Where-Object { $_.url -match "datareports" } | Select-Object -First 1
if (-not $currentPage) {
    $currentPage = $resp | Select-Object -First 1
}
Write-Host "目标页面: $($currentPage.url)"

# 1. 在 DOM 中搜索「细分模式」→ 找到它右侧的 3-lines 图标按钮
Write-Host "查找「细分模式」按钮..."
$result = Invoke-CdpCommand -ws $ws -method "Runtime.evaluate" -params @{
    expression = @"
(() => {
    const subMode = Array.from(document.querySelectorAll('.d-text')).find(el => el.innerText === '细分模式');
    if (!subMode) return { found: false, reason: '细分模式 not found' };
    const select = subMode.closest('.d-select');
    if (!select) return { found: false, reason: 'no select parent' };
    const wrapper = select.parentElement;
    if (!wrapper) return { found: false, reason: 'no wrapper' };
    const row = wrapper.parentElement;
    if (!row) return { found: false, reason: 'no row' };
    const parent = row.parentElement;
    if (!parent) return { found: false, reason: 'no parent' };
    const children = Array.from(parent.children);
    const btns = children.filter(c => c.classList.contains('d-button') && c.getBoundingClientRect().width === 32);
    return {
        found: true,
        btnCount: btns.length,
        buttons: btns.map(b => ({
            x: Math.round(b.getBoundingClientRect().x),
            y: Math.round(b.getBoundingClientRect().y),
            w: Math.round(b.getBoundingClientRect().width),
            h: Math.round(b.getBoundingClientRect().height)
        }))
    };
})()
"@
}

$btnData = $result.result.result.value
if (-not $btnData.found) {
    Write-Host "❌ 未找到: $($btnData.reason)"
    $ws.CloseAsync('NormalClosure', '', $ct).Wait()
    exit 1
}

Write-Host "找到 $($btnData.btnCount) 个 32x32 按钮: $($btnData.buttons | ConvertTo-Json -Compress)"

# 找最右边的按钮（x 最大的那个 = 3-lines 图标）
$targetBtn = ($btnData.buttons | Sort-Object x -Descending | Select-Object -First 1)
$targetX = $targetBtn.x + 16
$targetY = $targetBtn.y + 16
Write-Host "3-lines 图标按钮中心: ($targetX, $targetY)"

# 2. 将鼠标移动到该位置
Write-Host "移动鼠标到按钮中心..."
Invoke-CdpCommand -ws $ws -method "Input.dispatchMouseEvent" -params @{
    type = "mouseMoved"
    x = $targetX
    y = $targetY
    button = "none"
    clickCount = 0
} | Out-Null

# 3. 保持 hover 3.5 秒
Write-Host "保持 hover 3.5 秒..."
Start-Sleep -Milliseconds 3500

# 4. 检查是否有 popup 出现
Write-Host "检查 popup..."
$popupResult = Invoke-CdpCommand -ws $ws -method "Runtime.evaluate" -params @{
    expression = @"
(() => {
    const drops = document.querySelectorAll('[class*="popup"], [class*="dropdown"], [class*="option-list"]');
    const visible = Array.from(drops).filter(el => {
        const s = window.getComputedStyle(el);
        return el.offsetParent !== null && s.display !== 'none' && s.visibility !== 'hidden';
    });
    return visible.map(el => ({
        text: el.innerText.substring(0, 100),
        cls: el.className.substring(0, 60)
    }));
})()
"@
}
$popups = $popupResult.result.result.value
Write-Host "找到 $($popups.Count) 个 popup"
foreach ($p in $popups) {
    Write-Host "  - $($p.cls): $($p.text)"
}

# 5. 在 popup 中找「日报」选项并点击
$dailyPopup = $popups | Where-Object { $_.text -match "日报" } | Select-Object -First 1
if (-not $dailyPopup) {
    Write-Host "❌ 未找到包含「日报」的 popup"
    $ws.CloseAsync('NormalClosure', '', $ct).Wait()
    exit 1
}

Write-Host "在 popup 中点击「日报」..."
$clickResult = Invoke-CdpCommand -ws $ws -method "Runtime.evaluate" -params @{
    expression = @"
(() => {
    const drops = document.querySelectorAll('[class*="popup"], [class*="dropdown"], [class*="option-list"]');
    const visible = Array.from(drops).filter(el => {
        const s = window.getComputedStyle(el);
        return el.offsetParent !== null && s.display !== 'none' && s.visibility !== 'hidden';
    });
    for (const popup of visible) {
        const divs = popup.querySelectorAll('div, span, li');
        for (const d of divs) {
            if (d.innerText.trim() === '日报') {
                d.click();
                return { clicked: true };
            }
        }
    }
    return { clicked: false };
})()
"@
}
$clicked = $clickResult.result.result.value
if (-not $clicked.clicked) {
    Write-Host "❌ 无法点击「日报」"
    $ws.CloseAsync('NormalClosure', '', $ct).Wait()
    exit 1
}

Write-Host "已点击「日报」！等待 3 秒..."
Start-Sleep -Seconds 3

# 6. 验证合计行
Write-Host "验证合计行..."
$hejiResult = Invoke-CdpCommand -ws $ws -method "Runtime.evaluate" -params @{
    expression = @"
(() => {
    const rows = document.querySelectorAll('table tr');
    const heji = Array.from(rows).find(r => r.innerText.trim().startsWith('合计'));
    return heji ? { found: true, text: heji.innerText.trim().substring(0, 200) } : { found: false };
})()
"@
}
$heji = $hejiResult.result.result.value
if ($heji.found) {
    Write-Host "✅ 日报视图激活！合计行: $($heji.text)"
} else {
    Write-Host "⚠️ 未找到合计行，请手动确认页面状态"
}

$ws.CloseAsync('NormalClosure', '', $ct).Wait()
Write-Host "脚本执行完毕。"
