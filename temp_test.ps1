$headers = @{'Content-Type'='application/json'; 'Authorization'='Bearer 907bf3007f94a46ec835c3c449b13273a6fbbf756c9792e0'}
$body = '{"tool":"read","action":"read","args":{"file_path":"C:/Users/liziy/clawd/test.txt"}}'
$response = Invoke-RestMethod -Uri 'http://127.0.0.1:18789/tools/invoke' -Method Post -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 10
