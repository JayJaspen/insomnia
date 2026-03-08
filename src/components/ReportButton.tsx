'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  reportedUserId: string
  reportedUsername: string
  messageContent?: string
}

const REASONS = [
  'Trakasserier / mobbning',
  'Hatiskt språk',
  'Spam eller reklam',
  'Sexuellt innehåll',
  'Bedrägeri / falsk identitet',
  'Annat',
]

export default function ReportButton({ reportedUserId, reportedUsername, messageContent }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  async function submit() {
    if (!reason) return
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSending(false); return }

    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      reason,
      message_content: messageContent ?? null,
    })

    setSending(false)
    setDone(true)
    setTimeout(() => { setOpen(false); setDone(false); setReason('') }, 1500)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-600 hover:text-red-400 transition"
        title={`Anmäl ${reportedUsername}`}
      >
        ⚑
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-purple-800 rounded-xl w-full max-w-sm p-5 space-y-4">
            {done ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-green-400 font-semibold">Anmälan skickad</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-white font-bold text-base">Anmäl {reportedUsername}</h2>
                  {messageContent && (
                    <p className="text-xs text-gray-500 mt-1 italic truncate">&ldquo;{messageContent}&rdquo;</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Välj anledning:</p>
                  {REASONS.map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="accent-purple-500"
                      />
                      <span className={`text-sm transition ${reason === r ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {r}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setOpen(false); setReason('') }}
                    className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm hover:text-white transition"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={submit}
                    disabled={!reason || sending}
                    className="flex-1 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-40"
                  >
                    {sending ? 'Skickar...' : 'Skicka anmälan'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
