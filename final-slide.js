const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
const PGW = 13.33, PGH = 7.5;

// ---------- Theme ----------
const FONT = "Phetsarath OT";
const C = {
  dark: "173B2C",       // deep forest green
  dark2: "0E2A1F",      // darker shade
  gold: "C69A3A",       // gold accent
  goldLight: "E7CA84",
  cream: "F5F1E6",
  white: "FFFFFF",
  text: "1F2A24",        // body text on light bg
  textMuted: "5C685F",
  card: "F1EEE3",
  cardGreen: "EAF0EB",
  line: "D9D2BE",
};

pres.defineSlideMaster({
  title: "BLANK",
  background: { color: C.white },
});

// ---------- Helpers ----------
function addBg(slide, color) {
  slide.background = { color };
}

function kickerTitle(slide, kicker, title, opts = {}) {
  const y = opts.y !== undefined ? opts.y : 0.5;
  slide.addText(kicker.toUpperCase(), {
    x: 0.6, y, w: 11.5, h: 0.35,
    fontFace: FONT, fontSize: 13, color: C.gold, bold: true,
    charSpacing: 2, align: "left",
  });
  slide.addText(title, {
    x: 0.6, y: y + 0.32, w: 11.8, h: 0.7,
    fontFace: FONT, fontSize: 28, color: C.dark, bold: true, align: "left",
  });
}

function pageNum(slide, n) {
  slide.addText(String(n).padStart(2, "0"), {
    x: PGW - 0.9, y: PGH - 0.5, w: 0.6, h: 0.3,
    fontFace: FONT, fontSize: 10, color: C.textMuted, align: "right",
  });
  slide.addText("TonNam RMS · ບົດທີ 4-5", {
    x: 0.6, y: PGH - 0.5, w: 4, h: 0.3,
    fontFace: FONT, fontSize: 10, color: C.textMuted, align: "left",
  });
}

function bulletList(slide, items, opts) {
  const paras = items.map((t, i) => ({
    text: t,
    options: {
      bullet: { code: "25CF", color: C.gold, indent: 18 },
      color: C.text, fontSize: opts.fontSize || 14, fontFace: FONT,
      breakLine: true, paraSpaceAfter: opts.spaceAfter || 12,
      lineSpacingMultiple: 1.15,
    },
  }));
  slide.addText(paras, {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    valign: "top", align: "left",
  });
}

function imageCard(slide, path, ratio, x, y, boxW, boxH, opts = {}) {
  slide.addShape("roundRect", {
    x: x - 0.12, y: y - 0.12, w: boxW + 0.24, h: boxH + 0.24,
    rectRadius: 0.08, fill: { color: C.card },
    line: { color: C.line, width: 1 },
    shadow: { type: "outer", color: "5C685F", opacity: 0.35, blur: 10, offset: 3, angle: 90 },
  });
  slide.addText("ภาพไม่พร้อม", {
    x: x, y: y + boxH / 2 - 0.2, w: boxW, h: 0.4,
    fontFace: FONT, fontSize: 16, color: C.textMuted, bold: true, align: "center",
  });
}

function sectionDivider(num, laoTitle, subtitle) {
  const s = pres.addSlide();
  addBg(s, C.dark);
  s.addText(num, {
    x: 8.6, y: 0.4, w: 4.5, h: 6.6,
    fontFace: FONT, fontSize: 260, color: C.dark2, bold: true, align: "right",
    fontFace: "Arial",
  });
  s.addText(`ບົດທີ ${num}`, {
    x: 0.9, y: 2.55, w: 8, h: 0.5,
    fontFace: FONT, fontSize: 16, color: C.gold, bold: true, charSpacing: 3,
  });
  s.addText(laoTitle, {
    x: 0.9, y: 3.0, w: 9.5, h: 1.6,
    fontFace: FONT, fontSize: 42, color: C.white, bold: true,
  });
  s.addShape("rect", { x: 0.95, y: 4.55, w: 0.9, h: 0.045, fill: { color: C.gold } });
  s.addText(subtitle, {
    x: 0.9, y: 4.75, w: 8.6, h: 0.9,
    fontFace: FONT, fontSize: 16, color: C.goldLight, align: "left",
  });
  return s;
}

// ================= SLIDE 1: TITLE =================
{
  const s = pres.addSlide();
  addBg(s, C.dark);
  s.addShape("ellipse", { x: 9.6, y: -2.6, w: 6.5, h: 6.5, fill: { color: C.dark2 }, line: { type: "none" } });
  s.addShape("ellipse", { x: 10.6, y: 4.6, w: 4.2, h: 4.2, fill: { color: C.dark2 }, line: { type: "none" } });

  s.addText("TONNAM RESTAURANT MANAGEMENT SYSTEM", {
    x: 0.9, y: 1.5, w: 10.5, h: 0.4,
    fontFace: FONT, fontSize: 14, color: C.gold, bold: true, charSpacing: 3,
  });
  s.addText("ລະບົບຈັດການຮ້ານອາຫານ ຕົ້ນນ້ຳ", {
    x: 0.9, y: 2.0, w: 10.8, h: 1.3,
    fontFace: FONT, fontSize: 46, color: C.white, bold: true,
  });
  s.addShape("rect", { x: 0.95, y: 3.35, w: 1.1, h: 0.05, fill: { color: C.gold } });
  s.addText("ຜົນການດຳເນີນໂຄງການ ແລະ ບົດສະຫຼຸບ  ·  ບົດທີ 4 - 5", {
    x: 0.9, y: 3.55, w: 10.5, h: 0.6,
    fontFace: FONT, fontSize: 20, color: C.goldLight,
  });

  s.addText([
    { text: "ສະເໜີໂດຍ:  ", options: { color: C.textMuted, bold: true } },
    { text: "Vongsouvan Chanthasone (NQ22403021)   ·   Xap sa Van Thongvisai (NQ22403001)", options: { color: C.cream } },
  ], {
    x: 0.9, y: 5.35, w: 11, h: 0.4, fontFace: FONT, fontSize: 13,
  });
  s.addText("ມະຫາວິທະຍາໄລສະຫວັນນະເຂດ  ·  ຄະນະເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ  ·  ພາກວິຊາເຕັກໂນໂລຊີຄອມພິວເຕີ  ·  ສົກຮຽນ 2025-2026", {
    x: 0.9, y: 5.75, w: 11.2, h: 0.4, fontFace: FONT, fontSize: 12, color: C.textMuted,
  });
}

