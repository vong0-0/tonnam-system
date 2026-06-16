/**
 * TonNam SRMS — Manual UAT Google Form generator
 * =================================================
 * Builds a Google Form for manual UAT, based on docs/manual-uat-test-cases.md.
 * Form language is Lao; test-case titles keep TC-ID + English + the Lao UI label.
 *
 * HOW TO RUN
 * ----------
 *   1. Open https://script.google.com  →  "New project".
 *   2. Delete the sample code, paste THIS entire file.
 *   3. Click "Save" (disk icon).
 *   4. In the function dropdown choose `createUatForm`, then click "Run".
 *   5. First run asks for authorization → "Review permissions" → choose your Google
 *      account → "Allow" (it needs permission to create Forms/Drive files).
 *   6. Open "Execution log" (View → Logs, or the bottom panel). It prints:
 *        - PUBLISHED URL  → share this link with testers
 *        - EDIT URL       → open this to tweak the form
 *      The form also appears at the top of your Google Drive ("My Drive").
 *
 * To regenerate after editing test cases: just Run again — it creates a NEW form
 * each time (it does not overwrite the previous one).
 *
 * To add/remove a test case: edit the SECTIONS array below — one object per case:
 *   { id: 'TC-XXX-00', title: '...' }
 */

// ── Result options (Lao) ──────────────────────────────────────────────────────
var RESULT_OPTIONS = ['ຜ່ານ (Pass)', 'ບໍ່ຜ່ານ (Fail)', 'ບໍ່ໄດ້ທົດສອບ (Skip)'];

