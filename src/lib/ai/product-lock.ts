import type { ProductLock } from "./types";

// ============================================================
// 产品信息提取 — 确定性规则，不依赖 AI
// ============================================================

const PACKAGING_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /真空包装/, label: "真空包装" },
  { regex: /真空/, label: "真空包装" },
  { regex: /盒装/, label: "盒装" },
  { regex: /瓶装/, label: "瓶装" },
  { regex: /袋装/, label: "袋装" },
  { regex: /杯装/, label: "杯装" },
  { regex: /罐装/, label: "罐装" },
  { regex: /桶装/, label: "桶装" },
  { regex: /散装/, label: "散装" },
  { regex: /支装/, label: "支装" },
  { regex: /条装/, label: "条装" },
];

const FORM_PATTERNS: Array<{ regex: RegExp; label: ProductLock["productForm"] }> = [
  { regex: /牛奶|饮料|饮品|水|茶|酒|液|汁|汤|浆|汽水|可乐|雪碧|芬达|咖啡|奶茶/, label: "液体" },
  { regex: /鸡爪|面包|蛋糕|肉|菜|饭|面|虾|蟹|鱼|贝|零食|坚果|糖|巧克力|饼干|辣条|鸭脖|薯片/, label: "固体" },
  { regex: /粉|奶粉|咖啡粉|蛋白粉|面粉|淀粉/, label: "粉末" },
  { regex: /膏|酱|泥|馅|面霜|精华|防晒|口红/, label: "膏状" },
  { regex: /粒|丸|珠|胶囊|药/, label: "颗粒" },
];

/** 所有包装描述词（用于 enforcePackaging 暴力替换） */
const ALL_PACKAGING_LABELS = PACKAGING_PATTERNS.map(function(p) { return p.label; });

// ============================================================
// extractProductLock — 从用户输入中确定性地提取产品信息
// ============================================================
export function extractProductLock(inputText: string): ProductLock | null {
  if (!inputText || inputText.length < 2) return null;

  let packaging = "通用包装";
  for (const p of PACKAGING_PATTERNS) {
    if (p.regex.test(inputText)) { packaging = p.label; break; }
  }

  let productForm: ProductLock["productForm"] = "固体";
  for (const p of FORM_PATTERNS) {
    if (p.regex.test(inputText)) { productForm = p.label; break; }
  }

  return {
    productName: inputText.trim().substring(0, 50),
    packaging,
    productForm,
    scenarios: getProductScenarios(inputText),
    forbiddenScenarios: getForbiddenScenarios(inputText),
  };
}

// ============================================================
// enforcePackaging — 暴力替换文本中的错误包装词
// ============================================================
export function enforcePackaging(text: string, correctPackaging: string): string {
  if (!text || correctPackaging === "通用包装") return text;
  let result = text;
  for (const label of ALL_PACKAGING_LABELS) {
    if (label !== correctPackaging) {
      result = result.replace(new RegExp(label, "g"), correctPackaging);
    }
  }
  result = result.replace(/通用包装/g, correctPackaging);
  return result;
}

// ============================================================
// 场景推断 — 基于产品类型
// ============================================================
function getProductScenarios(productName: string): string[] {
  const name = (productName || "").toLowerCase();
  if (/汽水|可乐|雪碧|芬达|饮料|清凉|解渴|夏日饮品|夏日|解暑|冰镇/.test(name))
    return ["球场","网吧","烧烤摊","便利店","派对","路边摊","野餐","冰箱旁"];
  if (/啤酒|白酒|红酒|洋酒|鸡尾酒/.test(name))
    return ["朋友聚会","烧烤摊","酒吧","家里餐桌","看球","KTV"];
  if (/青蟹|螃蟹|大闸蟹|海鲜|龙虾|生蚝|扇贝/.test(name))
    return ['海鲜市场','家庭餐桌','餐厅','海边','大排档','夜宵摊','冰鲜柜台'];
  if (/鸡爪|鸭脖|辣条|薯片|坚果|零食|烤鸡爪|凤爪/.test(name))
    return ["追剧沙发","朋友聚会","下酒桌","看球","夜宵摊","办公室休息间"];
  if (/水蜜桃|桃子|苹果|橙子|葡萄|草莓|蓝莓|芒果|水果|生鲜/.test(name))
    return ['果园','家庭餐桌','水果店','野餐篮','冰箱旁','阳光午后','厨房水槽'];
  if (/牛奶|酸奶|豆浆|豆奶/.test(name))
    return ["早餐桌","冰箱旁","便利店","课间","睡前厨房"];
  if (/冲锋衣|登山|户外|帐篷|背包|睡袋/.test(name))
    return ["登山途中","露营地","雨雪天气","户外探险","山脊"];
  if (/护肤|面霜|精华|防晒|口红|化妆|面膜/.test(name))
    return ["浴室","梳妆台","卧室","出门前","海滩"];
  if (/方便面|泡面|速食|自热/.test(name))
    return ["宿舍","办公室加班","旅途","独居小窝","深夜"];
  if (/手机|耳机|电脑|键盘|鼠标|平板/.test(name))
    return ["办公室","咖啡厅","书桌","通勤路","图书馆"];
  if (/冲锋衣|登山|户外|帐篷|睡袋|背包|羽绒服|登山鞋/.test(name))
    return ['登山途中','露营地','雨雪天气','山脊','户外日出','徒步小径','帐篷内','篝火旁'];
  if (/衣服|裤子|裙子|鞋|T恤|外套|卫衣/.test(name))
    return ["街头","商场","咖啡厅","公园","地铁","校园"];
  return ["家中","户外","办公室","商场","餐厅"];
}

function getForbiddenScenarios(productName: string): string[] {
  const name = (productName || "").toLowerCase();
  if (/汽水|饮料|可乐|雪碧|芬达|矿泉水|果汁|奶茶|咖啡|冬瓜茶|凉茶|运动饮料/.test(name))
    return ["办公室","咖啡馆","走廊","仓库","楼梯间","会议室","图书馆","医院","教堂"];
  if (/鸡爪|零食|薯片|坚果|辣条|糖果|巧克力|饼干|烤鸡爪|凤爪|真空/.test(name))
    return ["会议室","图书馆","健身房","医院","教堂","卧室","床头","床"];
  if (/冲锋衣|登山|户外|帐篷|背包/.test(name))
    return ["办公室","咖啡馆","卧室","浴室","电梯"];
  if (/护肤|面霜|精华|防晒|口红|化妆/.test(name))
    return ["球场","网吧","工地","厨房"];
  return ["不适合该产品的场景"];
}

// ============================================================
// 场景过滤 — 根据室内/室外约束裁剪场景列表
// ============================================================
export function filterScenarios(scenarios: string[], locationType: string): string[] {
  if (locationType === "indoor") {
    return scenarios.filter(function(s) {
      return !/球场|野餐|登山|露营|户外|海滩|路边摊|烧烤摊|街头|山脊|雪|街道|公园/.test(s);
    });
  }
  if (locationType === "outdoor") {
    return scenarios.filter(function(s) {
      return /球场|街头|公园|天台|广场|路边|烧烤摊|操场|天桥/.test(s);
    });
  }
  if (locationType === "nature") {
    return ["户外自然环境","森林","山间","海边","草原"];
  }
  return scenarios;
}
