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

  return (
    <div
      className={clsx('flex justify-between items-center', {
        'opacity-30': isDeleted,
      })}
    >
      <div className='flex items-center gap-3 flex-1 overflow-hidden text-xl font-thin text-gray-800'>
        <input
          type='checkbox'
          name='completed'
          defaultChecked={optimisticCompleted}
          className='appearance-none bg-white m-0 font-[inherit] text-current w-[1.15em] h-[1.15em] rounded-[0.15em] border-[0.05em] border-solid border-current focus::outline-none focus-within:outline-none focus-within:ring-2 ring-offset-2 ring-pink-300 grid place-content-center before:w-[0.65em] before:h-[0.65em] before:scale-0 before:transition-transform before:shadow-[inset_1em_1em_#db2777] before:checked:scale-100'
          onChange={(e) => {
            toggle.submit(
              { id, completed: e.target.checked ? 'on' : '' },
              { method: 'post', action: '/todo', replace: true }
            )
          }}
        />
        <div
          contentEditable
          role='textbox'
          className={clsx('flex-1 overflow-hidden', {
            'line-through': optimisticCompleted,
          })}
          dangerouslySetInnerHTML={{ __html: todo }}
        />
      </div>
      <remove.Form
        className='flex-shrink-0'
        method='delete'
        replace
        action='/todo'
      >
        <input hidden defaultValue={id} name='id' />
        <button className='text-red-400 focus-within:outline-none focus-within:rounded-full focus-within:ring-2 ring-offset-2 ring-pink-300 p-1'>
          <Delete />
        </button>
      </remove.Form>
    </div>
  )
}

export default Item
