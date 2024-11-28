import React from 'react'
import Tutorials from './Tutorials'
import Proximamente from './Proximamente'
import Header from '../common/Header'
import AboutUs from './AboutUs'
import Updates from './Updates'

const NoLoginView = () => {
  return (
    <div className='container'>
      <AboutUs/>
      <Header/>
      <Tutorials/>
      <Proximamente/>
    </div>
  )
}

export default NoLoginView
