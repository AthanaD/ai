import json
import re

def check_model_pricing(model_name):
    """
    根据模型名称判断定价规则
    返回格式: {"type": "tokens/times", "input": float, "output": float or None}
    """
    model_lower = model_name.lower()
    
    # ==================== 规则1: GPT系列 ====================
    if "gpt-5" in model_lower:
        return {"type": "tokens", "input": 37.5, "output": 2.5}
    
    if "gpt-4" in model_lower:
        return {"type": "times", "input": 0.25, "output": None}
    
    # ==================== 规则3: Claude系列 ====================
    
    # 3.1 claude-opus-5, claude-haiku-5, claude-sonnet-5, 
    #     claude-opus-4-6, claude-haiku-4-6, claude-sonnet-4-6
    if re.search(r'claude-(opus|haiku|sonnet)-5', model_lower) or \
       re.search(r'claude-(opus|haiku|sonnet)-4-6', model_lower) or \
       re.search(r'claude-(opus|haiku|sonnet)-4\.6', model_lower):
        return {"type": "tokens", "input": 37.5, "output": 4}
    
    # 3.2 claude-opus-4-5, claude-haiku-4-5, claude-sonnet-4-5
    if re.search(r'claude-(opus|haiku|sonnet)-4-5', model_lower) or \
       re.search(r'claude-(opus|haiku|sonnet)-4\.5', model_lower):
        return {"type": "tokens", "input": 37.5, "output": 3.5}
    
    # 3.3 claude-4.5 (必须在 claude-4- 之前检查)
    if "claude-4.5" in model_lower:
        return {"type": "times", "input": 8, "output": None}
    
    # 3.4 claude-4- 或 claude-4.1
    if "claude-4-" in model_lower or "claude-4.1" in model_lower:
        return {"type": "times", "input": 5, "output": None}
    
    # 3.5 claude-3.7 或 claude-3-7
    if "claude-3.7" in model_lower or "claude-3-7" in model_lower:
        return {"type": "tokens", "input": 37.5, "output": 1.5}
    
    # 3.6 claude-3
    if "claude-3" in model_lower:
        return {"type": "tokens", "input": 37.5, "output": 1}
    
    # 3.7 grok-4
    if "grok-4" in model_lower:
        return {"type": "tokens", "input": 37.5, "output": 1}
    
    # ==================== 规则2: Gemini系列 ====================
    
    if "gemini-2.5" in model_lower or "gemini-2-5" in model_lower:
        if "flash" in model_lower:
            return {"type": "tokens", "input": 37.5, "output": 1.5}
        else:
            return {"type": "tokens", "input": 37.5, "output": 2}
    
    if "gemini-3" in model_lower or "gemini 3" in model_lower:
        if "flash" in model_lower:
            return {"type": "tokens", "input": 37.5, "output": 1.5}
        else:
            return {"type": "tokens", "input": 37.5, "output": 2.5}
    
    # ==================== 规则4: O系列 ====================
    if re.search(r'\bo3-', model_lower) or model_lower == "o3" or \
       re.search(r'\bo4-', model_lower) or model_lower == "o4":
        return {"type": "tokens", "input": 37.5, "output": 2}
    
    # ==================== 规则5: 默认规则 ====================
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
    
    if pricing["type"] == "tokens" and pricing["output"] is not None:
        entry["output"] = pricing["output"]
    
    return entry

def main():
    # 读取模型列表文件
    try:
        with open('model.txt', 'r', encoding='utf-8') as f:
            models = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print("❌ 错误: 找不到 model.txt 文件！")
        return
    
    print(f"📂 从 model.txt 读取到 {len(models)} 个模型")
    
    # 生成所有模型的价格配置
    prices = []
    for model in models:
        entry = generate_price_entry(model)
        prices.append(entry)
    
    # 写入prices.json文件
    with open('prices.json', 'w', encoding='utf-8') as f:
        json.dump(prices, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功生成 {len(prices)} 个模型的价格配置！")
    print(f"💾 配置文件已保存为: prices.json")
    
    # 统计信息
    times_count = sum(1 for p in prices if p["type"] == "times")
    tokens_count = sum(1 for p in prices if p["type"] == "tokens")
    print(f"\n📊 统计: 按次收费 {times_count} 个, 按量收费 {tokens_count} 个")

if __name__ == "__main__":
    main()
