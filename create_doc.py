import requests
import json

token = "t-g1043paJRQE6LUJK6JN33KSJD7YO36JDON4MT6LT"

url = "https://open.feishu.cn/open-apis/document/v1/documents"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
data = {"title": "测试文档"}

response = requests.post(url, headers=headers, json=data)
print(response.status_code)
print(response.text)