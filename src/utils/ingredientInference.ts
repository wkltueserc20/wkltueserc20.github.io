const INGREDIENT_DICT: string[] = [
  // 蔬菜
  '南瓜', '地瓜', '番薯', '紅蘿蔔', '胡蘿蔔', '馬鈴薯', '洋蔥', '菠菜', '花椰菜',
  '青花菜', '白花椰菜', '高麗菜', '包菜', '白菜', '娃娃菜', '萵苣', '生菜', '芹菜',
  '玉米', '豌豆', '四季豆', '敏豆', '毛豆', '秋葵', '茄子', '番茄', '西紅柿',
  '青椒', '彩椒', '甜椒', '蘆筍', '絲瓜', '冬瓜', '苦瓜', '黃瓜', '小黃瓜',
  '菇', '香菇', '金針菇', '木耳', '豆腐', '嫩豆腐', '板豆腐', '豆皮',
  // 水果
  '蘋果', '香蕉', '梨', '水梨', '芒果', '葡萄', '藍莓', '草莓', '桃子', '水蜜桃',
  '奇異果', '奇異', '哈密瓜', '西瓜', '木瓜', '鳳梨', '柳橙', '橘子', '柑橘',
  '檸檬', '百香果', '火龍果', '酪梨', '柿子', '李子',
  // 蛋白質 - 肉類
  '雞肉', '雞胸', '雞腿', '雞翅', '豬肉', '豬里肌', '豬排', '牛肉', '羊肉',
  '鴨肉', '火雞',
  // 蛋白質 - 海鮮
  '鮭魚', '鱈魚', '鯛魚', '吳郭魚', '虱目魚', '鯖魚', '鮪魚', '旗魚',
  '蝦', '蛤蜊', '牡蠣', '蛤', '文蛤', '花枝',
  // 蛋白質 - 蛋豆
  '雞蛋', '蛋黃', '蛋白', '水煮蛋',
  // 穀物
  '米', '白米', '糙米', '米糊', '稀飯', '粥', '米粥', '燕麥', '麥片', '小米',
  '玉米粉', '麵條', '烏龍麵', '冬粉', '麵包', '吐司',
  // 乳製品
  '優格', '起司', '乳酪',
];

// 由長到短排序，確保最長匹配優先
const SORTED_DICT = [...INGREDIENT_DICT].sort((a, b) => b.length - a.length);

const SUFFIXES = ['泥', '糊', '粥', '汁', '羹', '泡', '蒸', '醬', '泥泥'];

function stripSuffixes(label: string): string {
  let s = label;
  for (const suffix of SUFFIXES) {
    while (s.endsWith(suffix)) {
      s = s.slice(0, -suffix.length);
    }
  }
  return s;
}

export function inferIngredients(label: string): string[] {
  const stripped = stripSuffixes(label.trim());
  const results: string[] = [];
  let remaining = stripped;

  while (remaining.length > 0) {
    const match = SORTED_DICT.find(ingredient => remaining.startsWith(ingredient));
    if (match) {
      results.push(match);
      remaining = remaining.slice(match.length);
    } else {
      // 無法匹配，跳過一個字元繼續
      remaining = remaining.slice(1);
    }
  }

  return results;
}