// ── Test cases grouped by role/section ────────────────────────────────────────
// title = English summary + the key Lao UI label(s) testers will see.
var SECTIONS = [
  {
    key: 'Auth',
    title: '1. Auth — ເຂົ້າສູ່ລະບົບ',
    help: 'ທົດສອບການເຂົ້າສູ່ລະບົບ ແລະ ການນຳທາງຕາມສິດ (role).',
    cases: [
      { id: 'TC-AUTH-01', title: 'Admin login redirects to /select' },
      { id: 'TC-AUTH-02', title: 'Cashier login redirects to /select' },
      { id: 'TC-AUTH-03', title: 'Waiter login redirects to /waiter' },
      { id: 'TC-AUTH-04', title: 'Kitchen login redirects to /kitchen' },
      { id: 'TC-AUTH-05', title: 'Wrong password shows "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" and stays on /login' },
      { id: 'TC-AUTH-06', title: 'Logout requires confirm dialog "ອອກຈາກລະບົບ"' },
    ],
  },
  {
    key: 'Waiter',
    title: '2. Waiter — ພະນັກງານເສີບ',
    help: 'ທົດສອບ flow ການເປີດໂຕະ ສັ່ງອາຫານ ແລະ ການຈອງ.',
    cases: [
      { id: 'TC-WAIT-01', title: 'Open table "ເປີດໂຕະ" → status "ມີລູກຄ້າ"' },
      { id: 'TC-WAIT-02', title: 'Open bill "ເປີດບິນ"' },
      { id: 'TC-WAIT-03', title: 'Add items with "ຈຳນວນ" + "ໝາຍເຫດ" → "ເພີ່ມເຂົ້າ"' },
      { id: 'TC-WAIT-04', title: 'Review cart "ກວດສອບລາຍການອາຫານ" + "ສົ່ງໄປຫ້ອງຄົວ"' },
      { id: 'TC-WAIT-05', title: 'Sent item shows "ກຳລັງເຮັດ"' },
      { id: 'TC-WAIT-06', title: 'Confirm reservation "ຢືນຢັນລູກຄ້າມາຮອດ" → "ຢືນຢັນແລ້ວ"' },
      { id: 'TC-WAIT-07', title: 'Profile + logout "ອອກຈາກລະບົບ"' },
    ],
  },
  {
    key: 'Kitchen',
    title: '3. Kitchen — ຫ້ອງຄົວ',
    help: 'ທົດສອບການຮັບ ແລະ ອັບເດດລາຍການອາຫານ.',
    cases: [
      { id: 'TC-KIT-01', title: 'New order in waiting tab "ລໍຖ້າ" (badge "ອໍເດີໃຫມ່")' },
      { id: 'TC-KIT-02', title: 'Mark item "ພ້ອມເສີບ" → "ສຳເລັດ"' },
      { id: 'TC-KIT-03', title: 'Cancel item requires reason "ຍົກເລິກລາຍການ" → "ເຫດຜົນການຍົກເລີກ"' },
      { id: 'TC-KIT-04', title: 'Send finished items "ສົ່ງລາຍການອາຫານ"' },
      { id: 'TC-KIT-05', title: 'Order history filter (date / "ສຳເລັດ" / "ຍົກເລີກ")' },
    ],
  },
  {
    key: 'POS',
    title: '4. POS / Cashier — ລະບົບ POS',
    help: 'ທົດສອບ flow ການເປີດໂຕະ ສັ່ງ ຊຳລະເງິນ ແລະ ເຄຍໂຕະ.',
    cases: [
      { id: 'TC-POS-01', title: 'Open table → create bill "ເປີດບິດເພື່ອສັ່ງອາຫານ"' },
      { id: 'TC-POS-02', title: 'Add order "ສັ່ງອາຫານເພີ່ມ" → "ສົ່ງໄປຫ້ອງຄົວ"' },
      { id: 'TC-POS-03', title: 'Adjust item quantity requires reason "ປ່ຽນຈຳນວນ"' },
      { id: 'TC-POS-04', title: 'Cancel item requires reason "ຍົກເລີກລາຍການ"' },
      { id: 'TC-POS-05', title: 'Pay cash "ເງິນສົດ" with change "ເງິນທອນ" → "ຊຳລະແລ້ວ"' },
      { id: 'TC-POS-06', title: 'Cash below total rejected "ຈຳນວນເງິນໜ້ອຍກວ່າຍອດທີ່ຕ້ອງຊຳລະ"' },
      { id: 'TC-POS-07', title: 'Pay QR "QR" → method badge "ໂອນຈ່າຍ"' },
      { id: 'TC-POS-08', title: 'Mixed total must match "ຈຳນວນລວມຕ້ອງເທົ່າກັບ … ກີບ"' },
      { id: 'TC-POS-09', title: 'Clear paid table "ເຄຍໂຕະ" → "ວ່າງ"' },
      { id: 'TC-POS-10', title: 'Cancel bill requires reason "ຍົກເລິກບິດ"' },
      { id: 'TC-POS-11', title: 'Create table "ເພີ່ມໂຕະ" / move table "ຢ້າຍໂຕະ"' },
      { id: 'TC-POS-12', title: 'Bills filter + detail + "ພິມບິນ"; menu sold-out "ໝາຍວ່າ ໝົດ"' },
    ],
  },
  {
    key: 'Admin',
    title: '5. Admin — ລະບົບຫຼັງບ້ານ',
    help: 'ທົດສອບ dashboard, analytics ແລະ ການຈັດການຂໍ້ມູນ.',
    cases: [
      { id: 'TC-ADM-01', title: 'Dashboard KPIs + charts render ("ເມນູຍອດນິຍົມ")' },
      { id: 'TC-ADM-02', title: 'Analytics period switch "ລາຍວັນ/ລາຍອາທິດ/ລາຍເດືອນ/ລາຍປີ"' },
      { id: 'TC-ADM-03', title: 'Dead items "ຂາຍຊ້າ" not supported for daily message' },
      { id: 'TC-ADM-04', title: 'Create table "ເພີ່ມໂຕະໃໝ່"' },
      { id: 'TC-ADM-05', title: 'Edit table "ແກ້ໄຂ" → "ບັນທຶກ"' },
      { id: 'TC-ADM-06', title: 'Delete table "ລົບໂຕະ"' },
      { id: 'TC-ADM-07', title: 'Menu category create/edit/delete' },
      { id: 'TC-ADM-08', title: 'Menu item create "ເພີ່ມເມນູ" + edit' },
      { id: 'TC-ADM-09', title: 'Item availability "ພ້ອມຂາຍ" / sold-out "ໝົດ" toggle' },
      { id: 'TC-ADM-10', title: 'Create user "ເພີ່ມພະນັກງານ" + validation (phone 020XXXXXXXX, password ≥8)' },
      { id: 'TC-ADM-11', title: 'Edit user → "ບັນທຶກ"' },
      { id: 'TC-ADM-12', title: 'Deactivate "ປິດໃຊ້ງານ" / reactivate "ເປີດໃຊ້ງານ" user' },
      { id: 'TC-ADM-13', title: 'Edit bill name (reason "ເຫດຜົນທີ່ແກ້ໄຂ") + cancel bill (reason)' },
      { id: 'TC-ADM-14', title: 'Audit log records the reason (filter + detail)' },
    ],
  },
  {
    key: 'Permission',
    title: '6. Permission — ການຄວບຄຸມສິດ',
    help: 'ທົດສອບວ່າແຕ່ລະ role ເຂົ້າໄດ້ສະເພາະໜ້າທີ່ອະນຸຍາດ.',
    cases: [
      { id: 'TC-PERM-01', title: 'Waiter blocked from /pos' },
      { id: 'TC-PERM-02', title: 'Waiter blocked from /admin' },
      { id: 'TC-PERM-03', title: 'Kitchen limited to /kitchen (blocked from /pos, /admin, /waiter)' },
      { id: 'TC-PERM-04', title: 'Cashier blocked from /admin (no Admin card on /select)' },
    ],
  },
];

