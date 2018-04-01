import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import { one, two } from './shakeMe'
import './styles.scss'

ReactDOM.render(
  <Fragment>
    <h1 className={`nope`}>Page Title!</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident vel culpa totam fugit voluptatibus at cupiditate fugiat dolore autem, eum voluptas ipsam error magnam nesciunt mollitia voluptatum possimus, deserunt dicta.</p>
  </Fragment>,
  document.querySelector('#app'),
  () => console.log('Loaded, bro')
)

two()
console.log('TESTING 123')