// ================= SLIDE 2: AGENDA =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "ພາບລວມການນຳສະເໜີ", "ຫົວຂໍ້ນຳສະເໜີ");

  const agenda = [
    { n: "4", t: "ຜົນການດຳເນີນໂຄງການ", d: "ໜ້າຈໍລະບົບ (Waiter · Kitchen · POS · Admin) ແລະ ຜົນການປະເມີນຄວາມພໍໃຈຜູ້ໃຊ້" },
    { n: "5", t: "ບົດສະຫຼຸບ ແລະ ຂໍ້ສະເໜີແນະ", d: "ສະຫຼຸບຜົນການດຳເນີນໂຄງການ, ຈຸດເດັ່ນ-ຈຸດອ່ອນ ແລະ ຂໍ້ສະເໜີແນະສຳລັບການພັດທະນາຕໍ່" },
  ];
  let y = 2.0;
  agenda.forEach((a) => {
    s.addShape("roundRect", { x: 0.6, y, w: 11.9, h: 2.05, rectRadius: 0.1, fill: { color: C.cardGreen }, line: { color: C.line, width: 0.75 } });
    s.addShape("ellipse", { x: 1.0, y: y + 0.55, w: 0.95, h: 0.95, fill: { color: C.dark }, line: { type: "none" } });
    s.addText(a.n, { x: 1.0, y: y + 0.55, w: 0.95, h: 0.95, fontFace: FONT, fontSize: 30, bold: true, color: C.gold, align: "center", valign: "middle" });
    s.addText(`ບົດທີ ${a.n}   ${a.t}`, { x: 2.35, y: y + 0.32, w: 9.7, h: 0.55, fontFace: FONT, fontSize: 22, bold: true, color: C.dark });
    s.addText(a.d, { x: 2.35, y: y + 0.95, w: 9.7, h: 0.9, fontFace: FONT, fontSize: 14, color: C.textMuted, lineSpacingMultiple: 1.2 });
    y += 2.35;
  });
  pageNum(s, 2);
}

// ================= SLIDE 3: SECTION DIVIDER - CH 4 =================
sectionDivider("4", "ຜົນການດຳເນີນໂຄງການ", "ຜົນການອອກແບບ ແລະ ພັດທະນາລະບົບ ພ້ອມຜົນການປະເມີນຄວາມພໍໃຈຂອງຜູ້ໃຊ້");

// ================= SLIDE 4: 4.1 OVERVIEW OF 4 SUBSYSTEMS =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.1  ພາບລວມລະບົບ", "4 ລະບົບຍ່ອຍ ທີ່ເຊື່ອມຕໍ່ກັນແບບ Real-time");

  const cards = [
    { t: "Waiter", lao: "ພະນັກງານເສີບ", d: "ເບິ່ງສະຖານະໂຕະ, ສັ່ງອາຫານ, ຈັດການບິນ" },
    { t: "Kitchen", lao: "ຄົວ", d: "ຮັບອໍເດີໃໝ່ທັນທີ, ອັບເດດສະຖານະການເຮັດອາຫານ" },
    { t: "POS", lao: "ຈຸດຂາຍໜ້າຮ້ານ", d: "ຄິດໄລ່ບິນ, ຮັບຊຳລະ, ຈັດການເມນູ-ໂຕະ" },
    { t: "Admin", lao: "ຜູ້ບໍລິຫານ", d: "Dashboard, ວິເຄາະຂໍ້ມູນ, Audit Log, ຈັດການຜູ້ໃຊ້" },
  ];
  const cw = 2.82, gap = 0.25, x0 = 0.6, y0 = 2.15, ch = 3.9;
  cards.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    s.addShape("roundRect", {
      x, y: y0, w: cw, h: ch, rectRadius: 0.12, fill: { color: i % 2 === 0 ? C.dark : C.cardGreen }, line: { type: "none" },
      shadow: { type: "outer", color: "173B2C", opacity: 0.18, blur: 8, offset: 2, angle: 90 }
    });
    const isDark = i % 2 === 0;
    s.addShape("ellipse", { x: x + cw / 2 - 0.45, y: y0 + 0.4, w: 0.9, h: 0.9, fill: { color: isDark ? C.gold : C.dark }, line: { type: "none" } });
    s.addText(String(i + 1), {
      x: x + cw / 2 - 0.45, y: y0 + 0.4, w: 0.9, h: 0.9, fontFace: FONT, fontSize: 26, bold: true,
      color: isDark ? C.dark : C.gold, align: "center", valign: "middle"
    });
    s.addText(c.t, { x: x + 0.15, y: y0 + 1.55, w: cw - 0.3, h: 0.4, fontFace: FONT, fontSize: 17, bold: true, color: isDark ? C.white : C.dark, align: "center" });
    s.addText(c.lao, { x: x + 0.15, y: y0 + 1.95, w: cw - 0.3, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: isDark ? C.gold : C.textMuted, align: "center" });
    s.addText(c.d, { x: x + 0.2, y: y0 + 2.45, w: cw - 0.4, h: 1.3, fontFace: FONT, fontSize: 12, color: isDark ? C.cream : C.text, align: "center", lineSpacingMultiple: 1.15 });
  });
  s.addText("ທຸກລະບົບເຊື່ອມຕໍ່ກັນແບບ Real-time ຜ່ານ WebSocket — ຂໍ້ມູນອໍເດີ, ສະຖານະໂຕະ ແລະ ຄົວ ອັບເດດພ້ອມກັນທັນທີ ໂດຍບໍ່ຕ້ອງກົດ Refresh", {
    x: 0.6, y: 6.35, w: 11.9, h: 0.5, fontFace: FONT, fontSize: 13, italic: true, color: C.textMuted, align: "center",
  });
  pageNum(s, 4);
}

