export const FOOD_DB: Record<string, { kcal: number; def: number }> = {
  "米饭": { kcal: 130, def: 195 }, "面条": { kcal: 110, def: 330 }, "馒头": { kcal: 220, def: 110 },
  "包子": { kcal: 230, def: 230 }, "饺子": { kcal: 230, def: 23 }, "面包": { kcal: 280, def: 80 },
  "全麦面包": { kcal: 250, def: 75 }, "玉米": { kcal: 110, def: 120 }, "红薯": { kcal: 100, def: 150 },
  "土豆": { kcal: 80, def: 130 }, "燕麦": { kcal: 370, def: 150 }, "鸡蛋": { kcal: 145, def: 75 },
  "鸡胸肉": { kcal: 133, def: 133 }, "牛肉": { kcal: 250, def: 250 }, "猪肉": { kcal: 400, def: 200 },
  "鱼肉": { kcal: 150, def: 150 }, "虾": { kcal: 90, def: 90 }, "虾仁": { kcal: 90, def: 90 },
  "豆腐": { kcal: 80, def: 80 }, "牛奶": { kcal: 65, def: 130 }, "酸奶": { kcal: 70, def: 100 },
  "豆浆": { kcal: 30, def: 60 }, "美式": { kcal: 2, def: 5 }, "咖啡": { kcal: 2, def: 5 },
  "拿铁": { kcal: 40, def: 60 }, "苹果": { kcal: 52, def: 80 }, "香蕉": { kcal: 90, def: 90 },
  "橙子": { kcal: 47, def: 70 }, "西红柿": { kcal: 20, def: 25 }, "黄瓜": { kcal: 15, def: 25 },
  "西兰花": { kcal: 35, def: 35 }, "菠菜": { kcal: 25, def: 25 }, "白菜": { kcal: 15, def: 20 },
  "生菜": { kcal: 15, def: 15 }, "萝卜": { kcal: 20, def: 25 }, "青椒": { kcal: 20, def: 25 },
  "豆芽": { kcal: 20, def: 20 }, "芹菜": { kcal: 15, def: 20 }, "韭菜": { kcal: 25, def: 30 },
  "茄子": { kcal: 25, def: 40 }, "冬瓜": { kcal: 12, def: 15 }, "南瓜": { kcal: 25, def: 40 },
  "香菇": { kcal: 30, def: 30 }, "蘑菇": { kcal: 25, def: 25 }, "花生": { kcal: 570, def: 60 },
  "饼干": { kcal: 450, def: 50 }, "蛋糕": { kcal: 350, def: 250 }, "巧克力": { kcal: 550, def: 150 },
  "可乐": { kcal: 45, def: 100 }, "奶茶": { kcal: 250, def: 350 }, "果汁": { kcal: 50, def: 120 },
  "披萨": { kcal: 270, def: 280 }, "汉堡": { kcal: 250, def: 500 }, "薯条": { kcal: 310, def: 300 },
  "炒饭": { kcal: 180, def: 360 }, "炒面": { kcal: 160, def: 320 }, "粥": { kcal: 45, def: 90 },
  "沙拉": { kcal: 80, def: 150 }, "山药": { kcal: 55, def: 80 }, "芋头": { kcal: 80, def: 100 },
  "菱角": { kcal: 100, def: 50 }, "毛豆": { kcal: 130, def: 65 }, "豌豆": { kcal: 110, def: 55 },
  "芦笋": { kcal: 20, def: 20 }, "西瓜": { kcal: 30, def: 60 }, "葡萄": { kcal: 70, def: 70 },
  "草莓": { kcal: 30, def: 35 }, "蓝莓": { kcal: 55, def: 55 }, "桃子": { kcal: 40, def: 70 },
  "梨": { kcal: 50, def: 80 }, "柚子": { kcal: 40, def: 100 }, "火龙果": { kcal: 55, def: 110 },
  "猕猴桃": { kcal: 60, def: 40 }, "芒果": { kcal: 60, def: 100 }, "菠萝": { kcal: 45, def: 60 },
}

export interface FoodItem {
  name: string
  portion: string
  kcal: number
}

export function analyzeFoodText(text: string): { items: FoodItem[]; total: number } {
  const lines = text.split(/[，,、;；\n]/).map(s => s.trim()).filter(Boolean)
  const items: FoodItem[] = []
  let total = 0

  lines.forEach(line => {
    let matched = false
    for (const [key, val] of Object.entries(FOOD_DB)) {
      if (line.includes(key)) {
        let p = val.def
        const q = line.match(/(\d+(?:\.\d+)?)\s*(个|碗|杯|片|根|块|份|把|包)/)
        const h = line.match(/半\s*(个|碗|杯|片|根|块|份)/)
        if (q) p = Math.round(val.def * parseFloat(q[1]))
        else if (h) p = Math.round(val.def * 0.5)
        items.push({ name: key, portion: line, kcal: p })
        total += p
        matched = true
        break
      }
    }
    if (!matched) {
      items.push({ name: line, portion: '估算', kcal: 80 })
      total += 80
    }
  })

  return { items, total }
}
