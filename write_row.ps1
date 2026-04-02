$body = @{
    valueRange = @{
        range = "b12a4d!A28:U28"
        values = @(
            @(46107.1, 1861.15, 19785, 556, 0.0281, 3.35, 94.07, 37, 1, 20, 12, 103, 18.07, 68, 27.37, 40, 46.53, 74, 7, 265.88, $null)
        )
    }
} | ConvertTo-Json -Compress

$cmd = "lark-cli api PUT /open-apis/sheets/v2/spreadsheets/GOjmsTOcFhDSa2totIIcrl0bn5f/values --body '$body'"
Invoke-Expression $cmd