// ================= SLIDE 5: LOGIN & SELECTOR =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.1.1 - 4.1.2  ການເຂົ້າສູ່ລະບົບ", "ໜ້າເຂົ້າສູ່ລະບົບ ແລະ ເລືອກລະບົບຍ່ອຍ");

  imageCard(s, "assets/login.png", 622 / 316, 0.6, 2.15, 6.4, 3.6);
  imageCard(s, "assets/selector.png", 202 / 352, 7.5, 1.7, 2.7, 4.9);

  bulletList(s, [
    "ຢືນຢັນຕົວຕົນດ້ວຍ Username ແລະ Password ກ່ອນເຂົ້າໃຊ້ລະບົບ",
    "ຫຼັງເຂົ້າສູ່ລະບົບ, ລະບົບຄັດຕອງໜ້າຈໍໃຫ້ອັດຕະໂນມັດ ຕາມສິດຂອງແຕ່ລະຕຳແໜ່ງ",
    "Admin ແລະ Cashier ເຫັນໜ້າເລືອກລະບົບຍ່ອຍ, Waiter ແລະ Kitchen ເຂົ້າສູ່ລະບົບຂອງຕົນໂດຍກົງ",
  ], { x: 0.6, y: 6.0, w: 11.9, h: 1.1, fontSize: 13, spaceAfter: 6 });
  pageNum(s, 5);
}

// ================= SLIDE 6: WAITER MODULE =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.1.3 - 4.1.5  ລະບົບພະນັກງານເສີບ", "Waiter — ຈັດການໂຕະ ແລະ ສັ່ງອາຫານ");

  imageCard(s, "assets/waiter_table.png", 585 / 265, 0.6, 2.15, 5.4, 2.45);
  imageCard(s, "assets/waiter_order.png", 202 / 301, 6.35, 1.7, 2.8, 4.9);

  bulletList(s, [
    "ເບິ່ງສະຖານະໂຕະທັງໝົດແບບ Real-time — ວ່າງ, ກຳລັງນັ່ງ, ລໍຖ້າຊຳລະ",
    "ເລືອກເມນູ ແລະ ສ່ງອໍເດີເຂົ້າຄົວໄດ້ທັນທີຈາກມືຖື ຫຼື ແທັບເລັດ",
    "ໃສ່ໝາຍເຫດພິເສດ ແລະ ແກ້ໄຂອໍເດີກ່ອນຢືນຢັນ",
  ], { x: 0.6, y: 4.85, w: 5.55, h: 2.3, fontSize: 13, spaceAfter: 8 });
  pageNum(s, 6);
}

// ================= SLIDE 7: KITCHEN MODULE =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.1.7  ລະບົບຄົວ", "Kitchen — ຮັບ ແລະ ຕິດຕາມອໍເດີແບບ Real-time");

  imageCard(s, "assets/kitchen.png", 276 / 381, 8.1, 1.7, 3.9, 5.05);

  bulletList(s, [
    "ອໍເດີໃໝ່ຈາກທຸກໂຕະສະແດງທັນທີ ໂດຍບໍ່ຕ້ອງກົດ Refresh ໜ້າຈໍ",
    "ຈັດຮຽງຕາມແທັບ: ອໍເດີໃໝ່ · ກຳລັງເຮັດ · ແລ້ວເສັດ",
    "ອັບເດດສະຖານະລາຍການອາຫານ ແລ້ວແຈ້ງກັບໄປໂຕະໂດຍອັດຕະໂນມັດ",
    "ຫຼຸດຄວາມຜິດພາດ ແລະ ຄວາມລ່າຊ້າຈາກການສື່ສານດ້ວຍສຽງ ຫຼື ເຈ້ຍໃນຮ້ານ",
  ], { x: 0.6, y: 2.15, w: 7.0, h: 4.5, fontSize: 14.5, spaceAfter: 16 });
  pageNum(s, 7);
}

// ================= SLIDE 8: POS - SALES =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.1.8 - 4.1.10  ລະບົບ POS", "ຂາຍໜ້າຮ້ານ ແລະ ສະຫຼຸບຍອດຂາຍ");

  imageCard(s, "assets/pos_table.png", 623 / 341, 0.6, 2.15, 5.85, 3.2);
  imageCard(s, "assets/pos_sales.png", 623 / 350, 6.7, 2.15, 5.85, 3.2);

  bulletList(s, [
    "ເບິ່ງສະຖານະໂຕະ ແລະ ອອກບິນຄິດເງິນຈາກໜ້າຈໍດຽວ",
    "ຮັບຊຳລະຫຼາຍຮູບແບບ: ເງິນສົດ, ໂອນ, ຫຼື ຊຳລະແບບປະສົມ (Mixed Payment)",
    "ສະຫຼຸບຍອດຂາຍປະຈຳກະ (ຍອດຂາຍລວມ, ຈຳນວນບິນ, ຊ່ວງເວລາທີ່ຂາຍດີ) ແບບ Real-time",
  ], { x: 0.6, y: 5.55, w: 11.9, h: 1.6, fontSize: 13, spaceAfter: 6 });
  pageNum(s, 8);
}

