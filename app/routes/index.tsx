import type { Todo } from '@prisma/client'
import type { ActionFunction, LoaderFunction, MetaFunction } from 'remix'
import { json, redirect, useCatch, useLoaderData } from 'remix'
import invariant from 'tiny-invariant'
import Container from '~/components/container'
import List from '~/components/list'
import TodoForm from '~/components/todo-form'
import prisma from '~/db.server'

type LoaderData = {
  todos: Todo[]
}

type ActionData = {
  error: boolean
}

export const meta: MetaFunction = () => {
  return { title: 'Todos' }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const todo = formData.get('todo')

  if (!todo) {
    return { error: true } as ActionData
  }

  invariant(typeof todo === 'string')

  await prisma.todo.create({ data: { todo, completed: false } })

  return redirect('/')
}

export const loader: LoaderFunction = async () => {
  const todos = await prisma.todo.findMany()

  if (todos.length === 0) {
    throw json(null, { status: 404 })
  }

  return { todos } as LoaderData
}

export default function Index() {
  const { todos } = useLoaderData<LoaderData>()

  return (
    <Container>
      <TodoForm />
      <List todos={todos} />
    </Container>
  )
}

export const CatchBoundary = () => {
  const caught = useCatch()

  switch (caught.status) {
    case 404:
      return (
        <Container>
          <TodoForm />
          <List todos={[]} />
        </Container>
      )
  }
}
