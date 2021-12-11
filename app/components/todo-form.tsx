import * as React from 'react'
import { Form, FormProps, useTransition } from 'remix'
import { useFetcher } from 'remix'

let TodoForm = (props: FormProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const formRef = React.useRef<HTMLFormElement>(null)

  const transition = useTransition()

  React.useEffect(() => {
    if (
      inputRef.current &&
      formRef.current &&
      transition.state === 'submitting'
    ) {
      inputRef.current.value = ''
      inputRef.current.focus()
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
          className='bg-gray-100 px-4 py-3 text-xl text-gray-600 flex-1 rounded-lg focus-within:outline-none focus:outline-none focus:ring-2 focus-within:ring-2 ring-pink-300 ring-offset-2'
          autoComplete='off'
          required
        />
        <button className='bg-blue-700 text-white px-4 py-3 flex-shrink-0 rounded-lg shadow-md transition-transform hover:scale-105 focus-within:outline-none focus-within:ring-2 ring-pink-300 ring-offset-2'>
          Create
        </button>
      </fieldset>
    </Form>
  )
}

export default TodoForm
