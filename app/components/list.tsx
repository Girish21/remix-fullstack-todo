import type { Todo } from '@prisma/client'
import { useTransition } from 'remix'
import Item from './item'

type ListProp = { todos: Todo[] }

const List = ({ todos }: ListProp) => {
  const transition = useTransition()

  const optimisticTodos =
    transition.submission && transition.submission.action === '/?index'
      ? [
          ...todos,
          {
            ...Object.fromEntries(transition.submission.formData.entries()),
            id: (todos.length + 1).toString(),
            completed: false,
          } as Todo,
        ]
      : todos

  if (!todos) {
    return null
  }

  return (
    <ul className='flex flex-col gap-4'>
      {optimisticTodos.map((todo) => (
        <Item key={todo.id} {...todo} />
      ))}
    </ul>
  )
}

export default List
