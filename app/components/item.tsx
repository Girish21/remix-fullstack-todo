import clsx from 'clsx'
import { useFetcher } from 'remix'
import type { Todo } from '@prisma/client'
import { Delete } from './icons'

const Item = ({ completed, id, todo }: Todo) => {
  const toggle = useFetcher()
  const remove = useFetcher()

  const optimisticCompleted = toggle.submission
    ? Boolean(toggle.submission.formData.get('completed'))
    : completed

  const isDeleted = !!remove.submission

  if (isDeleted) {
    return null
  }

  return (
    <li>
      <div className='flex justify-between items-center'>
        <toggle.Form
          method='post'
          onChange={(e) =>
            toggle.submit(e.currentTarget, {
              method: 'post',
              action: '/todo',
              replace: true,
            })
          }
        >
          <label className='flex items-center gap-3 text-xl font-thin text-gray-800'>
            <input
              type='checkbox'
              name='completed'
              defaultChecked={optimisticCompleted}
              className='appearance-none bg-white m-0 font-[inherit] text-current w-[1.15em] h-[1.15em] rounded-[0.15em] border-[0.05em] border-solid border-current focus::outline-none focus-within:outline-none focus-within:ring-2 ring-offset-2 ring-pink-300 grid place-content-center before:w-[0.65em] before:h-[0.65em] before:scale-0 before:transition-transform before:shadow-[inset_1em_1em_#db2777] before:checked:scale-100'
            />
            <span className={clsx({ 'line-through': optimisticCompleted })}>
              {todo}
            </span>
          </label>
          <input hidden defaultValue={id} name='id' />
        </toggle.Form>
        <remove.Form method='delete' replace action='/todo'>
          <input hidden defaultValue={id} name='id' />
          <button className='text-red-400 focus-within:outline-none focus-within:rounded-full focus-within:ring-2 ring-offset-2 ring-pink-300 p-1'>
            <Delete />
          </button>
        </remove.Form>
      </div>
    </li>
  )
}

export default Item
