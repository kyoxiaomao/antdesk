import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import Ant from './components/Ant'
import ControlButton from './components/ControlButton'
import { electronApi } from './env'

const Stage = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

export default function App() {
  const [speed, setSpeed] = useState(120)
  const [resetSignal, setResetSignal] = useState(0)
  const [interactionLock, setInteractionLock] = useState(false)
  const ignoreRef = useRef(true)
  const leaveTimerRef = useRef(0)
  const lastPosRef = useRef({ has: false, x: 0, y: 0 })

  const settings = useMemo(() => ({ speed }), [speed])

  const setIgnore = useCallback((value) => {
    if (!electronApi?.setIgnoreMouseEvents) return
    if (ignoreRef.current === value) return
    ignoreRef.current = value
    electronApi.setIgnoreMouseEvents(value)
  }, [])

  useEffect(() => {
    setIgnore(true)
  }, [setIgnore])

  useEffect(() => {
    const onMove = (e) => {
      lastPosRef.current = { has: true, x: e.clientX, y: e.clientY }
      if (interactionLock) return
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const hit = el && typeof el.closest === 'function' ? el.closest('[data-interactive]') : null

      if (hit) {
        window.clearTimeout(leaveTimerRef.current)
        setIgnore(false)
        return
      }

      window.clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = window.setTimeout(() => setIgnore(true), 120)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.clearTimeout(leaveTimerRef.current)
    }
  }, [interactionLock, setIgnore])

  useEffect(() => {
    window.clearTimeout(leaveTimerRef.current)
    if (interactionLock) {
      setIgnore(false)
      return
    }

    if (!lastPosRef.current.has) {
      setIgnore(true)
      return
    }

    const el = document.elementFromPoint(lastPosRef.current.x, lastPosRef.current.y)
    const hit = el && typeof el.closest === 'function' ? el.closest('[data-interactive]') : null
    setIgnore(!hit)
  }, [interactionLock, setIgnore])

  return (
    <>
      <GlobalStyle />
      <Stage>
        <Ant settings={settings} resetSignal={resetSignal} />
        <ControlButton
          speed={speed}
          onSpeedChange={setSpeed}
          onReset={() => setResetSignal((x) => x + 1)}
          onInteractionLockChange={setInteractionLock}
        />
      </Stage>
    </>
  )
}
