const Container: React.FunctionComponent<{}> = ({ children }) => (
  <section className='w-[min(90%,40vw)] bg-white rounded-xl shadow-lg shadow-pink-300 space-y-4 relative top-28 p-6 mx-auto'>
    {children}
  </section>
)

export default Container
