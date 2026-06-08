import { useNavigate } from 'react-router'
import { ShieldOff } from 'lucide-react'

export function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center p-6 text-center">
      <ShieldOff size={48} className="text-ink-300 mb-6" />

      <p className="text-5xl font-bold text-ink-900">401</p>
      <p className="text-xl font-semibold text-ink-700 mt-2">ບໍ່ມີສິດເຂົ້າໃຊ້</p>
      <p className="text-sm text-ink-500 mt-1">ທ່ານບໍ່ມີສິດໃນການເຂົ້າໃຊ້ໜ້ານີ້</p>

      <div className="mt-8">
        <button onClick={() => navigate(-1)} className="btn bg-green-light text-white hover:bg-green transition-all duration-300">
          ກັບຄືນ
        </button>
      </div>

      <p className="text-xs text-ink-400 mt-8">
        ຕິດຕໍ່ຜູ້ຈັດການຂອງທ່ານ ຖ້າທ່ານຄິດວ່ານີ້ແມ່ນຄວາມຜິດພາດ
      </p>
    </div>
  )
}