// ================= SLIDE 9: POS - MANAGEMENT =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.1.11 - 4.1.12  ການຈັດການໃນ POS", "ຈັດການໂຕະ ແລະ ເມນູອາຫານ");

  imageCard(s, "assets/pos_menu.png", 569 / 302, 0.6, 2.15, 7.15, 3.8);

  bulletList(s, [
    "ເພີ່ມ, ແກ້ໄຂ, ຫຼື ລຶບເມນູອາຫານ ພ້ອມລາຄາโ ແລະ ໝວດໝູ່ໄດ້ທັນທີ",
    "ເປີດ/ປິດການຂາຍລາຍການອາຫານ ຊົ່ວຄາວໄດ້ (ເຊັ່ນ: ວັດຖຸດິບໝົດ)",
    "ຈັດການຈຳນວນໂຕະ ແລະ ສະຖານະໂຕະ ໃນຮ້ານ",
    "ການປ່ຽນແປງມີຜົນທັນທີໄປຫາໜ້າຈໍ Waiter ໂດຍບໍ່ຕ້ອງອັບເດດແອັບ",
  ], { x: 8.1, y: 2.15, w: 4.65, h: 4.0, fontSize: 13, spaceAfter: 14 });
  pageNum(s, 9);
}

// ================= SLIDE 10: ADMIN DASHBOARD =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.1.13  ລະບົບ Admin", "Dashboard — ພາບລວມທຸລະກິດແບບ Real-time");

  imageCard(s, "assets/admin_dashboard.png", 616 / 334, 0.6, 2.15, 7.55, 4.1);

  bulletList(s, [
    "ຍອດຂາຍ, ຈຳນວນບິນ, ຄ່າສະເລ່ຍຕໍ່ບິນ ແລະ ຊ່ວງເວລາຂາຍດີ",
    "ກຣາບຍອດຂາຍລາຍຊົ່ວໂມງ ແລະ ອັດຕາສ່ວນຊ່ອງທາງການຊຳລະ",
    "ສະຖານະໂຕະ ແລະ ເມນູຂາຍດີແບບ Real-time",
    "ຊ່ວຍເຈົ້າຂອງຮ້ານຕິດຕາມທຸລະກິດໄດ້ທຸກທີ່ ບໍ່ຈຳເປັນຕ້ອງຢູ່ໜ້າຮ້ານ",
  ], { x: 8.45, y: 2.15, w: 4.3, h: 4.0, fontSize: 13, spaceAfter: 14 });
  pageNum(s, 10);
}

// ================= SLIDE 11: ADMIN MANAGEMENT & SECURITY =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.1.17, 4.1.20  ການຈັດການ ແລະ ຄວາມປອດໄພ", "ຈັດການຜູ້ໃຊ້ ແລະ ຕິດຕາມການປ່ຽນແປງຂໍ້ມູນ");

  imageCard(s, "assets/admin_user.png", 623 / 350, 0.6, 2.15, 5.85, 3.2);
  imageCard(s, "assets/admin_audit.png", 622 / 310, 6.7, 2.15, 5.85, 3.2);

  bulletList(s, [
    "ຈັດການບັນຊີຜູ້ໃຊ້ ແລະ ກຳນົດສິດຕາມບົດບາດ (Admin · Cashier · Waiter · Kitchen)",
    "Audit Log ບັນທຶກທຸກການປ່ຽນແປງຂໍ້ມູນສຳຄັນ (ໃຜ, ເຮັດຫຍັງ, ເວລາໃດ) ໂດຍອັດຕະໂນມັດ ເພື່ອກວດສອບຍ້ອນຫຼັງໄດ້",
  ], { x: 0.6, y: 5.55, w: 11.9, h: 1.6, fontSize: 13, spaceAfter: 6 });
  pageNum(s, 11);
}

// ================= SLIDE 12: 4.2 EVALUATION - DEMOGRAPHICS =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.2  ຜົນການປະເມີນລະບົບ", "ຂໍ້ມູນທົ່ວໄປຂອງຜູ້ຕອບແບບສອບຖາມ (16 ຄົນ)");

  // Gender chart
  s.addText("ເພດ", { x: 0.6, y: 2.05, w: 3.6, h: 0.35, fontFace: FONT, fontSize: 14, bold: true, color: C.dark });
  s.addChart(pres.ChartType.doughnut, [
    { name: "ເພດ", labels: ["ຊາຍ", "ຍິງ", "ບໍ່ລະບຸ"], values: [5, 5, 6] },
  ], {
    x: 0.5, y: 2.4, w: 3.8, h: 2.55,
    chartColors: [C.dark, C.gold, C.line],
    showLegend: true, legendPos: "b", legendFontSize: 10, legendColor: C.text,
    showValue: true, dataLabelColor: C.white, dataLabelFontSize: 10, dataLabelPosition: "ctr",
    showTitle: false, dataLabelFormatCode: "0",
  });

  // Age chart
  s.addText("ອາຍຸ", { x: 4.7, y: 2.05, w: 3.6, h: 0.35, fontFace: FONT, fontSize: 14, bold: true, color: C.dark });
  s.addChart(pres.ChartType.bar, [
    { name: "ຈຳນວນ (ຄົນ)", labels: ["ຕ່ຳກວ່າ 18", "18-25", "26-35", "36-45", "ຫຼາຍກວ່າ 45"], values: [0, 7, 8, 0, 1] },
  ], {
    x: 4.6, y: 2.4, w: 3.9, h: 2.55,
    barDir: "col", chartColors: [C.dark],
    showLegend: false, showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.dark, dataLabelFontSize: 10,
    catAxisLabelFontSize: 9, catAxisLabelColor: C.textMuted, valAxisHidden: true,
    catGridLine: { style: "none" }, valGridLine: { style: "none" },
  });

  // Education + occupation as stat cards
  s.addText("ລະດັບການສຶກສາ / ອາຊີບ", { x: 8.85, y: 2.05, w: 3.9, h: 0.35, fontFace: FONT, fontSize: 14, bold: true, color: C.dark });
  const stats = [
    { l: "ປະລິນຍາຕີ ຫຼື ທຽບເທົ່າ", v: "62.5%" },
    { l: "ມັດທະຍົມຕອນປາຍ", v: "18.8%" },
    { l: "ຂະແໜງທຸລະກິດ / ບໍລິຫານ", v: "62.5%" },
    { l: "ຂະແໜງ IT / ຄອມພິວເຕີ", v: "25.0%" },
  ];
  let sy = 2.45;
  stats.forEach((st) => {
    s.addShape("roundRect", { x: 8.85, y: sy, w: 3.9, h: 0.75, rectRadius: 0.06, fill: { color: C.cardGreen }, line: { type: "none" } });
    s.addText(st.v, { x: 8.95, y: sy + 0.06, w: 1.1, h: 0.63, fontFace: FONT, fontSize: 17, bold: true, color: C.dark, valign: "middle" });
    s.addText(st.l, { x: 10.05, y: sy + 0.06, w: 2.65, h: 0.63, fontFace: FONT, fontSize: 10.5, color: C.text, valign: "middle" });
    sy += 0.9;
  });

  s.addText("ຜູ້ຕອບແບບສອບຖາມສ່ວນໃຫຍ່ຢູ່ໃນຊ່ວງອາຍຸ 18-35 ປີ ແລະ ມີພື້ນຖານການສຶກສາລະດັບປະລິນຍາຕີໃນຂະແໜງທຸລະກິດ/ບໍລິຫານ ຫຼື IT — ສອດຄ່ອງກັບກຸ່ມເປົ້າໝາຍຂອງລະບົບ", {
    x: 0.6, y: 5.35, w: 12.15, h: 0.5, fontFace: FONT, fontSize: 12.5, italic: true, color: C.textMuted,
  });
  pageNum(s, 12);
}

