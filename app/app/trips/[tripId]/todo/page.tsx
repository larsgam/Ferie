import { getTodos } from '@/lib/data'
import { TodoList } from '@/components/todo-list'

export default async function TodoPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const todos = await getTodos(tripId)
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-3xl font-bold mb-6">Todo</h1>
      <TodoList initial={todos} />
    </main>
  )
}
