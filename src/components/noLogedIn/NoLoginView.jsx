import React from 'react'
import Tutorials from './Tutorials'
import Proximamente from './Proximamente'
import Header from './Header'
import AboutUs from './AboutUs'
import Updates from './Updates'

const NoLoginView = () => {
  return (
    <div className='container'>
      <Header/>
      <Tutorials/>
      <Updates/>
      <Proximamente/>
      <AboutUs/>
    </div>
  )
}

export default NoLoginView
