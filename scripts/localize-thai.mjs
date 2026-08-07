import { readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const replacements = new Map([
  [
    "Here’s what’s happening in your kitchen today.",
    "มาดูกันว่าวันนี้มีอะไรเกิดขึ้นในครัวของคุณบ้าง",
  ],
  [
    "Uses {analyses[0]?.nearExpiry.length} ingredient",
    "ใช้วัตถุดิบใกล้หมดอายุ {analyses[0]?.nearExpiry.length} รายการ",
  ],
  ['{analyses[0]?.nearExpiry.length === 1 ? "" : "s"} expiring soon.', ""],
  [
    "`${Math.abs(d.daysRemaining)}d overdue`",
    "`เกินมา ${Math.abs(d.daysRemaining)} วัน`",
  ],
  ["Kitchen inventory", "คลังวัตถุดิบในครัว"],
  ["What’s in your fridge", "มีอะไรอยู่ในตู้เย็นของคุณ"],
  [
    "Track quantities and catch ingredients before they expire.",
    "ติดตามปริมาณและใช้วัตถุดิบให้ทันก่อนหมดอายุ",
  ],
  ["Add ingredient", "เพิ่มวัตถุดิบ"],
  ["Search inventory", "ค้นหาวัตถุดิบ"],
  ["Search ingredients...", "ค้นหาวัตถุดิบ..."],
  ["Filter by expiry status", "กรองตามสถานะวันหมดอายุ"],
  ["All expiry statuses", "สถานะวันหมดอายุทั้งหมด"],
  ["Filter by location", "กรองตามตำแหน่งจัดเก็บ"],
  ["All locations", "ทุกตำแหน่ง"],
  [">Expired<", ">หมดอายุแล้ว<"],
  [">Expires today<", ">หมดอายุวันนี้<"],
  [">Expiring soon<", ">ใกล้หมดอายุ<"],
  [">Fresh<", ">ยังสดใหม่<"],
  [">Refrigerator<", ">ตู้เย็น<"],
  [">Freezer<", ">ช่องแช่แข็ง<"],
  [">Pantry<", ">ตู้เก็บอาหาร<"],
  [">Ingredient<", ">วัตถุดิบ<"],
  [">Quantity<", ">ปริมาณ<"],
  [">Stored in<", ">เก็บไว้ใน<"],
  [">Expiry<", ">วันหมดอายุ<"],
  [">Status<", ">สถานะ<"],
  ["Actions", "การดำเนินการ"],
  ["Estimated date", "วันที่โดยประมาณ"],
  ["No ingredients found", "ไม่พบวัตถุดิบ"],
  [
    "Try changing your filters or add an ingredient.",
    "ลองเปลี่ยนตัวกรองหรือเพิ่มวัตถุดิบใหม่",
  ],
  ["Select ingredient", "เลือกวัตถุดิบ"],
  ["Ingredient *", "วัตถุดิบ *"],
  [">Quantity *<", ">ปริมาณ *<"],
  ["Unit *", "หน่วย *"],
  ["Storage location *", "ตำแหน่งจัดเก็บ *"],
  ["Added date *", "วันที่เพิ่ม *"],
  ["Expiry date", "วันหมดอายุ"],
  ["I don’t know—estimate it", "ไม่ทราบ ให้ระบบประมาณวันหมดอายุ"],
  ["Notes", "หมายเหตุ"],
  ["(optional)", "(ไม่บังคับ)"],
  [
    "Package opened, meal plan notes…",
    "เช่น เปิดบรรจุภัณฑ์แล้ว หรือหมายเหตุสำหรับวางแผนมื้ออาหาร",
  ],
  ["Estimate only:", "เป็นเพียงการประมาณ:"],
  [
    "This expiry date is an estimate only and does",
    "วันหมดอายุนี้เป็นเพียงค่าประมาณและ",
  ],
  ["not guarantee food safety.", "ไม่สามารถรับประกันความปลอดภัยของอาหารได้"],
  ["Saving…", "กำลังบันทึก..."],
  ["Save changes", "บันทึกการเปลี่ยนแปลง"],
  ["Add to inventory", "เพิ่มลงในคลังวัตถุดิบ"],
  [">Cancel<", ">ยกเลิก<"],
  ["Personalisation", "การตั้งค่าส่วนบุคคล"],
  ["Your food profile", "โปรไฟล์การรับประทานอาหาร"],
  [
    "We use these preferences only to filter unsafe or unsuitable recipe suggestions.",
    "เราใช้ข้อมูลเหล่านี้เพื่อคัดกรองสูตรอาหารที่ไม่ปลอดภัยหรือไม่เหมาะกับคุณ",
  ],
  ["About you", "ข้อมูลของคุณ"],
  ["Display name", "ชื่อที่แสดง"],
  ["Dietary preference", "รูปแบบการรับประทานอาหาร"],
  ["Health goal", "เป้าหมายด้านสุขภาพ"],
  ["Religious restriction", "ข้อจำกัดทางศาสนา"],
  ["Leave blank if none", "เว้นว่างหากไม่มี"],
  ["Allergies", "อาหารที่แพ้"],
  [
    "Recipes containing a selected allergen are excluded. This supports",
    "ระบบจะไม่แสดงสูตรที่มีสารก่อภูมิแพ้ที่คุณเลือก ข้อมูลนี้ช่วย",
  ],
  [
    "planning but does not account for cross-contamination.",
    "ในการวางแผนเท่านั้น และไม่ครอบคลุมการปนเปื้อนข้าม",
  ],
  ["Custom allergy", "อาหารที่แพ้อื่น ๆ"],
  ["e.g. Mustard", "เช่น มัสตาร์ด"],
  [">Add<", ">เพิ่ม<"],
  ["Save profile", "บันทึกโปรไฟล์"],
  ["Profile saved.", "บันทึกโปรไฟล์แล้ว"],
  ["Plan ahead", "วางแผนล่วงหน้า"],
  ["Shopping list", "รายการซื้อของ"],
  [
    "Missing recipe ingredients and manual reminders, together in one place.",
    "รวมวัตถุดิบที่ขาดและรายการที่คุณเพิ่มเองไว้ในที่เดียว",
  ],
  ["Clear completed", "ล้างรายการที่ซื้อแล้ว"],
  ["New shopping item", "รายการซื้อของใหม่"],
  ["Add milk, apples, rice…", "เพิ่มนม แอปเปิล ข้าว..."],
  ["Added from recipe", "เพิ่มจากสูตรอาหาร"],
  ["Manually added", "เพิ่มด้วยตนเอง"],
  ["Your list is clear", "รายการของคุณว่างอยู่"],
  [
    "Missing recipe ingredients can be added here.",
    "วัตถุดิบที่ขาดจากสูตรอาหารสามารถเพิ่มไว้ที่นี่",
  ],
  ["Your progress", "ความคืบหน้าของคุณ"],
  ["Cooking history", "ประวัติการทำอาหาร"],
  [
    "A transparent record of meals cooked and the inventory quantities deducted.",
    "บันทึกเมนูที่ปรุงและปริมาณวัตถุดิบที่ถูกหักออก",
  ],
  [">servings<", ">ที่เสิร์ฟ<"],
  ["No meals recorded yet", "ยังไม่มีประวัติการทำอาหาร"],
  ["Cook a recipe to see it here.", "เมื่อทำอาหารแล้ว รายการจะแสดงที่นี่"],
  ["Email address", "อีเมล"],
  [">Password<", ">รหัสผ่าน<"],
  ["At least 8 characters", "อย่างน้อย 8 ตัวอักษร"],
  ["Please wait…", "กรุณารอสักครู่..."],
  ["Create account", "สร้างบัญชี"],
  [">Sign in<", ">เข้าสู่ระบบ<"],
  [">or<", ">หรือ<"],
  ["Continue with demo data", "ใช้งานต่อด้วยข้อมูลสาธิต"],
  ["New to Smart Fridge?", "ยังไม่มีบัญชีใช่ไหม?"],
  ["Already have an account?", "มีบัญชีอยู่แล้วใช่ไหม?"],
  [
    "Supabase is not configured. Use Start demo to explore the application.",
    "ยังไม่ได้ตั้งค่า Supabase โปรดใช้โหมดสาธิตเพื่อทดลองแอป",
  ],
  [
    "Account created. Check your email to confirm it before signing in.",
    "สร้างบัญชีแล้ว โปรดตรวจสอบอีเมลเพื่อยืนยันก่อนเข้าสู่ระบบ",
  ],
  ["Recipe unavailable", "ไม่สามารถเปิดสูตรอาหารนี้ได้"],
  [
    "It may conflict with the active allergy or dietary profile.",
    "สูตรนี้อาจขัดกับข้อมูลการแพ้อาหารหรือรูปแบบอาหารของคุณ",
  ],
  ["Back to recipes", "กลับไปหน้าสูตรอาหาร"],
  ["recipe score", "คะแนนสูตรอาหาร"],
  ["ingredient match", "วัตถุดิบตรงกัน"],
  ["Expiry / 50", "วันหมดอายุ / 50"],
  ["Match / 30", "วัตถุดิบ / 30"],
  ["Preference / 20", "ความชอบ / 20"],
  [">Servings<", ">จำนวนที่เสิร์ฟ<"],
  ["Decrease servings", "ลดจำนวนที่เสิร์ฟ"],
  ["Increase servings", "เพิ่มจำนวนที่เสิร์ฟ"],
  ["I cooked this", "ฉันทำเมนูนี้แล้ว"],
  ["Add missing items", "เพิ่มวัตถุดิบที่ขาด"],
  [
    "Missing ingredients added to your shopping list.",
    "เพิ่มวัตถุดิบที่ขาดลงในรายการซื้อของแล้ว",
  ],
  [">Ingredients<", ">วัตถุดิบ<"],
  ["Use soon", "ควรใช้เร็ว ๆ นี้"],
  [">Optional<", ">ไม่บังคับ<"],
  [">Method<", ">วิธีทำ<"],
  ["Made for your fridge", "คัดสรรจากวัตถุดิบของคุณ"],
  ["Recipe recommendations", "สูตรอาหารแนะนำ"],
  ["Search recipes", "ค้นหาสูตรอาหาร"],
  ["Search suitable recipes...", "ค้นหาสูตรอาหารที่เหมาะกับคุณ..."],
  ["Quick actions", "เมนูลัด"],
  ["Recent activity", "กิจกรรมล่าสุด"],
  ["Use these first", "ควรใช้ก่อน"],
  ["Items closest to their expiry dates", "วัตถุดิบที่ใกล้ถึงวันหมดอายุที่สุด"],
  ["View all", "ดูทั้งหมด"],
  ["Top match", "สูตรที่ตรงที่สุด"],
  ["Overview", "ภาพรวม"],
]);

const demoDataReplacements = new Map([
  ["Halal chicken breast", "อกไก่ฮาลาล"],
  ["Chicken breast", "อกไก่"],
  ["Broccoli", "บรอกโคลี"],
  ["Carrot", "แครอท"],
  ["Mushroom", "เห็ด"],
  ["Eggs", "ไข่"],
  ["Tomato", "มะเขือเทศ"],
  ["Pasta", "พาสต้า"],
  ["Rice", "ข้าว"],
  ["Spinach", "ผักโขม"],
  ["Cheese", "ชีส"],
  ["Bread", "ขนมปัง"],
  ["Onion", "หอมหัวใหญ่"],
  ["Milk", "นม"],
  ["Peanut butter", "เนยถั่วลิสง"],
  ["Noodles", "เส้นก๋วยเตี๋ยว"],
  ["Soy sauce", "ซีอิ๊ว"],
  ["Cooking oil", "น้ำมันปรุงอาหาร"],
  ["Garlic", "กระเทียม"],
  ["Chicken & vegetable stir-fry", "ไก่ผัดผัก"],
  ["Mushroom omelette", "ไข่เจียวเห็ด"],
  ["Tomato pasta", "พาสต้าซอสมะเขือเทศ"],
  ["Vegetable fried rice", "ข้าวผัดผัก"],
  ["Spinach & cheese sandwich", "แซนด์วิชผักโขมและชีส"],
  ["Chicken rice bowl", "ข้าวหน้าไก่"],
  ["Silky carrot soup", "ซุปแครอทเนื้อเนียน"],
  ["Egg fried rice", "ข้าวผัดไข่"],
  ["Peanut noodle bowl", "ก๋วยเตี๋ยวซอสถั่วลิสง"],
  ["Halal chicken rice bowl", "ข้าวหน้าไก่ฮาลาล"],
  ["Halal tomato chicken pasta", "พาสต้าไก่ฮาลาลซอสมะเขือเทศ"],
  ["Halal egg vegetable rice", "ข้าวผัดไข่และผักฮาลาล"],
  [
    "A quick, colourful weeknight stir-fry that makes the most of crisp vegetables.",
    "เมนูผัดสีสันสดใส ทำง่าย เหมาะสำหรับใช้ผักสดในมื้อเร่งด่วน",
  ],
  [
    "Fluffy eggs folded around savoury mushrooms and greens.",
    "ไข่นุ่มฟูสอดไส้เห็ดและผักรสกลมกล่อม",
  ],
  [
    "Comforting pasta in a bright, garlicky tomato sauce.",
    "พาสต้าในซอสมะเขือเทศและกระเทียมหอม ๆ",
  ],
  [
    "A fast pantry-friendly bowl loaded with vegetables.",
    "ข้าวผัดผักทำง่ายจากวัตถุดิบที่มีติดครัว",
  ],
  [
    "A golden toasted sandwich with a fresh spinach centre.",
    "แซนด์วิชปิ้งสีทองสอดไส้ผักโขมและชีส",
  ],
  [
    "A balanced bowl with tender chicken and fresh vegetables.",
    "ข้าวหน้าไก่นุ่มและผักสดที่ให้สารอาหารสมดุล",
  ],
  [
    "A warming, naturally sweet soup with a smooth finish.",
    "ซุปอุ่น ๆ รสหวานธรรมชาติ เนื้อเนียนนุ่ม",
  ],
  [
    "A satisfying classic ready in under twenty minutes.",
    "เมนูคลาสสิกอิ่มอร่อย พร้อมในเวลาไม่ถึงยี่สิบนาที",
  ],
  [
    "Creamy, savoury noodles with crunchy vegetables.",
    "เส้นนุ่มคลุกซอสถั่วลิสงรสกลมกล่อมและผักกรุบกรอบ",
  ],
  [
    "A hearty rice bowl made with verified Halal chicken and crisp vegetables.",
    "ข้าวหน้าไก่ฮาลาลพร้อมผักกรุบกรอบ",
  ],
  [
    "Tomato and garlic pasta topped with lean, verified Halal chicken.",
    "พาสต้ามะเขือเทศและกระเทียม เสิร์ฟพร้อมไก่ฮาลาล",
  ],
  [
    "A quick Halal-friendly fried rice with eggs and colourful vegetables.",
    "ข้าวผัดไข่และผักสีสันสดใสที่เป็นมิตรกับอาหารฮาลาล",
  ],
  ["Slice the chicken and vegetables.", "หั่นไก่และผักเป็นชิ้นพอดีคำ"],
  ["Sear chicken in oil until cooked through.", "ผัดไก่ในน้ำมันจนสุกทั่ว"],
  [
    "Add vegetables and soy sauce; toss for 4 minutes.",
    "ใส่ผักและซีอิ๊ว ผัดต่อประมาณ 4 นาที",
  ],
  ["Serve immediately.", "เสิร์ฟทันที"],
  ["Slice and sauté mushrooms.", "หั่นและผัดเห็ดให้หอม"],
  ["Whisk eggs and pour into the pan.", "ตีไข่แล้วเทลงในกระทะ"],
  [
    "Add spinach, fold, and cook until just set.",
    "ใส่ผักโขม พับไข่ และทอดจนสุกพอดี",
  ],
  ["Boil pasta until al dente.", "ต้มพาสต้าจนสุกพอดี"],
  ["Cook garlic and tomato into a sauce.", "ผัดกระเทียมและมะเขือเทศจนเป็นซอส"],
  ["Toss together and season.", "คลุกทุกอย่างเข้าด้วยกันและปรุงรส"],
  ["Sauté vegetables.", "ผัดผักให้สุก"],
  ["Add cooked rice and soy sauce.", "ใส่ข้าวสุกและซีอิ๊ว"],
  ["Stir-fry on high heat for 3 minutes.", "ผัดด้วยไฟแรงประมาณ 3 นาที"],
]);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(path) : [path];
    }),
  );
  return nested.flat();
}

const root = resolve(import.meta.dirname, "..");
const files = (
  await Promise.all([
    filesUnder(join(root, "app")),
    filesUnder(join(root, "components")),
  ])
)
  .flat()
  .filter((file) => [".ts", ".tsx"].includes(extname(file)));

for (const file of files) {
  const original = await readFile(file, "utf8");
  let localized = original;
  for (const [english, thai] of replacements)
    localized = localized.replaceAll(english, thai);
  if (localized !== original) await writeFile(file, localized, "utf8");
}

const demoDataFile = join(root, "lib", "demo-data.ts");
const originalDemoData = await readFile(demoDataFile, "utf8");
let localizedDemoData = originalDemoData;
if (originalDemoData.includes('"Chicken breast"')) {
  for (const [english, thai] of demoDataReplacements)
    localizedDemoData = localizedDemoData.replaceAll(english, thai);
}
if (localizedDemoData !== originalDemoData)
  await writeFile(demoDataFile, localizedDemoData, "utf8");

console.log(`Localized ${files.length} application files to Thai`);
