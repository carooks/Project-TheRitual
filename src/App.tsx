import React, { useState, useEffect } from 'react'
import { Phase, Player, RoundState, OutcomeSummary } from '@/lib/types'
import { buildRoundDeck, nextPhase } from '@/lib/state'
import { ModeSelection } from '@/components/ModeSelection'
import { HostLobby } from '@/components/HostLobby'
import { PlayerJoin } from '@/components/PlayerJoin'
import { useSupabaseMultiplayer } from '@/hooks/useSupabaseMultiplayer'
import Lobby from '@/screens/Lobby'
import Choosing from '@/screens/Choosing'
import Offering from '@/screens/Offering'
import Reveal from '@/screens/Reveal'
import Outcome from '@/screens/Outcome'
import Council from '@/screens/Council'

type AppMode = 'selection' | 'solo-lobby' | 'host-lobby' | 'host-game' | 'player-join' | 'player-game'

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('selection')
  const [roomCode, setRoomCode] = useState<string>('')
  const [playerId, setPlayerId] = useState<string>('')
  const [playerName, setPlayerName] = useState<string>('')
  const multiplayer = useSupabaseMultiplayer()

  const [round, setRound] = useState<RoundState>({
    id: 1,
    players: [],
    deck: [],
    phase: Phase.LOBBY
  })

  // URL routing for /join/:roomCode
  useEffect(() => {
    const path = window.location.pathname
    const joinMatch = path.match(/^\/join\/([A-Za-z0-9]{6})$/i)
    
    if (joinMatch) {
      const codeFromUrl = joinMatch[1].toUpperCase()
      setRoomCode(codeFromUrl)
      setAppMode('player-join')
      window.history.replaceState({}, '', '/')
      return
    }
    
    // Restore session
    const savedSession = localStorage.getItem('multiplayer-session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        const now = Date.now()
        if (session.timestamp && now - session.timestamp < 4 * 60 * 60 * 1000) {
          setRoomCode(session.roomCode)
          setPlayerId(session.playerId)
          setPlayerName(session.playerName)
          
          if (session.isHost) {
            multiplayer.joinRoom(session.roomCode, session.playerName).then(() => {
              if (multiplayer.room?.status === 'in-progress') {
                setAppMode('host-game')
              } else {
                setAppMode('host-lobby')
              }
            })
          } else {
            setAppMode('player-game')
            multiplayer.joinRoom(session.roomCode, session.playerName)
          }
        } else {
          localStorage.removeItem('multiplayer-session')
        }
      } catch (error) {
        localStorage.removeItem('multiplayer-session')
      }
    }
  }, [])

  function handleBegin(players: Player[]) {
    setRound({
      id: 1,
      players,
      deck: [],
      phase: Phase.CHOOSING
    })
  }

  // Mode selection handlers
  const handleModeSelect = async (mode: 'solo' | 'host' | 'join') => {
    if (mode === 'solo') {
      setAppMode('solo-lobby')
    } else if (mode === 'host') {
      try {
        const hostName = prompt('Enter your name:') || 'Host'
        const { roomCode: newRoomCode, playerId: newPlayerId } = await multiplayer.createRoom(hostName)
        
        setRoomCode(newRoomCode)
        setPlayerId(newPlayerId)
        setPlayerName(hostName)
        setAppMode('host-lobby')
        
        localStorage.setItem('multiplayer-session', JSON.stringify({
          roomCode: newRoomCode,
          playerId: newPlayerId,
          playerName: hostName,
          isHost: true,
          timestamp: Date.now(),
        }))
      } catch (error) {
        console.error('Failed to create room:', error)
        alert('Failed to create room. Please check your Supabase configuration.')
      }
    } else if (mode === 'join') {
      setAppMode('player-join')
    }
  }

  const handlePlayerJoin = async (code: string, name: string) => {
    try {
      const newPlayerId = await multiplayer.joinRoom(code, name)
      setRoomCode(code)
      setPlayerId(newPlayerId)
      setPlayerName(name)
      setAppMode('player-game')
      
      localStorage.setItem('multiplayer-session', JSON.stringify({
        roomCode: code,
        playerId: newPlayerId,
        playerName: name,
        isHost: false,
        timestamp: Date.now(),
      }))
    } catch (error) {
      console.error('Failed to join room:', error)
      alert('Failed to join room. Please check the room code.')
    }
  }

  const handleStartGame = async () => {
    if (multiplayer.room) {
      await multiplayer.startGame()
      // Convert multiplayer players to game players
      const gamePlayers: Player[] = multiplayer.room.players.map(p => ({
        id: p.id,
        name: p.name,
        roleId: p.faction || 'villager' // Use faction as roleId
      }))
      setRound({
        id: 1,
        players: gamePlayers,
        deck: [],
        phase: Phase.CHOOSING
      })
      setAppMode('host-game')
    }
  }

  const handleLeave = () => {
    multiplayer.disconnect()
    localStorage.removeItem('multiplayer-session')
    setAppMode('selection')
  }

  function handleElected() {
    setRound({ ...round, phase: Phase.OFFERING })
  }

  function handleProceedToReveal() {
    const deck = buildRoundDeck(round.players, `round-${round.id}`)
    setRound({ ...round, deck, phase: Phase.REVEAL })
  }

  function handleRevealComplete(outcome: OutcomeSummary) {
    setRound({ ...round, outcome, phase: Phase.OUTCOME })
  }

  function handleToCouncil() {
    setRound({ ...round, phase: Phase.COUNCIL })
  }

  function handleNextRound() {
    setRound({
      id: round.id + 1,
      players: round.players,
      deck: [],
      phase: Phase.CHOOSING
    })
  }

  return (
    <div className="app-shell">
      {appMode !== 'selection' && (
        <div className="text-xs text-gray-500">
          Phase: {round.phase} | Round: {round.id}
        </div>
      )}

      {/* Mode Selection */}
      {appMode === 'selection' && <ModeSelection onSelectMode={handleModeSelect} />}

      {/* Solo Lobby */}
      {appMode === 'solo-lobby' && <Lobby onBegin={handleBegin} />}

      {/* Host Lobby - Waiting for players */}
      {appMode === 'host-lobby' && multiplayer.room && (
        <HostLobby
          roomCode={multiplayer.room.code}
          players={multiplayer.room.players}
          onStartGame={handleStartGame}
          onCancel={handleLeave}
        />
      )}

      {/* Player Join Screen */}
      {appMode === 'player-join' && (
        <PlayerJoin
          initialRoomCode={roomCode}
          onJoin={handlePlayerJoin}
          onBack={handleLeave}
        />
      )}

      {/* Game Screens (both host and players) */}
      {(appMode === 'host-game' || appMode === 'player-game') && (
        <>
          {round.phase === Phase.LOBBY && <Lobby onBegin={handleBegin} />}
          {round.phase === Phase.CHOOSING && <Choosing players={round.players} onElected={handleElected} />}
          {round.phase === Phase.OFFERING && <Offering players={round.players} onProceed={handleProceedToReveal} />}
          {round.phase === Phase.REVEAL && <Reveal deck={round.deck} onComplete={handleRevealComplete} />}
          {round.phase === Phase.OUTCOME && round.outcome && <Outcome outcome={round.outcome} onToCouncil={handleToCouncil} />}
          {round.phase === Phase.COUNCIL && <Council players={round.players} onNextRound={handleNextRound} />}
        </>
      )}
    </div>
  )
}
