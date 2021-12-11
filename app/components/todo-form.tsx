import clsx from 'clsx'
import * as React from 'react'
import { Form, FormProps, useTransition } from 'remix'

let TodoForm = (props: FormProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const formRef = React.useRef<HTMLFormElement>(null)
  const submissionStatus = React.useRef<'submitting' | null>(null)

  const transition = useTransition()

  React.useEffect(() => {
    if (transition.state === 'submitting') {
      submissionStatus.current = 'submitting'
    } else if (
      transition.state === 'idle' &&
      submissionStatus.current === 'submitting'
    ) {
      if (inputRef.current && formRef.current) {
        formRef.current.reset()
        inputRef.current.focus()
      }
      submissionStatus.current = null
    }
  }, [transition.state])

  return (
    <Form ref={formRef} method='post' {...props}>
      <fieldset
        disabled={!!transition.submission}
        className='flex items-center gap-4'
      >
        <label htmlFor='todo' className='sr-only'>
          Add Todo
        </label>
        <input
          ref={inputRef}
          id='todo'
          name='todo'
          type='text'
          placeholder='Add Todo'
          className={clsx(
            'bg-gray-100 px-4 py-3 text-xl text-gray-600 flex-1 rounded-lg focus-within:outline-none focus:outline-none focus:ring-2 focus-within:ring-2 ring-pink-300 ring-offset-2',
            !!transition.submission && 'opacity-50 cursor-progress'
          )}
          autoComplete='off'
          required
        />
        <button
          className={clsx(
            'bg-blue-700 text-white px-4 py-3 flex-shrink-0 rounded-lg shadow-md transition-transform hover:scale-105 focus-within:outline-none focus-within:ring-2 ring-pink-300 ring-offset-2',
            !!transition.submission && 'opacity-50 cursor-progress'
          )}
        >
          Create
        </button>
      </fieldset>
    </Form>
  )
}

export default TodoForm
