'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Plus, Send, Image as ImageIcon, X, Flag } from 'lucide-react'
import { calcAge } from '@/lib/utils'
import AdBanner from '@/components/AdBanner'

const MOODS: Record<string, string> = {
  sleepy:'😴', happy:'😊', melancholic:'🌙', thoughtful:'🤔', restless:'⚡',
  anxious:'😰', listening:'🎧', loving:'💜', funny:'😂', stressed:'😤',
}
const GENDERS: Record<string, string> = { man:'♂', kvinna:'♀', annat:'⚧' }

interface Room { id: string; name: string | null; type: string; created_by: string | null }
interface OnlineUser {
  id: string; display_name: string; avatar_id: string; gender: string
  city: string; birth_year: number; mood?: string
}
interface Message {
  id: string; room_id: string; user_id: string; content: string | null
  has_image: boolean; created_at: string
  users?: { display_name: string; avatar_id: string }
}

interface Props {
  currentUser: any
  initialRooms: Room[]
}

export default function ChatView({ currentUser, initialRooms }: Props) {
  const supabase = createClient()
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [text, setText] = useState('')
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [showNewRoom, setShowNewRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomType, setNewRoomType] = useState<'group' | 'private'>('group')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Presence – visa online-användare
  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: { presence: { key: currentUser.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat() as unknown as OnlineUser[]
        setOnlineUsers(users.filter(u => u.id !== currentUser.id))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: currentUser.id,
            display_name: currentUser.display_name,
            avatar_id: currentUser.avatar_id,
            gender: currentUser.gender,
            city: currentUser.city,
            birth_year: currentUser.birth_year,
          })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Hämta meddelanden + prenumerera vid byte av rum
  useEffect(() => {
    if (!activeRoom) return
    setMessages([])

    supabase
      .from('messages')
      .select('*, users(display_name, avatar_id)')
      .eq('room_id', activeRoom.id)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => setMessages(data ?? []))

    const sub = supabase
      .channel(`room:${activeRoom.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${activeRoom.id}`,
      }, (payload) => {
        const msg = payload.new as Message
        // Hämta user info för nya meddelanden
        supabase.from('users').select('display_name, avatar_id')
          .eq('id', msg.user_id).single()
          .then(({ data }) => {
            setMessages(prev => [...prev, { ...msg, users: data ?? undefined }])
          })
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [activeRoom])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!activeRoom || !text.trim()) return
    const content = text.trim()
    setText('')

    // Kontrollera mot banned words
    const res = await fetch('/api/chat/check-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const { allowed, reason } = await res.json()
    if (!allowed) {
      alert(`Meddelandet blockerades: ${reason}`)
      return
    }

    await supabase.from('messages').insert({
      room_id: activeRoom.id,
      user_id: currentUser.id,
      content,
    })
  }

  async function sendImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!activeRoom || !e.target.files?.[0]) return
    const file = e.target.files[0]

    // Validering – MIME-typ och filstorlek (max 8 MB)
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const MAX_SIZE_MB = 8
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Endast JPEG, PNG, GIF och WebP är tillåtna.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Bilden är för stor. Max ${MAX_SIZE_MB} MB.`)
      return
    }

    // Använd alltid korrekt extension baserat på MIME (ej filnamn)
    const EXT_MAP: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png',
      'image/gif': 'gif',  'image/webp': 'webp',
    }
    const ext = EXT_MAP[file.type]
    const path = `${currentUser.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('chat-images').upload(path, file, {
      contentType: file.type,
    })
    if (error) return alert('Uppladdning misslyckades.')

    const { data: msg } = await supabase.from('messages').insert({
      room_id: activeRoom.id,
      user_id: currentUser.id,
      content: null,
      has_image: true,
    }).select().single()

    if (msg) {
      await supabase.from('message_images').insert({
        message_id: msg.id,
        user_id: currentUser.id,
        storage_path: path,
      })
    }
  }

  async function createRoom() {
    if (!newRoomName.trim()) return
    const { data: room } = await supabase.from('chat_rooms').insert({
      name: newRoomName.trim(),
      type: newRoomType,
      created_by: currentUser.id,
    }).select().single()

    if (room) {
      await supabase.from('chat_room_members').insert({
        room_id: room.id, user_id: currentUser.id,
      })
      setRooms(prev => [room, ...prev])
      setActiveRoom(room)
      setShowNewRoom(false)
      setNewRoomName('')
    }
  }

  async function joinRoom(room: Room) {
    // Lägg till som medlem om ej redan med
    await supabase.from('chat_room_members')
      .upsert({ room_id: room.id, user_id: currentUser.id })
    setActiveRoom(room)
  }

  async function sendFriendRequest(userId: string) {
    await supabase.from('friendships').insert({
      requester_id: currentUser.id,
      addressee_id: userId,
    })
    setSelectedUser(null)
    alert('Vänförfrågan skickad!')
  }

  async function submitReport() {
    if (!selectedUser || reportReason.length < 10) return
    await supabase.from('reports').insert({
      reporter_id: currentUser.id,
      reported_id: selectedUser.id,
      reason: reportReason,
    })
    setShowReport(false)
    setReportReason('')
    setSelectedUser(null)
    alert('Anmälan skickad till admin.')
  }

  async function startPrivateChat(userId: string) {
    if (!selectedUser) return
    // Auto-namn: den andra personens visningsnamn (syns bara för de inbjudna)
    const { data: room } = await supabase.from('chat_rooms').insert({
      name: selectedUser.display_name,
      type: 'private',
      created_by: currentUser.id,
    }).select().single()

    if (room) {
      await supabase.from('chat_room_members').insert([
        { room_id: room.id, user_id: currentUser.id },
        { room_id: room.id, user_id: userId },
      ])
      setRooms(prev => [room, ...prev])
      setActiveRoom(room)
      setSelectedUser(null)
    }
  }

  return (
    <div className="flex h-[calc(100vh-60px)]">

      {/* ── Vänster panel: Online-användare & Rum ── */}
      <aside className="w-72 bg-bg-secondary border-r border-accent/20 flex flex-col overflow-hidden">

        {/* Online-användare */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 border-b border-accent/10 flex items-center gap-2">
            <Users size={14} className="text-text-muted" />
            <span className="text-text-muted text-xs uppercase tracking-widest">
              Online ({onlineUsers.length})
            </span>
          </div>
          <div className="py-2">
            {onlineUsers.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-bg-hover transition-colors text-left"
              >
                <div className="relative flex-shrink-0">
                  <img src={`/avatars/${u.avatar_id}.svg`} alt=""
                    className="w-8 h-8 rounded-full bg-bg-card border border-accent/30" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                                   bg-online border border-bg-secondary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-text-primary text-sm font-medium truncate">
                      {u.display_name}
                    </span>
                    {u.mood && <span className="text-xs">{MOODS[u.mood]}</span>}
                  </div>
                  <div className="text-text-muted text-xs flex gap-1">
                    <span>{GENDERS[u.gender]}</span>
                    <span>{calcAge(u.birth_year)} år</span>
                    <span>·</span>
                    <span className="truncate">{u.city}</span>
                  </div>
                </div>
              </button>
            ))}
            {onlineUsers.length === 0 && (
              <p className="text-text-muted text-xs text-center py-6 px-4">
                Inga andra online just nu
              </p>
            )}
          </div>
        </div>

        {/* Chattar */}
        <div className="h-64 border-t border-accent/10 flex flex-col">
          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0">
            <span className="text-text-muted text-xs uppercase tracking-widest">Chattar</span>
            <button onClick={() => setShowNewRoom(true)}
              className="text-accent-light hover:text-white transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => joinRoom(room)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  activeRoom?.id === room.id
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                {room.type === 'private' ? '🔒 ' : '# '}
                {room.name ?? 'Privatchatt'}
              </button>
            ))}
          </div>
        </div>

        {/* CPM-banner i sidebaren */}
        <div className="p-3 border-t border-accent/10 flex justify-center">
          <AdBanner slot="chat-sidebar" size="rectangle" className="!w-full !h-16 !max-w-none" />
        </div>
      </aside>

      {/* ── Chattfönster ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="px-6 py-3 border-b border-accent/20 bg-bg-secondary flex items-center gap-2">
              <span className="font-medium text-text-primary">
                {activeRoom.type === 'private' ? '🔒' : '#'} {activeRoom.name ?? 'Privatchatt'}
              </span>
            </div>

            {/* Meddelanden */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => {
                const isOwn = msg.user_id === currentUser.id
                return (
                  <div key={msg.id}
                    className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwn && (
                      <img
                        src={`/avatars/${msg.users?.avatar_id ?? 'male_01'}.svg`}
                        alt=""
                        className="w-7 h-7 rounded-full bg-bg-card border border-accent/20 flex-shrink-0"
                      />
                    )}
                    <div className={isOwn ? 'bubble-own' : 'bubble-other'}>
                      {!isOwn && (
                        <div className="text-accent-light text-xs font-medium mb-1">
                          {msg.users?.display_name}
                        </div>
                      )}
                      {msg.content && <p className="text-sm">{msg.content}</p>}
                      {msg.has_image && (
                        <ImageMessageContent messageId={msg.id} />
                      )}
                      <div className="text-[10px] text-text-muted mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString('sv-SE', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Inmatning */}
            <div className="px-4 py-3 border-t border-accent/20 bg-bg-secondary">
              <div className="flex gap-2 items-center">
                <label className="text-text-muted hover:text-accent-light cursor-pointer transition-colors p-2">
                  <ImageIcon size={20} />
                  <input type="file" accept="image/*" capture="environment"
                    className="hidden" onChange={sendImage} />
                </label>
                <input
                  className="input flex-1 py-2"
                  placeholder={`Skriv ett meddelande...`}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className="btn-primary py-2 px-4"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center">
              <span className="text-5xl block mb-4">💬</span>
              <p>Välj en chatt eller klicka på en användare</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Användarmodal ── */}
      {selectedUser && !showReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}>
          <div className="glass p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <img src={`/avatars/${selectedUser.avatar_id}.svg`} alt=""
                className="w-16 h-16 rounded-full bg-bg-card border-2 border-accent-light" />
              <div>
                <h3 className="text-text-primary font-bold text-lg">{selectedUser.display_name}</h3>
                <p className="text-text-muted text-sm">
                  {GENDERS[selectedUser.gender]} · {calcAge(selectedUser.birth_year)} år · {selectedUser.city}
                </p>
              </div>
              <button className="ml-auto text-text-muted hover:text-white"
                onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <button className="btn-primary w-full"
                onClick={() => sendFriendRequest(selectedUser.id)}>
                👋 Skicka vänförfrågan
              </button>
              <button className="btn-secondary w-full"
                onClick={() => startPrivateChat(selectedUser.id)}>
                💬 Starta privatchatt
              </button>
              <button className="btn-danger w-full"
                onClick={() => setShowReport(true)}>
                <Flag size={14} className="inline mr-2" />
                Anmäl användaren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Anmälningsformulär ── */}
      {showReport && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass p-6 w-full max-w-sm">
            <h3 className="text-text-primary font-bold mb-4">
              Anmäl {selectedUser.display_name}
            </h3>
            <textarea
              className="input resize-none h-32 mb-4"
              placeholder="Beskriv varför du anmäler den här användaren (minst 10 tecken)..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button className="btn-secondary flex-1"
                onClick={() => { setShowReport(false); setReportReason('') }}>
                Avbryt
              </button>
              <button className="btn-danger flex-1"
                disabled={reportReason.length < 10}
                onClick={submitReport}>
                Skicka anmälan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ny chatt-modal ── */}
      {showNewRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowNewRoom(false)}>
          <div className="glass p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-text-primary font-bold mb-4">Skapa ny chatt</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                {(['group', 'private'] as const).map(t => (
                  <button key={t}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                      newRoomType === t
                        ? 'border-accent-light bg-accent-light/10 text-text-primary'
                        : 'border-accent/30 text-text-muted'
                    }`}
                    onClick={() => setNewRoomType(t)}>
                    {t === 'group' ? '# Gruppchatt' : '🔒 Privat'}
                  </button>
                ))}
              </div>
              <input className="input" placeholder="Chattens namn"
                value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
              <button className="btn-primary w-full" onClick={createRoom}
                disabled={!newRoomName.trim()}>
                Skapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ImageMessageContent({ messageId }: { messageId: string }) {
  const supabase = createClient()
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('message_images')
      .select('storage_path')
      .eq('message_id', messageId)
      .single()
      .then(({ data }) => {
        if (data) {
          const { data: signed } = supabase.storage
            .from('chat-images')
            .getPublicUrl(data.storage_path)
          // Use signed URL for private bucket
          supabase.storage.from('chat-images')
            .createSignedUrl(data.storage_path, 3600)
            .then(({ data: s }) => s?.signedUrl && setUrl(s.signedUrl))
        }
      })
  }, [messageId])

  if (!url) return <div className="w-32 h-32 bg-bg-card rounded-lg animate-pulse" />
  return (
    <img src={url} alt="Bild" className="max-w-[200px] rounded-lg cursor-pointer"
      onClick={() => window.open(url, '_blank')} />
  )
}