/**
 * Entry point — Run this function.
 */
function createUatForm() {
  var form = FormApp.create('TonNam SRMS — Manual UAT');
  form.setDescription(
    'ແບບຟອມທົດສອບການນຳໃຊ້ຈິງ (Manual UAT) ຂອງລະບົບ TonNam SRMS.\n' +
    'ກະລຸນາເລືອກລະບົບທີ່ທ່ານທົດສອບ ແລະ ບັນທຶກຜົນແຕ່ລະ test case.\n' +
    'ຜົນ: ຜ່ານ = ເຮັດວຽກຖືກຕ້ອງ · ບໍ່ຜ່ານ = ຜິດປົກກະຕິ · ບໍ່ໄດ້ທົດສອບ = ບໍ່ໄດ້ກວດ.'
  );
  form.setProgressBar(true);
  form.setCollectEmail(false);

  // ── Section 1: tester info ──────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('ຂໍ້ມູນຜູ້ທົດສອບ')
    .setHelpText('ກະລຸນາໃສ່ຂໍ້ມູນຂອງທ່ານກ່ອນເລີ່ມທົດສອບ.');

  form.addTextItem()
    .setTitle('ຊື່ຜູ້ທົດສອບ')
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('ລະບົບທີ່ທ່ານທົດສອບ')
    .setHelpText('ເລືອກໄດ້ຫຼາຍກວ່າໜຶ່ງ')
    .setChoiceValues(['Auth', 'Waiter', 'Kitchen', 'POS', 'Admin', 'Permission'])
    .setRequired(true);

  form.addDateItem()
    .setTitle('ວັນທີ່ທົດສອບ')
    .setRequired(true);

  // ── One page (section) per role ─────────────────────────────────────────────
  for (var s = 0; s < SECTIONS.length; s++) {
    var section = SECTIONS[s];

    form.addPageBreakItem()
      .setTitle(section.title)
      .setHelpText(section.help);

    for (var c = 0; c < section.cases.length; c++) {
      var tc = section.cases[c];

      form.addMultipleChoiceItem()
        .setTitle(tc.id + ' — ' + tc.title)
        .setChoiceValues(RESULT_OPTIONS)
        .setRequired(false); // not required → testers can submit after one role

      form.addParagraphTextItem()
        .setTitle('ໝາຍເຫດ / ບັນຫາທີ່ພົບ — ' + tc.id)
        .setHelpText('ບໍ່ບັງຄັບ — ໃສ່ສະເພາະເມື່ອ "ບໍ່ຜ່ານ" ຫຼື ມີຂໍ້ສັງເກດ')
        .setRequired(false);
    }
  }

  // ── Final section: overall feedback ─────────────────────────────────────────
  form.addPageBreakItem()
    .setTitle('ສະຫຼຸບ & ຄວາມຄິດເຫັນ')
    .setHelpText('ຄຳຄິດເຫັນລວມຫຼັງຈາກທົດສອບແລ້ວ.');

  form.addParagraphTextItem()
    .setTitle('ຄວາມຄິດເຫັນລວມ')
    .setHelpText('ສິ່ງທີ່ມັກ, ບັນຫາໃຫຍ່, ຫຼື ຂໍ້ສະເໜີແນະ')
    .setRequired(false);

  form.addScaleItem()
    .setTitle('ຄະແນນຄວາມພໍໃຈໂດຍລວມ')
    .setBounds(1, 5)
    .setLabels('ບໍ່ພໍໃຈ', 'ພໍໃຈຫຼາຍ')
    .setRequired(true);

  // ── Output URLs ─────────────────────────────────────────────────────────────
  var published = form.getPublishedUrl();
  var edit = form.getEditUrl();
  Logger.log('✅ Form created.');
  Logger.log('PUBLISHED URL (share with testers): ' + published);
  Logger.log('EDIT URL (open to edit the form): ' + edit);

  return { published: published, edit: edit };
}
