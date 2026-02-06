import json
import re

def check_model_pricing(model_name):
    """
    根据模型名称判断定价规则
    返回格式: {"type": "tokens/times", "input": float, "output": float or None}
    """
    model_lower = model_name.lower()
    
    # 规则1: gpt-4 类型 - 按次收费 input=0.25
    if "gpt-4" in model_lower and "gpt-5" not in model_lower:
        return {"type": "times", "input": 0.25, "output": None}
    
    # 规则1: gpt-5 类型 - 按量收费 input=37.5, output=2.5
    if "gpt-5" in model_lower:
        return {"type": "tokens", "input": 37.5, "output": 2.5}
    
    # 规则2: gemini-2.5 类型
    if "gemini-2.5" in model_lower or "gemini-2-5" in model_lower:
        if "flash" in model_lower:
            return {"type": "tokens", "input": 37.5, "output": 1.5}
        else:
            return {"type": "tokens", "input": 37.5, "output": 2}
    
    # 规则2: gemini-3 类型
    if "gemini-3" in model_lower or "gemini 3" in model_lower:
        if "flash" in model_lower:
            return {"type": "tokens", "input": 37.5, "output": 1.5}
        else:
            return {"type": "tokens", "input": 37.5, "output": 2.5}
    
    # 规则3: claude-opus-5, claude-haiku-5, claude-sonnet-5
    if re.search(r'claude-(opus|haiku|sonnet)-5', model_lower):
        return {"type": "tokens", "input": 37.5, "output": 5}
    
    # 规则3: claude-opus-4-5, claude-haiku-4-5, claude-sonnet-4-5
    if re.search(r'claude-(opus|haiku|sonnet)-4-5', model_lower) or \
       re.search(r'claude-(opus|haiku|sonnet)-4\.5', model_lower):
        return {"type": "tokens", "input": 37.5, "output": 3.5}
    
    # 规则3: claude-4.5 类型 - 按次收费 input=8
    if "claude-4.5" in model_lower or "claude-4-5" in model_lower:
        return {"type": "times", "input": 8, "output": None}
    
    # 规则3: claude-4 类型 - 按次收费 input=5
    if "claude-4" in model_lower:
        return {"type": "times", "input": 5, "output": None}
    
    # 规则3: claude-3.7 或 claude-3-7 类型
    if "claude-3.7" in model_lower or "claude-3-7" in model_lower:
        return {"type": "tokens", "input": 37.5, "output": 1.5}
    
    # 规则3: claude-3 或 grok-4 类型
    if "claude-3" in model_lower or "grok-4" in model_lower:
        return {"type": "tokens", "input": 37.5, "output": 1}
    
    # 规则4: o3-, o4- (包括单独的o3或o4)
    if re.search(r'\bo3[-\s]', model_lower) or re.search(r'\bo3$', model_lower) or \
       re.search(r'\bo4[-\s]', model_lower) or re.search(r'\bo4$', model_lower):
        return {"type": "tokens", "input": 37.5, "output": 2}
    
    # 规则5: 其他所有模型 - 按次收费 input=0.15
    return {"type": "times", "input": 0.15, "output": None}

def generate_price_entry(model_name):
    """
    为单个模型生成价格配置条目
    """
    pricing = check_model_pricing(model_name)
    
    entry = {
        "model": model_name,
        "type": pricing["type"],
        "channel_type": 1,
        "input": pricing["input"]
    }
    
    # 如果是按量收费(tokens)，添加output字段
    if pricing["type"] == "tokens" and pricing["output"] is not None:
        entry["output"] = pricing["output"]
    
    return entry

def main():
    # 读取模型列表文件
    with open('model.txt', 'r', encoding='utf-8') as f:
        models = [line.strip() for line in f if line.strip()]
    
    # 生成所有模型的价格配置
    prices = []
    for model in models:
        entry = generate_price_entry(model)
        prices.append(entry)
    
    # 写入prices.json文件
    with open('prices.json', 'w', encoding='utf-8') as f:
        json.dump(prices, f, ensure_ascii=False, indent=2)
    
    print(f"成功生成 {len(prices)} 个模型的价格配置！")
    print(f"配置文件已保存为: prices.json")
    
    # 打印统计信息
    times_count = sum(1 for p in prices if p["type"] == "times")
    tokens_count = sum(1 for p in prices if p["type"] == "tokens")
    print(f"\n统计信息:")
    print(f"- 按次收费模型: {times_count}")
    print(f"- 按量收费模型: {tokens_count}")

if __name__ == "__main__":
    main()
