import React from 'react'

export default function StartStream() {
  return (
    <div>
      <input type="text" placeholder='name of stream'/>
      <input type="text" placeholder='id category (2)'/>
      <input type="file" accept="image/*" placeholder='preview image'/>
    </div>
  )
}
