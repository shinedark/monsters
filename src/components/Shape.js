import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { useShapes } from '../context/ShapeContext'

const ShapeWrapper = styled.div`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  clip-path: ${({ clipPath }) => clipPath};
  background-color: ${({ color }) => color};
  cursor: move;
`

const EditButton = styled.button`
  position: absolute;
  ${({ $position }) => $position};
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 2px 5px;
  font-size: 12px;
  cursor: pointer;
  z-index: 1000;
`

const EditPanel = styled.div`
  position: absolute;
  ${({ $position }) => $position};
  background-color: white;
  border: 1px solid black;
  padding: 5px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const EditControl = styled.div`
  margin: 2px 0;
  display: flex;
  align-items: center;
`

const Label = styled.label`
  margin-right: 5px;
  font-size: 12px;
`

const Shape = ({
  id,
  clipPath,
  color,
  size,
  x,
  y,
  type,
  hideEditButtons,
  className,
  isPreviewMode,
}) => {
  const { updateShape, removeShape, CANVAS_WIDTH, CANVAS_HEIGHT } = useShapes()
  const [isEditing, setIsEditing] = useState(false)
  const editPanelRef = useRef(null)

  const handleDragStart = (e) => {
    const img = new Image()
    img.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleDrag = (e) => {
    if (e.clientX === 0 && e.clientY === 0) return

    const padding = 20 // Adjust this value to change the padding
    const canvasRect = document
      .querySelector('.canvas-class')
      .getBoundingClientRect()

    let newX = e.clientX - canvasRect.left
    let newY = e.clientY - canvasRect.top

    // Constrain x and y within the canvas boundaries
    newX = Math.max(padding, Math.min(newX, CANVAS_WIDTH - size - padding))
    newY = Math.max(padding, Math.min(newY, CANVAS_HEIGHT - size - padding))

    updateShape(id, { x: newX, y: newY })
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setIsEditing(!isEditing)
  }

  const handleColorChange = (e) => {
    updateShape(id, { color: e.target.value })
  }

  const handleSizeChange = (e) => {
    updateShape(id, { size: parseInt(e.target.value) })
  }

  const handleDelete = () => {
    removeShape(id)
  }

  const getEditButtonPosition = () => {
    const canvasWidth = 800 // Adjust this to match your canvas width
    const canvasHeight = 600 // Adjust this to match your canvas height

    if (y < 50) {
      return 'bottom: -25px; left: 0;'
    } else if (y > canvasHeight - 50) {
      return 'top: -25px; left: 0;'
    } else if (x > canvasWidth - 100) {
      return 'top: -25px; right: 0;'
    } else {
      return 'top: -25px; left: 0;'
    }
  }

  const getEditPanelPosition = () => {
    const canvasWidth = 800 // Adjust this to match your canvas width
    const canvasHeight = 600 // Adjust this to match your canvas height

    if (y < 100) {
      return 'top: 100%; left: 0;'
    } else if (y > canvasHeight - 100) {
      return 'bottom: 100%; left: 0;'
    } else if (x > canvasWidth - 150) {
      return 'top: -80px; right: 100%;'
    } else {
      return 'top: -80px; left: 0;'
    }
  }

  const editButtonPosition = getEditButtonPosition()
  const editPanelPosition = getEditPanelPosition()

  return (
    <div
      className={`shape ${className}`}
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <ShapeWrapper
        draggable={!isPreviewMode}
        onDragStart={isPreviewMode ? null : handleDragStart}
        onDrag={isPreviewMode ? null : handleDrag}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          cursor: isPreviewMode ? 'default' : 'move',
        }}
        clipPath={clipPath}
        color={color}
        size={size}
      >
        <div
          style={{
            backgroundColor: color,
            clipPath: clipPath,
            width: '100%',
            height: '100%',
          }}
        />
        {!hideEditButtons && !isPreviewMode && (
          <div>
            <button onClick={handleDelete}>Remove</button>
          </div>
        )}
      </ShapeWrapper>
      {!hideEditButtons && !isPreviewMode && (
        <>
          <EditButton $position={editButtonPosition} onClick={handleEdit}>
            Edit {type}
          </EditButton>
          {isEditing && (
            <EditPanel ref={editPanelRef} $position={editPanelPosition}>
              <EditControl>
                <Label>Color:</Label>
                <input
                  type="color"
                  value={color}
                  onChange={handleColorChange}
                />
              </EditControl>
              <EditControl>
                <Label>Size:</Label>
                <input
                  type="number"
                  value={size}
                  onChange={handleSizeChange}
                  min="10"
                  max="300"
                  style={{ width: '50px' }}
                />
              </EditControl>
              <button onClick={handleDelete}>Delete</button>
            </EditPanel>
          )}
        </>
      )}
    </div>
  )
}

export default Shape