// ================= SLIDE 13: 4.2 EVALUATION RESULTS BY CATEGORY =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.2  ຜົນການປະເມີນລະບົບ", "ຄວາມພໍໃຈຂອງຜູ້ໃຊ້ 4 ດ້ານ (ຄະແນນເຕັມ 5)");

  s.addChart(pres.ChartType.bar, [
    {
      name: "ຄະແນນສະເລ່ຍ",
      labels: ["ດ້ານເນື້ອໃນ", "ດ້ານການອອກແບບ", "ດ້ານການນຳໄປໃຊ້", "ປະສິດທິພາບ &\nຄວາມປອດໄພ"],
      values: [4.13, 4.21, 4.14, 4.41],
    },
  ], {
    x: 0.6, y: 1.95, w: 7.5, h: 4.6,
    barDir: "col", chartColors: [C.dark],
    showLegend: false, showValue: true, dataLabelPosition: "outEnd",
    dataLabelColor: C.dark, dataLabelFontSize: 12, dataLabelFontBold: true, dataLabelFormatCode: "0.00",
    catAxisLabelFontSize: 11, catAxisLabelColor: C.text, catAxisLabelFontFace: FONT,
    valAxisMinVal: 0, valAxisMaxVal: 5, valAxisHidden: true,
    catGridLine: { style: "none" }, valGridLine: { style: "none" },
  });

  // Overall score callout
  s.addShape("roundRect", { x: 8.55, y: 1.95, w: 4.2, h: 2.05, rectRadius: 0.12, fill: { color: C.dark }, line: { type: "none" } });
  s.addText("ຄະແນນສະເລ່ຍລວມ", { x: 8.55, y: 2.15, w: 4.2, h: 0.4, fontFace: FONT, fontSize: 13, color: C.goldLight, align: "center" });
  s.addText("4.22", { x: 8.55, y: 2.45, w: 4.2, h: 1.1, fontFace: FONT, fontSize: 60, bold: true, color: C.white, align: "center" });
  s.addText("ລະດັບ: ດີ  (SD = 0.60)", { x: 8.55, y: 3.55, w: 4.2, h: 0.35, fontFace: FONT, fontSize: 13, color: C.gold, align: "center" });

  s.addText("ເກນການປະເມີນ", { x: 8.55, y: 4.25, w: 4.2, h: 0.35, fontFace: FONT, fontSize: 12, bold: true, color: C.dark });
  const scale = [
    "4.51 - 5.00   ດີເລີດ", "3.51 - 4.50   ດີ", "2.51 - 3.50   ປານກາງ", "1.00 - 2.50   ຄວນປັບປຸງ",
  ];
  s.addText(scale.map((t) => ({ text: t, options: { breakLine: true, paraSpaceAfter: 5 } })), {
    x: 8.55, y: 4.62, w: 4.2, h: 1.6, fontFace: FONT, fontSize: 11.5, color: C.textMuted,
  });

  s.addText("ທັງ 4 ດ້ານໄດ້ຄະແນນຢູ່ໃນລະດັບ “ດີ” ຂຶ້ນໄປ, ໂດຍດ້ານປະສິດທິພາບ ແລະ ຄວາມປອດໄພໄດ້ຄະແນນສູງສຸດ", {
    x: 0.6, y: 6.75, w: 12.15, h: 0.4, fontFace: FONT, fontSize: 12.5, italic: true, color: C.textMuted,
  });
  pageNum(s, 13);
}

