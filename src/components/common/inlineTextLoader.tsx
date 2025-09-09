const InlineTextLoader = () => (
    <>
  <div className='flex space-x-2 justify-start items-center mt-8 mb-8'>
  <span className='sr-only'>Loading...</span>
    <div className='h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
      <div className='h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
      <div className='h-2 w-2 bg-black rounded-full animate-bounce'></div>
  </div>
    </>
  )
  
  export default InlineTextLoader
  