import type { Todo } from '@prisma/client'
import { useId } from '@reach/auto-id'
import { Descendant, useDescendant, useDescendants } from '@reach/descendants'
import {
  createDescendantContext,
  DescendantProvider,
  useDescendantsInit,
  useDescendantKeyDown,
} from '@reach/descendants'
import {
  composeEventHandlers,
  getOwnerDocument,
  makeId,
  useComposedRefs,
  usePrevious,
  useStatefulRefValue,
} from '@reach/utils'
import * as React from 'react'
import { useTransition } from 'remix'
import { tabbable } from 'tabbable'
import { Heading } from './heading'
import Item from './item'

type ListProp = { todos: Todo[] }

type TodoContextType = {
  listId: string
  activeIndex: number
  containerRef: React.RefObject<HTMLElement>
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
}

type DropdownDescendant = Descendant<HTMLElement> & {
  key: string
}

type ListItemsProps = { children: React.ReactNode }
type ListItemProps = { children: React.ReactNode; valueTextProp?: string }

const DescendantContext =
  createDescendantContext<DropdownDescendant>('DescendantContext')
const TodoContext = React.createContext<TodoContextType | null>(null)

const useDescendantContext = () => {
  const context = useDescendants(DescendantContext)

  if (!context) {
    throw new Error(
      'useDescendantContext should be used inside DescendantContext'
    )
  }

  return context
}

const useTodoContext = (): TodoContextType => {
  const context = React.useContext(TodoContext)

  if (!context) {
    throw new Error('useTodoContect should be used inside TodoContext')
  }

  return context
}

const ListProvider: React.FunctionComponent<{}> = ({ children }) => {
  const [descendants, setDescendants] = useDescendantsInit<DropdownDescendant>()
  const [activeIndex, setActiveIndex] = React.useState<number>(-1)
  const containerRef = React.useRef<HTMLElement>(null)
  const _id = useId('todos')
  const listId = makeId('todo', _id)

  return (
    <DescendantProvider
      context={DescendantContext}
      items={descendants}
      set={setDescendants}
    >
      <TodoContext.Provider
        value={{ listId, activeIndex, containerRef, setActiveIndex }}
      >
        {children}
      </TodoContext.Provider>
    </DescendantProvider>
  )
}

function useItemId(index: number | null) {
  let { listId } = useTodoContext()
  return index != null && index > -1
    ? makeId(`todo-${index}`, listId)
    : undefined
}

const useListItems = ({
  ref: forwardedRef,
  onKeyDown,
  ...props
}: ListItemsProps &
  React.ComponentPropsWithoutRef<'ul'> & {
    ref: React.ForwardedRef<HTMLUListElement>
  }) => {
  const { activeIndex, containerRef, listId, setActiveIndex } = useTodoContext()
  let items = useDescendantContext()
  let ref = useComposedRefs(containerRef, forwardedRef)

  let prevItemsLength = usePrevious(items.length)
  let prevSelected = usePrevious(items[activeIndex])
  let prevSelectionIndex = usePrevious(activeIndex)

  React.useEffect(() => {
    if (activeIndex > items.length - 1) {
      setActiveIndex(items.length - 1)
    } else if (
      prevItemsLength !== items.length &&
      activeIndex > -1 &&
      prevSelected &&
      prevSelectionIndex === activeIndex &&
      items[activeIndex] !== prevSelected
    ) {
      setActiveIndex(items.findIndex((i) => i.key === prevSelected?.key))
    }
  }, [])

  const handleKeyDown = useDescendantKeyDown(DescendantContext, {
    currentIndex: activeIndex,
    orientation: 'vertical',
    rotate: true,
    callback: (index: number) => {
      setActiveIndex(index)
      // containerRef.current?.focus()
    },
    key: 'index',
  })

  return {
    props: {
      tabIndex: 0,
      ...props,
      ref,
      id: listId,
      onKeyDown: handleKeyDown,
    },
  }
}

const useListItem = ({
  ref: forwardedRef,
  valueTextProp,
  ...props
}: ListItemProps &
  React.ComponentPropsWithoutRef<'li'> & {
    ref: React.ForwardedRef<HTMLLIElement>
  }) => {
  const { activeIndex, setActiveIndex } = useTodoContext()
  const [valueText, setValueText] = React.useState(valueTextProp || '')

  const setValueTextFromDOM = React.useCallback(
    (node: HTMLElement) => {
      if (!valueTextProp && node?.textContent) {
        setValueText(node.textContent)
      }
    },
    [valueTextProp]
  )

  const ownRef = React.useRef<HTMLElement | null>(null)
  const [element, handleRefSet] = useStatefulRefValue<HTMLElement | null>(
    ownRef,
    null
  )
  const descendant = React.useMemo(() => {
    return {
      element,
      key: valueText,
    }
  }, [element])
  const index = useDescendant(descendant, DescendantContext)
  const isSelected = index === activeIndex

  const ref = useComposedRefs(forwardedRef, handleRefSet, setValueTextFromDOM)

  React.useEffect(() => {
    if (isSelected && ownRef.current) {
      console.log(isSelected)
      const tabbables = tabbable(ownRef.current)
      tabbables?.[1]?.focus()
    }
  }, [isSelected])

  React.useEffect(() => {
    const ownerDocument = getOwnerDocument(ownRef.current)

    function listener() {
      setActiveIndex(-1)
    }

    ownerDocument?.addEventListener('mouseup', listener)

    return () => ownerDocument?.removeEventListener('mouseup', listener)
  }, [setActiveIndex])

  return {
    props: {
      id: useItemId(index),
      tabIndex: -1,
      ...props,
      ref,
      'data-selected': isSelected ? '' : undefined,
      'data-valuetext': valueText,
    },
  }
}

const ListItems = React.forwardRef<
  HTMLUListElement,
  ListItemsProps & React.ComponentPropsWithoutRef<'ul'>
>((originalProps, ref) => {
  const { props } = useListItems({ ...originalProps, ref })

  return <ul {...props} />
})

const ListItem = React.forwardRef<
  HTMLLIElement,
  ListItemsProps & React.ComponentPropsWithoutRef<'li'>
>((originalProps, ref) => {
  const { props } = useListItem({ ...originalProps, ref })

  return <li {...props} />
})

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

  if (!todos || (optimisticTodos && optimisticTodos.length === 0)) {
    return <Heading>No Todos</Heading>
  }

  return (
    <ListProvider>
      <ListItems className='flex flex-col gap-4'>
        {optimisticTodos.map((todo) => (
          <ListItem key={todo.id}>
            <Item {...todo} />
          </ListItem>
        ))}
      </ListItems>
    </ListProvider>
  )
}

export default List
