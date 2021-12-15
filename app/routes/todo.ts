import { ActionFunction, json, redirect } from 'remix'
import invariant from 'tiny-invariant'
import prisma from '~/db.server'

export enum Actions {
  DELETE = '0',
  MARK_STATUS = '1',
  UPDATE = '2',
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const id = formData.get('id')
  const action = formData.get('_action')

  invariant(typeof action === 'string', '_action is required')

  try {
    invariant(typeof id === 'string')

    switch (action) {
      case Actions.DELETE: {
        await prisma.todo.delete({ where: { id } })
        const todos = await prisma.todo.findMany()

        if (todos.length === 0) {
          return redirect('/')
        }
        break
      }
      case Actions.MARK_STATUS: {
        const completed = formData.get('completed')

        invariant(typeof completed === 'string')

        await prisma.todo.update({
          where: { id },
          data: { completed: completed === 'on' },
        })
        break
      }
      case Actions.UPDATE: {
        const todo = formData.get('todo')

        invariant(typeof todo === 'string')

        await prisma.todo.update({ where: { id }, data: { todo } })
        break
      }
      default:
        throw new Error('Unknown request')
    }

    return json({ ok: true })
  } catch (e) {
    return json({ ok: false }, { status: 400 })
  }
}
