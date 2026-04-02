$body = Get-Content "C:\Users\liziy\clawd\values.json" -Raw
$cmd = "lark-cli api PUT /open-apis/sheets/v2/spreadsheets/GOjmsTOcFhDSa2totIIcrl0bn5f/values --body `"$body`""
Write-Host "Running: $cmd"
Invoke-Expression $cmd
