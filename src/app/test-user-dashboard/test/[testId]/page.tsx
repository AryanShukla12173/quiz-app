import React from 'react'
import TestPortal from '../TestPortal'
async function  Test({params}: {
  params : Promise<{testId : string}>
}) {
  const testId = (await params).testId
  return (
    <div className='overflow-hidden'>
    <TestPortal testId={testId}/>
    </div>
  )
}

export default Test