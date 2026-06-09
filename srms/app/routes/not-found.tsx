import { useNavigate } from 'react-router'
import { SearchX } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center p-6 text-center">
      <SearchX size={48} className="text-ink-300 mb-6" />

      <p className="text-5xl font-bold text-ink-900">404</p>
      <p className="text-xl font-semibold text-ink-700 mt-2">ບໍ່ພົບໜ້ານີ້</p>
      <p className="text-sm text-ink-500 mt-1">ໜ້າທີ່ທ່ານຊອກຫາບໍ່ມີຢູ່ໃນລະບົບ</p>

      <p className="mt-4 font-mono text-xs text-ink-400 bg-ink-100 rounded-md px-3 py-1.5 inline-block">
        {window.location.pathname}
      </p>

      <div className="mt-8">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          ກັບຄືນ
        </button>
      </div>

      <p className="text-xs text-ink-400 mt-8">
        ຖ້າທ່ານຄິດວ່ານີ້ແມ່ນຄວາມຜິດພາດ ກະລຸນາຕິດຕໍ່ຜູ້ຈັດການ
      </p>
    </div>
  )
}
