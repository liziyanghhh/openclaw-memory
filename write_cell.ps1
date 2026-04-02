$spreadsheetToken = "GOjmsTOcFhDSa2totIIcrl0bn5f"
$sheetId = "b12a4d"
$range = "b12a4d!A2:U2"
$values = '[["","","","","","","","","","","","","","","","","","","","",""]]'

& lark-cli sheets +write --spreadsheet-token $spreadsheetToken --sheet-id $sheetId --range $range --values $values
