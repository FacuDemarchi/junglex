import React from 'react'
import Tutorials from './Tutorials'
import Proximamente from './Proximamente'
import AboutUs from './AboutUs'
import SideNav from './SideNav'
import { Container, Row, Col } from 'react-bootstrap'

const NoLoginView = () => {
  return (
    <Container fluid>
      <Row className="mt-4">
        <Col md={2}>
          <SideNav />
        </Col>
        <Col md={10}>
          <section id="about" className="mb-4">
            <AboutUs />
          </section>
          <section id="tutorials" className="mb-4">
            <Tutorials />
          </section>
          <section id="coming-soon" className="mb-4">
            <Proximamente />
          </section>
        </Col>
      </Row>
    </Container>
  )
}

export default NoLoginView
