import React, { createContext, useState, useContext, useCallback } from 'react'

export const ShapeContext = createContext()

const TEETH_SHAPES = [
  { type: 'triangle', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
  { type: 'square', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
  {
    type: 'rectangle',
    clipPath: 'polygon(25% 0%, 75% 0%, 75% 100%, 25% 100%)',
  },
]

const BODY_SHAPES = [
  { type: 'circle', clipPath: 'circle(50% at 50% 50%)' },
  { type: 'square', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
  { type: 'triangle', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
  {
    type: 'pentagon',
    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  },
  {
    type: 'hexagon',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  },
]

const CANVAS_WIDTH = 800 // Adjust as needed
const CANVAS_HEIGHT = 600 // Adjust as needed
const MAX_SHAPES = 30

const randomColor = () => {
  const hex = Math.floor(Math.random() * 16777215).toString(16)
  return '#' + '0'.repeat(6 - hex.length) + hex // Ensure 6 digits
}

// Add this function to generate unique IDs
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const ShapeProvider = ({ children }) => {
  const [shapes, setShapes] = useState([])
  const [backgroundColor, setBackgroundColor] = useState('#a5cff9')
  const [bodySize, setBodySize] = useState(200)

  const addShape = useCallback(
    (shapeData) => {
      if (shapes.length >= MAX_SHAPES) {
        alert('Maximum number of shapes reached!')
        return
      }

      const bodyShape = shapes.find((shape) => shape.type === 'body')
      let x, y

      if (bodyShape && shapeData.type !== 'body') {
        // Position new shape within the body
        x = bodyShape.x + Math.random() * (bodyShape.size - shapeData.size)
        y = bodyShape.y + Math.random() * (bodyShape.size - shapeData.size)
      } else if (shapeData.type === 'body') {
        // Position body in the center
        x = (CANVAS_WIDTH - shapeData.size) / 2
        y = (CANVAS_HEIGHT - shapeData.size) / 2
      } else {
        // Fallback for when there's no body
        x = Math.random() * (CANVAS_WIDTH - shapeData.size)
        y = Math.random() * (CANVAS_HEIGHT - shapeData.size)
      }

      setShapes((prevShapes) => [
        ...prevShapes,
        {
          id: generateUniqueId(),
          x,
          y,
          ...shapeData,
        },
      ])
    },
    [shapes],
  )

  const updateShape = (id, updatedProperties) => {
    setShapes(
      shapes.map((shape) => {
        if (shape.id === id) {
          const updatedShape = { ...shape, ...updatedProperties }

          // Ensure the shape stays within the body if it exists
          const bodyShape = shapes.find((s) => s.type === 'body')
          if (bodyShape && shape.type !== 'body') {
            updatedShape.x = Math.max(
              bodyShape.x,
              Math.min(
                updatedShape.x,
                bodyShape.x + bodyShape.size - updatedShape.size,
              ),
            )
            updatedShape.y = Math.max(
              bodyShape.y,
              Math.min(
                updatedShape.y,
                bodyShape.y + bodyShape.size - updatedShape.size,
              ),
            )
          }

          return updatedShape
        }
        return shape
      }),
    )
  }

  const updateEyes = (dx, dy) => {
    setShapes(
      shapes.map((shape) => {
        if (shape.type === 'eye' || shape.type === 'pupil') {
          return {
            ...shape,
            x: Math.max(0, Math.min(shape.x + dx, CANVAS_WIDTH - shape.size)),
            y: Math.max(0, Math.min(shape.y + dy, CANVAS_HEIGHT - shape.size)),
          }
        }
        return shape
      }),
    )
  }

  const removeShape = (id) => {
    setShapes(shapes.filter((shape) => shape.id !== id))
  }

  const randomizeBackgroundColor = () => {
    setBackgroundColor(randomColor())
  }

  const clearMonster = useCallback(() => {
    setShapes([])
  }, [])

  const generateMonster = useCallback(() => {
    setShapes([]) // Clear existing shapes
    const newBackgroundColor = randomColor()
    setBackgroundColor(newBackgroundColor)

    // Generate body
    const newBodySize = Math.floor(Math.random() * 200) + 200 // Larger body size
    setBodySize(newBodySize)
    const body = BODY_SHAPES[Math.floor(Math.random() * BODY_SHAPES.length)]
    const bodyX = (CANVAS_WIDTH - newBodySize) / 2
    const bodyY = (CANVAS_HEIGHT - newBodySize) / 2

    addShape({
      clipPath: body.clipPath,
      color: randomColor(),
      size: newBodySize,
      type: 'body',
      x: bodyX,
      y: bodyY,
    })

    // Generate eyes (2)
    const eyeSize = Math.floor(Math.random() * 30) + 20
    const eyePositions = [
      {
        x: bodyX + newBodySize / 4 - eyeSize / 2,
        y: bodyY + newBodySize / 3 - eyeSize / 2,
      },
      {
        x: bodyX + (3 * newBodySize) / 4 - eyeSize / 2,
        y: bodyY + newBodySize / 3 - eyeSize / 2,
      },
    ]

    eyePositions.forEach((position) => {
      // Add eye
      addShape({
        clipPath: 'circle(50% at 50% 50%)',
        color: 'white',
        size: eyeSize,
        type: 'eye',
        x: position.x,
        y: position.y,
      })

      // Add pupil
      const pupilSize = eyeSize / 2
      addShape({
        clipPath: 'circle(50% at 50% 50%)',
        color: 'black',
        size: pupilSize,
        type: 'pupil',
        x: position.x + (eyeSize - pupilSize) / 2,
        y: position.y + (eyeSize - pupilSize) / 2,
      })
    })

    // Generate teeth (1-3)
    const teethCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < teethCount; i++) {
      const tooth =
        TEETH_SHAPES[Math.floor(Math.random() * TEETH_SHAPES.length)]
      const toothSize = Math.floor(Math.random() * 30) + 20
      addShape({
        clipPath: tooth.clipPath,
        color: 'white',
        size: toothSize,
        type: 'tooth',
        x: bodyX + Math.random() * (newBodySize - toothSize),
        y:
          bodyY +
          (newBodySize * 2) / 3 +
          Math.random() * (newBodySize / 3 - toothSize),
      })
    }

    return newBackgroundColor // Return the new background color
  }, [addShape])

  const addEye = () => {
    if (shapes.length >= MAX_SHAPES - 1) {
      alert('Not enough space for both eye and pupil!')
      return
    }

    const bodyShape = shapes.find((shape) => shape.type === 'body')
    if (!bodyShape) {
      alert('Please add a body first!')
      return
    }

    const eyeSize = Math.floor(Math.random() * 30) + 20
    const eyeX = bodyShape.x + Math.random() * (bodyShape.size - eyeSize)
    const eyeY = bodyShape.y + Math.random() * (bodyShape.size - eyeSize)

    addShape({
      clipPath: 'circle(50% at 50% 50%)',
      color: 'white',
      size: eyeSize,
      type: 'eye',
      x: eyeX,
      y: eyeY,
    })

    const pupilSize = eyeSize / 2
    addShape({
      clipPath: 'circle(50% at 50% 50%)',
      color: 'black',
      size: pupilSize,
      type: 'pupil',
      x: eyeX + (eyeSize - pupilSize) / 2,
      y: eyeY + (eyeSize - pupilSize) / 2,
    })
  }

  const addTooth = () => {
    const tooth = TEETH_SHAPES[Math.floor(Math.random() * TEETH_SHAPES.length)]
    addShape({
      clipPath: tooth.clipPath,
      color: 'white',
      size: Math.floor(Math.random() * 30) + 20,
      type: 'tooth',
    })
  }

  const addBodyPart = () => {
    const body = BODY_SHAPES[Math.floor(Math.random() * BODY_SHAPES.length)]
    addShape({
      clipPath: body.clipPath,
      color: randomColor(),
      size: Math.floor(Math.random() * 100) + 50,
      type: 'body',
    })
  }

  return (
    <ShapeContext.Provider
      value={{
        shapes,
        setShapes,
        addShape,
        updateShape,
        removeShape,
        generateMonster,
        randomizeBackgroundColor,
        updateEyes,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        addEye,
        addTooth,
        addBodyPart,
        backgroundColor,
        setBackgroundColor,
        bodySize,
        clearMonster,
      }}
    >
      {children}
    </ShapeContext.Provider>
  )
}

export const useShapes = () => {
  const context = useContext(ShapeContext)
  if (!context) {
    throw new Error('useShapes must be used within a ShapeProvider')
  }
  return context
}