// ================= SLIDE 14: KEY FINDINGS =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "4.2  ຜົນການປະເມີນລະບົບ", "ຈຸດທີ່ຜູ້ໃຊ້ພໍໃຈສູງສຸດ ແລະ ຈຸດທີ່ຄວນປັບປຸງ");

  s.addShape("roundRect", { x: 0.6, y: 2.05, w: 5.85, h: 4.6, rectRadius: 0.12, fill: { color: C.cardGreen }, line: { type: "none" } });
  s.addText("ຄະແນນສູງສຸດ  (4.5 - 4.75)", { x: 0.95, y: 2.3, w: 5.2, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.dark });
  bulletList(s, [
    "ຄວາມໝັ້ນຄົງໃນການສັ່ງອາຫານ ແລະ ອອກໃບບິນ (4.75)",
    "ຄວາມຖືກຕ້ອງຂອງສະຖານະໂຕະແບບ Real-time (4.63)",
    "ຄວາມສະດວກໃນການເພີ່ມ-ແກ້ໄຂຂໍ້ມູນ (4.69)",
    "ລະບົບຢືນຢັນຕົວຕົນ ແລະ ຄວາມປອດໄພໃນການເຂົ້າໃຊ້ (4.69)",
    "ຄວາມສະດວກໃນການອອກແບບເມນູ ແລະ ຮູບແບບຕົວອັກສອນ (4.56 - 4.63)",
  ], { x: 0.95, y: 2.85, w: 5.2, h: 3.6, fontSize: 12.5, spaceAfter: 11 });

  s.addShape("roundRect", { x: 6.75, y: 2.05, w: 5.9, h: 4.6, rectRadius: 0.12, fill: { color: C.card }, line: { type: "none" } });
  s.addText("ຈຸດທີ່ຄວນປັບປຸງ  (3.3 - 3.5)", { x: 7.1, y: 2.3, w: 5.3, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.dark });
  bulletList(s, [
    "ຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນລາຄາ/ຊື່ເມນູ ໃນບາງກໍລະນີ (3.50)",
    "ຄວາມຄົບຖ້ວນຂອງລາຍລະອຽດອໍເດີ ເຊັ່ນ ຈຳນວນ-ໝາຍເຫດ (3.38)",
    "ຄວາມສະໝ່ຳສະເໝີຂອງສີສັນ ແລະ ໂຕນຫນັງສືໃນບາງໜ້າ (3.44)",
    "ຄວາມເຂົ້າໃຈງ່າຍໃນການກວດສອບສະຖານະ/ຂໍ້ມູນບາງຢ່າງ (3.50)",
    "ຄູ່ມື ຫຼື ຄຳແນະນຳການນຳໃຊ້ລະບົບ (3.31)",
  ], { x: 7.1, y: 2.85, w: 5.3, h: 3.6, fontSize: 12.5, spaceAfter: 11 });
  pageNum(s, 14);
}

// ================= SLIDE 15: SECTION DIVIDER - CH 5 =================
sectionDivider("5", "ບົດສະຫຼຸບ ແລະ ຂໍ້ສະເໜີແນະ", "ສະຫຼຸບຜົນການດຳເນີນໂຄງການ, ຈຸດເດັ່ນ-ຈຸດອ່ອນ ແລະ ທິດທາງການພັດທະນາຕໍ່");

// ================= SLIDE 16: 5.1 SUMMARY =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "5.1  ບົດສະຫຼຸບ", "ສະຫຼຸບຜົນການດຳເນີນໂຄງການ");

  // Needs / outcomes columns
  const colW = 5.7;
  s.addShape("roundRect", { x: 0.6, y: 2.0, w: colW, h: 4.15, rectRadius: 0.12, fill: { color: "F3EDEA" }, line: { type: "none" } });
  s.addText("ຄວາມຕ້ອງການໃນການເຮັດວຽກຂອງຮ້ານ", { x: 0.9, y: 2.2, w: colW - 0.6, h: 0.55, fontFace: FONT, fontSize: 14.5, bold: true, color: "8A4B3B" });
  bulletList(s, [
    "ພະນັກງານເສີບ, ຄົວ, ແຄຊເຊຍ ແລະ ຜູ້ບໍລິຫານ ຕ້ອງປະສານວຽກກັນຢ່າງຕໍ່ເນື່ອງ",
    "ຕ້ອງເຫັນອໍເດີ ແລະ ສະຖານະອາຫານໃຫ້ຊັດເຈນ ເພື່ອບໍລິການລູກຄ້າໄດ້ທັນເວລາ",
    "ຕ້ອງຈັດການໂຕະ, ການຈອງ, ບິນ ແລະ ເມນູ ໃຫ້ເປັນລະບຽບ",
    "ເຈົ້າຂອງຮ້ານຕ້ອງການຂໍ້ມູນທີ່ເບິ່ງງ່າຍ ເພື່ອຕິດຕາມ ແລະ ຕັດສິນໃຈ",
  ], { x: 0.9, y: 2.85, w: colW - 0.6, h: 3.2, fontSize: 12.5, spaceAfter: 12 });

  s.addShape("roundRect", { x: 6.95, y: 2.0, w: colW, h: 4.15, rectRadius: 0.12, fill: { color: C.cardGreen }, line: { type: "none" } });
  s.addText("ສິ່ງທີ່ TonNam RMS ສາມາດຕອບໂຈດ", { x: 7.25, y: 2.2, w: colW - 0.6, h: 0.55, fontFace: FONT, fontSize: 14.5, bold: true, color: C.dark });
  bulletList(s, [
    "ມີ 4 ລະບົບຍ່ອຍສຳລັບແຕ່ລະໜ້າທີ່ ແລະ ເຊື່ອມຂໍ້ມູນຫາກັນ",
    "ອໍເດີ, ສະຖານະຄົວ ແລະ ສະຖານະໂຕະ ອັບເດດພ້ອມກັນທັນທີ",
    "ຈັດການຂໍ້ມູນສຳຄັນໄວ້ໃນລະບົບດຽວ ແລະ ກວດສອບຍ້ອນຫຼັງໄດ້",
    "ສະຫຼຸບຍອດຂາຍ ແລະ ເມນູຂາຍດີ ເພື່ອຊ່ວຍວາງແຜນການບໍລິຫານຮ້ານ",
  ], { x: 7.25, y: 2.85, w: colW - 0.6, h: 3.2, fontSize: 12.5, spaceAfter: 12 });

  s.addText("ຜົນການປະເມີນ 16 ຄົນ: ຄະແນນສະເລ່ຍ 4.22/5  (ລະດັບດີ)", {
    x: 0.6, y: 6.35, w: 12.15, h: 0.5, fontFace: FONT, fontSize: 12.5, italic: true, color: C.textMuted, align: "center",
  });
  pageNum(s, 16);
}

