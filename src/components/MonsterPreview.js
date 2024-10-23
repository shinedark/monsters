import React, { useEffect, useState, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { useShapes } from '../context/ShapeContext'
import ShapeDisplay from './ShapeDisplay'
import html2canvas from 'html2canvas'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const spotlightFade = keyframes`
  0% { background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,0,0,1) 50%); }
  100% { background: transparent; }
`

const PreviewContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: black;
  animation: ${fadeIn} 0.5s ease-out, ${spotlightFade} 2s ease-out 0.5s forwards;
  z-index: 1000;
`

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px;
  background: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`

const CanvasContainer = styled.div`
  position: relative;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  background: ${(props) => props.$background};
  background-size: ${(props) => props.$backgroundSize};
  animation: ${(props) => props.$animation}
    ${(props) => props.$animationDuration}s infinite linear;
  transform-style: preserve-3d;
  backface-visibility: hidden;
`

const RecordButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
`

const MonsterPreview = ({
  onClose,
  savedMonsterState,
  backgrounds,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
}) => {
  const { setShapes } = useShapes()
  const [showCloseButton, setShowCloseButton] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ]

    return types.find((type) => MediaRecorder.isTypeSupported(type))
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowCloseButton(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (savedMonsterState) {
      setShapes(savedMonsterState.shapes)
    }
  }, [savedMonsterState, setShapes])

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      const element = document.querySelector('[data-monster-preview]')

      // Create a canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = element.offsetWidth
      canvas.height = element.offsetHeight

      // Function to draw the content to canvas
      const drawFrame = () => {
        html2canvas(element, {
          backgroundColor: null, // Ensure we capture the background
          scale: 1,
          allowTaint: true,
          useCORS: true,
          logging: true,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector(
              '[data-monster-preview]',
            )
            if (clonedElement) {
              // Get the original element's computed styles
              const computedStyle = window.getComputedStyle(element)

              // Explicitly copy the critical styles
              const stylesToCopy = [
                'background',
                'backgroundColor', // Ensure background color is captured
                'backgroundSize',
                'animation',
                'animationDuration',
                'animationTimingFunction',
                'animationIterationCount',
                'width',
                'height',
                'position',
                'transform',
                'transformStyle',
                'backfaceVisibility',
              ]

              stylesToCopy.forEach((style) => {
                clonedElement.style[style] = computedStyle[style]
              })

              // Force the element to take up the full space
              clonedElement.style.width = `${element.offsetWidth}px`
              clonedElement.style.height = `${element.offsetHeight}px`
            }
          },
          // Ensure we capture the full animation
          foreignObjectRendering: true,
          removeContainer: false,
        }).then((renderedCanvas) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(renderedCanvas, 0, 0)
        })
      }

      // Start animation loop
      let animationFrameId
      const animate = () => {
        drawFrame()
        animationFrameId = requestAnimationFrame(animate)
      }
      animate()

      // Start recording from the canvas
      const stream = canvas.captureStream(30) // 30 FPS
      const mimeType = getSupportedMimeType()
      if (!mimeType) {
        alert('Video recording is not supported in this browser')
        return
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Stop the animation loop
        cancelAnimationFrame(animationFrameId)

        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'monster-animation.webm'
        link.click()
        URL.revokeObjectURL(url)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error recording canvas:', error)
    }
  }

  if (!savedMonsterState) return null

  const { backgroundProps, currentBackground } = savedMonsterState
  const currentBackgroundConfig = backgrounds[currentBackground]

  return (
    <PreviewContainer>
      <CanvasContainer
        data-monster-preview
        $size={Math.min(CANVAS_WIDTH, CANVAS_HEIGHT)}
        $background={currentBackgroundConfig.background(backgroundProps.color)}
        $backgroundSize={`${backgroundProps.patternSize}px ${
          backgroundProps.patternSize * 1.75
        }px`}
        $animation={currentBackgroundConfig.animation}
        $animationDuration={11 - backgroundProps.animationSpeed}
      >
        <ShapeDisplay hideEditButtons={true} isPreviewMode={true} />
      </CanvasContainer>
      {showCloseButton && (
        <>
          <CloseButton onClick={onClose}>Close Preview</CloseButton>
          <RecordButton onClick={handleRecord} $isRecording={isRecording}>
            {isRecording ? 'Stop Recording' : 'Record Animation'}
          </RecordButton>
        </>
      )}
    </PreviewContainer>
  )
}

export default MonsterPreview
