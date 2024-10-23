import React, { useState, useRef } from 'react'
import { ShapeProvider, useShapes } from './context/ShapeContext'
import ShapeDisplay from './components/ShapeDisplay'
import styled, { keyframes, css, createGlobalStyle } from 'styled-components'
import MonsterPreview from './components/MonsterPreview'

const backgroundAnimation1 = keyframes`
  from {background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px;}
  to {background-position: 0 0, 0 0, 10px 10px, 9px 20px, 0 0, 10px 20px;}
`

const backgroundAnimation2 = keyframes`
  from {background-size: 30px 15px;}
  to {background-size: 100px 50px;}
`

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }
`

const Button = styled.button`
  padding: 10px 15px;
  font-size: 16px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
  flex: 1;
  min-width: 120px;
`

const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 10px;
  background-color: #f0f0f0;
  border-top: 1px solid #ccc;
  z-index: 10;
`

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f0f0f0;
`

const CanvasContainer = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  padding: 20px; // Add some padding around the canvas
`

const Canvas = styled.div.attrs({ className: 'canvas-class' })`
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  position: relative;
  overflow: visible;
  background: ${(props) => props.$background};
  background-size: ${(props) => props.$backgroundSize};
  ${(props) =>
    props.$animation &&
    css`
      animation: ${props.$animation} ${props.$animationDuration}s infinite
        linear;
    `}
`

const BackgroundControls = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`

const ControlLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`

const backgroundAnimations = {
  bubbles: keyframes`
    0% {
      background-position: 5% 90%, 10% 90%, 10% 90%, 15% 90%, 25% 90%, 25% 90%, 40% 90%, 55% 90%, 70% 90%;
    }
    50% {
      background-position: 0% 80%, 0% 20%, 10% 40%, 20% 0%, 30% 30%, 22% 50%, 50% 50%, 65% 20%, 90% 30%;
    }
    100% {
      background-position: 5% 90%, 10% 90%, 10% 90%, 15% 90%, 25% 90%, 25% 90%, 40% 90%, 55% 90%, 70% 90%;
    }
  `,
  waves: keyframes`
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  `,
  confetti: keyframes`
    0% { background-position: 0 0, 0 0, 0 0; }
    100% { background-position: 500px 1000px, 400px 400px, 300px 300px; }
  `,
}

const backgrounds = [
  {
    name: 'Bubbles',
    animation: backgroundAnimations.bubbles,
    background: (color) => `
      radial-gradient(circle at 5% 90%, ${color} 0%, ${color} 3%, transparent 3.1%, transparent 100%),
      radial-gradient(circle at 10% 90%, ${color} 0%, ${color} 3%, transparent 3.1%, transparent 100%),
      radial-gradient(circle at 10% 90%, ${color} 0%, ${color} 4%, transparent 4.1%, transparent 100%),
      radial-gradient(circle at 15% 90%, ${color} 0%, ${color} 5%, transparent 5.1%, transparent 100%),
      radial-gradient(circle at 25% 90%, ${color} 0%, ${color} 5%, transparent 5.1%, transparent 100%),
      radial-gradient(circle at 25% 90%, ${color} 0%, ${color} 7%, transparent 7.1%, transparent 100%),
      radial-gradient(circle at 40% 90%, ${color} 0%, ${color} 12%, transparent 12.1%, transparent 100%),
      radial-gradient(circle at 55% 90%, ${color} 0%, ${color} 10%, transparent 10.1%, transparent 100%),
      radial-gradient(circle at 70% 90%, ${color} 0%, ${color} 4%, transparent 4.1%, transparent 100%)
    `,
  },
  {
    name: 'Waves',
    animation: backgroundAnimations.waves,
    background: (color) => `
      linear-gradient(60deg, ${color} 6%, transparent 6.5%, transparent 93.5%, ${color} 94%, ${color} 0),
      linear-gradient(-60deg, ${color} 6%, transparent 6.5%, transparent 93.5%, ${color} 94%, ${color} 0),
      linear-gradient(60deg, ${color} 6%, transparent 6.5%, transparent 93.5%, ${color} 94%, ${color} 0),
      linear-gradient(-60deg, ${color} 6%, transparent 6.5%, transparent 93.5%, ${color} 94%, ${color} 0),
      linear-gradient(30deg, ${color} 12.5%, transparent 13%, transparent 87%, ${color} 87.5%, ${color} 0),
      linear-gradient(30deg, ${color} 12.5%, transparent 13%, transparent 87%, ${color} 87.5%, ${color} 0)
    `,
  },
  {
    name: 'Confetti',
    animation: backgroundAnimations.confetti,
    background: (color) => `
      linear-gradient(90deg, ${color} 10%, transparent 10%),
      linear-gradient(90deg, ${color} 10%, transparent 10%),
      linear-gradient(90deg, ${color} 10%, transparent 10%)
    `,
  },
]

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const LoadingText = styled.div`
  color: white;
  font-size: 24px;
`