// ================= SLIDE 17: 5.2.1 STRENGTHS =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "5.2.1  ຈຸດເດັ່ນ", "ຈຸດເດັ່ນຂອງລະບົບ");

  const strengths = [
    ["Real-time ທຸກລະບົບຍ່ອຍ", "ອໍເດີ, ສະຖານະໂຕະ ແລະ ຄົວ ອັບເດດພ້ອມກັນທັນທີຜ່ານ WebSocket ໂດຍບໍ່ຕ້ອງ Refresh"],
    ["ຈັດການໂຕະ ແລະ ການຈອງໄດ້ເປັນລະບົບ", "ເຫັນສະຖານະໂຕະ ຈັດການການຈອງ ແລະ ຮອງຮັບການລວມ/ແຍກໂຕະຕາມການໃຊ້ງານຂອງຮ້ານ"],
    ["ຄວບຄຸມສິດຕາມບົດບາດ (RBAC)", "Admin · Cashier · Waiter · Kitchen ເຂົ້າເຖິງສະເພາະສ່ວນທີ່ກ່ຽວຂ້ອງກັບໜ້າທີ່ຕົນ"],
    ["Audit Log ຄົບຖ້ວນ", "ບັນທຶກທຸກການປ່ຽນແປງຂໍ້ມູນສຳຄັນໂດຍອັດຕະໂນມັດ ເພື່ອຄວາມໂປ່ງໃສ ແລະ ກວດສອບໄດ້"],
    ["ໃຊ້ໄດ້ຫຼາຍອຸປະກອນ", "ມືຖື, ແທັບເລັດ, ຫຼື ຄອມພິວເຕີ — ບໍ່ຈຳກັດອຸປະກອນສະເພາະ"],
    ["ມີຂໍ້ມູນຊ່ວຍບໍລິຫານຮ້ານ", "ເບິ່ງຍອດຂາຍ, ເມນູຂາຍດີ ແລະ ຂໍ້ມູນສຳຄັນເພື່ອຊ່ວຍວາງແຜນຮ້ານ"],
  ];
  const cw = 3.83, gap = 0.2, x0 = 0.6, y0 = 2.05;
  strengths.forEach((it, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gap);
    const y = y0 + row * 2.35;
    s.addShape("roundRect", { x, y, w: cw, h: 2.15, rectRadius: 0.1, fill: { color: C.cardGreen }, line: { type: "none" } });
    s.addShape("ellipse", { x: x + 0.22, y: y + 0.22, w: 0.42, h: 0.42, fill: { color: C.dark }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + 0.22, y: y + 0.22, w: 0.42, h: 0.42, fontFace: FONT, fontSize: 14, bold: true, color: C.gold, align: "center", valign: "middle" });
    s.addText(it[0], { x: x + 0.22, y: y + 0.78, w: cw - 0.44, h: 0.55, fontFace: FONT, fontSize: 13, bold: true, color: C.dark });
    s.addText(it[1], { x: x + 0.22, y: y + 1.28, w: cw - 0.44, h: 0.8, fontFace: FONT, fontSize: 10.5, color: C.textMuted, lineSpacingMultiple: 1.12 });
  });
  pageNum(s, 17);
}

// ================= SLIDE 18: 5.2.2 WEAKNESSES =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "5.2.2  ຈຸດອ່ອນ", "ຈຸດອ່ອນຂອງລະບົບ");

  const weak = [
    ["ຕ້ອງໃຊ້ອິນເຕີເນັດ", "ຖ້າສັນຍານອິນເຕີເນັດຂັດຂ້ອງ ພະນັກງານອາດຮັບອໍເດີ ຫຼື ເບິ່ງຂໍ້ມູນໃໝ່ບໍ່ໄດ້"],
    ["ລູກຄ້າສັ່ງເອງຈາກໂຕະບໍ່ໄດ້", "ຍັງຕ້ອງໃຫ້ພະນັກງານຮັບອໍເດີ ຈຶ່ງອາດລໍຖ້ານານໃນຊ່ວງທີ່ຮ້ານເຕັມ"],
    ["ບໍ່ມີສິດປະໂຫຍດລູກຄ້າປະຈຳ", "ລູກຄ້າຍັງບໍ່ສາມາດສະສົມແຕ້ມ ຫຼື ໄດ້ຮັບຄູປອງຈາກການມາໃຊ້ບໍລິການ"],
    ["ຍັງບໍ່ມີລະບົບຈັດການ Stock", "ພະນັກງານຍັງຕ້ອງກວດນັບວັດຖຸດິບ ແລະ ຕິດຕາມວ່າເມນູໃດກຳລັງຈະໝົດດ້ວຍຕົນເອງ"],
    ["ໃຊ້ງານໄດ້ພາສາລາວເປັນຫຼັກ", "ພະນັກງານ ຫຼື ລູກຄ້າທີ່ບໍ່ເຂົ້າໃຈພາສາລາວອາດໃຊ້ງານບໍ່ສະດວກ"],
    ["ຄູ່ມືການໃຊ້ງານຍັງບໍ່ພຽງພໍ", "ພະນັກງານໃໝ່ອາດຕ້ອງສອບຖາມຜູ້ອື່ນ ຫຼື ໃຊ້ເວລາຮຽນຮູ້ກ່ອນເຮັດວຽກໄດ້ຄ່ອງຕົວ"],
    ["ຍັງບໍ່ມີລະບົບຈັດການກະວຽກ", "ການຈັດຕາຕະລາງ ແລະ ບັນທຶກເວລາເຮັດວຽກຂອງພະນັກງານ ຍັງຕ້ອງເຮັດແຍກຕ່າງຫາກ"],
  ];
  const cw = 5.85, gap = 0.25, x0 = 0.6, y0 = 1.75;
  weak.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const isLastOddItem = weak.length % 2 !== 0 && i === weak.length - 1;
    const x = isLastOddItem ? x0 + (cw + gap) / 2 : x0 + col * (cw + gap);
    const y = y0 + row * 1.2;
    s.addShape("roundRect", { x, y, w: cw, h: 1.05, rectRadius: 0.08, fill: { color: C.card }, line: { type: "none" } });
    s.addShape("ellipse", { x: x + 0.18, y: y + 0.3, w: 0.42, h: 0.42, fill: { color: "9B5B3A" }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + 0.18, y: y + 0.3, w: 0.42, h: 0.42, fontFace: FONT, fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle" });
    s.addText(it[0], { x: x + 0.78, y: y + 0.12, w: cw - 0.98, h: 0.3, fontFace: FONT, fontSize: 11.5, bold: true, color: C.dark });
    s.addText(it[1], { x: x + 0.78, y: y + 0.46, w: cw - 0.98, h: 0.48, fontFace: FONT, fontSize: 9.8, color: C.textMuted, valign: "middle", lineSpacingMultiple: 1.05 });
  });
  pageNum(s, 18);
}

