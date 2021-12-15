export default function (element: HTMLElement) {
  const range = document.createRange()
  const selection = window.getSelection()
  range.selectNodeContents(element)
  range.collapse()
  selection?.removeAllRanges()
  selection?.addRange(range)
  element.focus()
}