const MonsterControls = ({
  hideEditButtons,
  setHideEditButtons,
  canvasRef,
  changeBackground,
  backgroundProps,
  setBackgroundProps,
  generateMonster,
  saveAndPreview,
}) => {
  const { addEye, addTooth, addBodyPart } = useShapes()

  const handleGenerateMonster = () => {
    const newColor = generateMonster()
    setBackgroundProps((prev) => ({ ...prev, color: newColor }))
  }

  const handleColorChange = (e) => {
    setBackgroundProps((prev) => ({ ...prev, color: e.target.value }))
  }

  const handleSpeedChange = (e) => {
    setBackgroundProps((prev) => ({
      ...prev,
      animationSpeed: Number(e.target.value),
    }))
  }

  const handleSizeChange = (e) => {
    setBackgroundProps((prev) => ({
      ...prev,
      patternSize: Number(e.target.value),
    }))
  }

  return (
    <ControlPanel>
      <Button onClick={handleGenerateMonster}>Generate Monster</Button>
      <Button onClick={changeBackground}>Change Background</Button>
      <Button onClick={addEye}>Add Eye</Button>
      <Button onClick={addTooth}>Add Tooth</Button>
      <Button onClick={addBodyPart}>Add Body Part</Button>
      <Button onClick={() => setHideEditButtons(!hideEditButtons)}>
        {hideEditButtons ? 'Show Edit Buttons' : 'Hide Edit Buttons'}
      </Button>
      <Button onClick={saveAndPreview}>Save and Preview</Button>
      <BackgroundControls>
        <ControlLabel>
          Background Color:
          <input
            type="color"
            value={backgroundProps.color || '#ffffff'}
            onChange={handleColorChange}
          />
        </ControlLabel>
        <ControlLabel>
          Animation Speed:
          <input
            type="range"
            min="1"
            max="10"
            value={backgroundProps.animationSpeed || 5}
            onChange={handleSpeedChange}
          />
        </ControlLabel>
        <ControlLabel>
          Pattern Size:
          <input
            type="range"
            min="50"
            max="200"
            value={backgroundProps.patternSize || 100}
            onChange={handleSizeChange}
          />
        </ControlLabel>
      </BackgroundControls>
    </ControlPanel>
  )
}

const AppContent = () => {
  const {
    backgroundColor,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    generateMonster,
    setBackgroundColor,
    shapes,
  } = useShapes()
  const [hideEditButtons, setHideEditButtons] = useState(false)
  const [currentBackground, setCurrentBackground] = useState(0)
  const [backgroundProps, setBackgroundProps] = useState({
    color: backgroundColor,
    animationSpeed: 5,
    patternSize: 100,
  })
  const [showPreview, setShowPreview] = useState(false)
  const [savedMonsterState, setSavedMonsterState] = useState(null)
  const canvasRef = useRef(null)

  const changeBackground = () => {
    setCurrentBackground((prev) => (prev + 1) % backgrounds.length)
  }

  const currentBackgroundConfig = backgrounds[currentBackground]
  const backgroundSize = `${backgroundProps.patternSize}px ${
    backgroundProps.patternSize * 1.75
  }px`

  const handleGenerateMonster = () => {
    const newColor = generateMonster()
    setBackgroundColor(newColor)
    return newColor
  }

  const saveAndPreview = () => {
    const monsterState = {
      shapes: shapes,
      backgroundProps: backgroundProps,
      currentBackground: currentBackground,
    }
    setSavedMonsterState(monsterState)
    setShowPreview(true)
  }

  return (
    <AppContainer>
      {!showPreview && (
        <>
          <CanvasContainer>
            <Canvas
              ref={canvasRef}
              $width={CANVAS_WIDTH}
              $height={CANVAS_HEIGHT}
              $background={currentBackgroundConfig.background(
                backgroundProps.color,
              )}
              $backgroundSize={backgroundSize}
              $animation={currentBackgroundConfig.animation}
              $animationDuration={11 - backgroundProps.animationSpeed}
            >
              <ShapeDisplay hideEditButtons={hideEditButtons} />
            </Canvas>
          </CanvasContainer>
          <MonsterControls
            hideEditButtons={hideEditButtons}
            setHideEditButtons={setHideEditButtons}
            canvasRef={canvasRef}
            changeBackground={changeBackground}
            backgroundProps={backgroundProps}
            setBackgroundProps={setBackgroundProps}
            generateMonster={handleGenerateMonster}
            saveAndPreview={saveAndPreview}
          />
        </>
      )}
      {showPreview && (
        <MonsterPreview
          onClose={() => setShowPreview(false)}
          savedMonsterState={savedMonsterState}
          backgrounds={backgrounds}
          CANVAS_WIDTH={CANVAS_WIDTH}
          CANVAS_HEIGHT={CANVAS_HEIGHT}
        />
      )}
    </AppContainer>
  )
}

const App = () => {
  return (
    <ShapeProvider>
      <AppContent />
    </ShapeProvider>
  )
}

export default App
