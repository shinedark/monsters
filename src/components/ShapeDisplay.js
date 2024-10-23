import React from 'react'
import Shape from './Shape'
import { useShapes } from '../context/ShapeContext'

const ShapeDisplay = ({ hideEditButtons, isPreviewMode }) => {
  const { shapes, CANVAS_WIDTH, CANVAS_HEIGHT } = useShapes()

  return (
    <div
      style={{
        position: 'relative',
        width: `${CANVAS_WIDTH}px`,
        height: `${CANVAS_HEIGHT}px`,
        overflow: 'hidden',
      }}
    >
      {shapes.map((shape) => (
        <Shape
          key={shape.id}
          {...shape}
          hideEditButtons={hideEditButtons}
          isPreviewMode={isPreviewMode}
        />
      ))}
    </div>
  )
}

export default ShapeDisplay
