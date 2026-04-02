"""
飞书多维表格自动化脚本
用于复制指定日期的数据到新日期

使用方法:
1. 获取 user_access_token: https://open.feishu.cn/api-explorer 获取
2. 运行: python feishu_auto.py --token "你的user_access_token" --date-from "3/25" --date-to "3/26"
"""

import argparse
import requests
import json

# 飞书 API 配置
BASE_URL = "https://open.feishu.cn/open-apis"

# 你的文档信息
DOC_TOKEN = "S65QwGl3BiUjFekvznHc7XMcnOd"  # 测试文档
TABLE_TOKEN = "HrJ3seNEwhfVnLtCyQIcCSdknRb"  # 表格token

def get_table_records(token, user_token):
    """获取表格所有记录"""
    url = f"{BASE_URL}/bitable/v1/apps/{DOC_TOKEN}/tables/{TABLE_TOKEN}/records"
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    return response.json()

def create_record(token, user_token, fields):
    """创建新记录"""
    url = f"{BASE_URL}/bitable/v1/apps/{DOC_TOKEN}/tables/{TABLE_TOKEN}/records"
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    data = {"fields": fields}
    response = requests.post(url, headers=headers, json=data)
    return response.json()

def copy_row_by_date(user_token, date_from, date_to):
    """复制指定日期的行到新日期"""
    # 获取所有记录
    result = get_table_records(DOC_TOKEN, user_token)
    
    if "data" not in result:
        print(f"获取记录失败: {result}")
        return False
    
    records = result["data"].get("items", [])
    
    # 查找日期为 date_from 的行
    source_row = None
    for record in records:
        fields = record.get("fields", {})
        # 假设"时间"字段存储日期
        time_field = fields.get("时间", "")
        if date_from in str(time_field):
            source_row = fields
            print(f"找到源行 ({date_from}): {json.dumps(fields, ensure_ascii=False, indent=2)}")
            break
    
    if not source_row:
        print(f"未找到日期为 {date_from} 的行")
        print(f"当前记录的日期字段: {[r.get('fields', {}).get('时间', '') for r in records]}")
        return False
    
    # 修改日期字段为目标日期
    new_fields = source_row.copy()
    new_fields["时间"] = date_to
    
    # 创建新记录
    result = create_record(DOC_TOKEN, user_token, new_fields)
    print(f"创建新记录结果: {result}")
    
    if "data" in result:
        print(f"成功复制 {date_from} 的数据到 {date_to}")
        return True
    else:
        print(f"复制失败: {result}")
        return False

def main():
    parser = argparse.ArgumentParser(description="飞书多维表格自动化脚本")
    parser.add_argument("--token", required=True, help="user_access_token")
    parser.add_argument("--date-from", required=True, help="源日期，如 3/25")
    parser.add_argument("--date-to", required=True, help="目标日期，如 3/26")
    
    args = parser.parse_args()
    
    print(f"开始复制 {args.date_from} 的数据到 {args.date_to}...")
    success = copy_row_by_date(args.token, args.date_from, args.date_to)
    
    if success:
        print("操作完成!")
    else:
        print("操作失败，请检查参数")

if __name__ == "__main__":
    main()