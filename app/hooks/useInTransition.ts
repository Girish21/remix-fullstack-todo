import { useTransition } from 'remix'

const useInTransition = () => {
  const transition = useTransition()

  return transition.state === 'loading' || transition.state === 'submitting'
}

export default useInTransition