// ================= SLIDE 19: 5.3 RECOMMENDATIONS =================
{
  const s = pres.addSlide();
  addBg(s, C.white);
  kickerTitle(s, "5.3  ຂໍ້ສະເໜີແນະ", "ທິດທາງການພັດທະນາຕໍ່");

  const recs = [
    "ຈັດຕຽມອິນເຕີເນັດສຳຮອງ ແລະ ໃຫ້ລະບົບບັນທຶກອໍເດີໄວ້ຊົ່ວຄາວເມື່ອອອບໄລນ໌",
    "ເພີ່ມການສັ່ງອາຫານຜ່ານ QR Code ຢູ່ໂຕະ ເພື່ອໃຫ້ລູກຄ້າສັ່ງໄດ້ດ້ວຍຕົນເອງ",
    "ພັດທະນາລະບົບສະສົມແຕ້ມ ແລະ ຄູປອງສຳລັບລູກຄ້າປະຈຳ",
    "ເພີ່ມລະບົບຈັດການວັດຖຸດິບ ແລະ ແຈ້ງເຕືອນເມື່ອວັດຖຸດິບໃກ້ໝົດ",
    "ເພີ່ມຕົວເລືອກພາສາ ເຊັ່ນ ລາວ, ໄທ ແລະ ອັງກິດ ໃຫ້ເໝາະກັບຜູ້ໃຊ້ຫຼາຍຂຶ້ນ",
    "ເພີ່ມຄູ່ມືສັ້ນໆ ແລະ ຄຳແນະນຳໃນໜ້າຈໍ ສຳລັບພະນັກງານໃໝ່",
    "ເພີ່ມການຈັດການກະວຽກ ແລະ ບັນທຶກເວລາເຂົ້າ-ອອກວຽກ",
  ];
  const cw = 5.85, gap = 0.25, x0 = 0.6, y0 = 1.75;
  recs.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const isLastOddItem = recs.length % 2 !== 0 && i === recs.length - 1;
    const x = isLastOddItem ? x0 + (cw + gap) / 2 : x0 + col * (cw + gap);
    const y = y0 + row * 1.22;
    s.addShape("roundRect", { x, y, w: cw, h: 1.08, rectRadius: 0.1, fill: { color: C.cardGreen }, line: { type: "none" } });
    s.addShape("ellipse", { x: x + 0.2, y: y + 0.32, w: 0.45, h: 0.45, fill: { color: C.dark }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + 0.2, y: y + 0.32, w: 0.45, h: 0.45, fontFace: FONT, fontSize: 13, bold: true, color: C.gold, align: "center", valign: "middle" });
    s.addText(t, { x: x + 0.8, y: y + 0.1, w: cw - 1.0, h: 0.88, fontFace: FONT, fontSize: 10.5, color: C.text, valign: "middle", lineSpacingMultiple: 1.08 });
  });

  s.addText([
    { text: "Source code:  ", options: { bold: true, color: C.dark } },
    { text: "github.com/vong0-0/tonnam-system", options: { color: C.textMuted } },
  ], { x: 0.6, y: 6.75, w: 12.15, h: 0.35, fontFace: FONT, fontSize: 11.5, align: "center" });
  pageNum(s, 19);
}

// ================= SLIDE 20: THANK YOU =================
{
  const s = pres.addSlide();
  addBg(s, C.dark);
  s.addShape("ellipse", { x: -2.4, y: -2.6, w: 6.5, h: 6.5, fill: { color: C.dark2 }, line: { type: "none" } });
  s.addShape("ellipse", { x: 10.6, y: 4.6, w: 4.2, h: 4.2, fill: { color: C.dark2 }, line: { type: "none" } });

  s.addText("ຂອບໃຈ", {
    x: 0, y: 2.55, w: PGW, h: 1.4, fontFace: FONT, fontSize: 60, bold: true, color: C.white, align: "center",
  });
  s.addShape("rect", { x: PGW / 2 - 0.55, y: 3.95, w: 1.1, h: 0.05, fill: { color: C.gold } });
  s.addText("ຂໍຂອບໃຈຄະນະກຳມະການ ແລະ ຜູ້ເຂົ້າຮ່ວມຮັບຟັງ — ພ້ອມຮັບຟັງຄຳຖາມ ແລະ ຂໍ້ສະເໜີແນະ", {
    x: 1.5, y: 4.15, w: 10.3, h: 0.5, fontFace: FONT, fontSize: 15, color: C.goldLight, align: "center",
  });
  s.addText("TonNam Restaurant Management System  ·  ມະຫາວິທະຍາໄລສະຫວັນນະເຂດ  ·  2025-2026", {
    x: 0, y: 6.7, w: PGW, h: 0.4, fontFace: FONT, fontSize: 12, color: C.textMuted, align: "center",
  });
}

const path = require("path");
const outputPath = path.join(__dirname, "TonNam_Chapter4-5.pptx");
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log(`DONE: ${outputPath}`);
}).catch((err) => {
  console.error("Failed to write presentation:", err);
  process.exit(1);
});
