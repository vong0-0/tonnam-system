import { z } from 'zod'

// Laos phone number formats:
//   Mobile: 020 xx xxx xxx → 020XXXXXXXX (11 digits)
//   Fixed:  021 xxx xxx    → 021XXXXXX   (9 digits)
//   020, 030 prefix = mobile (11 digits)
//   021, 022, ... = landline (9 digits)
export const laoPhone = z
  .string({ error: 'ກະລຸນາໃສ່ເບີໂທລະສັບ' })
  .regex(
    /^(020|030)\d{8}$|^0(21|22|23|24|25|26|28|31|32|33|34|41|42|43|44|51|52|53|54|61|62|63|64|71|72)\d{6}$/,
    'ຮູບແບບເບີໂທບໍ່ຖືກຕ້ອງ'
  )

export const optionalEmail = z
  .string()
  .email('ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ')
  .optional()
  .or(z.literal(''))

export const password = z
  .string({ error: 'ກະລຸນາໃສ່ລະຫັດຜ່ານ' })
  .min(8, 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ')

// Used by: Cancel Bill, Cancel Order Item, Edit Bill Name,
//          Split Bill, Merge Tables, Deactivate User
export const reason = z
  .string({ error: 'ກະລຸນາລະບຸເຫດຜົນ' })
  .min(5, 'ເຫດຜົນຕ້ອງມີຢ່າງໜ້ອຍ 5 ຕົວອັກສອນ')
  .max(300, 'ເຫດຜົນຕ້ອງບໍ່ເກີນ 300 ຕົວອັກສອນ')
