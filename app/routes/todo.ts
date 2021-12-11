import { ActionFunction, json, redirect } from 'remix'
import invariant from 'tiny-invariant'
import prisma from '~/db.server'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  console.log(request.method)
  const completed = formData.get('completed')
  const id = formData.get('id')

  try {
    invariant(typeof id === 'string')

    if (request.method === 'POST') {
      await prisma.todo.update({
        where: { id },
        data: { completed: completed === 'on' },
      })
    } else if (request.method === 'DELETE') {
      await prisma.todo.delete({ where: { id } })
      const todos = await prisma.todo.findMany()

      if (todos.length === 0) {
        return redirect('/')
      }
    } else {
      throw new Error('Unknown request')
    }

    return json({ ok: true })
  } catch (e) {
    return json({ ok: false }, { status: 400 })
  }
}
