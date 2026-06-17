'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Todo } from '@/lib/types'

export function TodoList({ initial }: { initial: Todo[] }) {
  const [todos, setTodos] = useState(initial)
  const supabase = createClient()

  async function toggle(t: Todo) {
    const next = !t.done
    setTodos(ts => ts.map(x => x.id === t.id ? { ...x, done: next } : x))
    const { error } = await supabase.from('todos').update({ done: next }).eq('id', t.id)
    if (error) setTodos(ts => ts.map(x => x.id === t.id ? { ...x, done: t.done } : x))
  }

  return (
    <ul className="space-y-2">
      {todos.map(t => (
        <li key={t.id} className="flex items-center gap-3">
          <input type="checkbox" checked={t.done} onChange={() => toggle(t)} className="h-5 w-5" />
          <span className={t.done ? 'line-through text-[var(--color-secondary)]' : ''}>{t.text}</span>
        </li>
      ))}
    </ul>
  )
}
