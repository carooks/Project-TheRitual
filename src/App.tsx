import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Phase, Player, RoundState, OutcomeSummary } from '@/lib/types'
import { buildRoundDeck } from '@/lib/state'
import { ModeSelection } from '@/components/ModeSelection'
import { HostSetup } from '@/components/HostSetup'
import { HostLobby } from '@/components/HostLobby'
import { PlayerJoin } from '@/components/PlayerJoin'
import { PlayerView } from '@/components/PlayerView'
import { TVDisplay } from '@/components/TVDisplay'
import { PlayerGameScreen } from '@/components/PlayerGameScreen'
import { GameSummary } from '@/components/GameSummary'
import { useSupabaseMultiplayer } from '@/hooks/useSupabaseMultiplayer'
import { useGameTimer } from '@/hooks/useGameTimer'
import Lobby from '@/screens/Lobby'
import Choosing from '@/screens/Choosing'
import Offering from '@/screens/Offering'
import Reveal from '@/screens/Reveal'
import Outcome from '@/screens/Outcome'
import Council from '@/screens/Council'
import { MultiplayerSharedState } from '@/lib/multiplayerState'
import { applyIntent, EnginePlayerSeed, GameIntent } from '@/lib/gameEngine'

type AppMode = 'selection' | 'host-setup' | 'solo-lobby' | 'host-lobby' | 'host-game' | 'player-join' | 'player-game' | 'game-summary'

// Player statistics tracking
interface PlayerStats {
  playerId: string;
  playerName: string;
  roleId: any;
  survived: boolean;
  totalCorruption: number;
  ingredientsSelected: string[];
  votesReceived: number;
  correctVotes: number;
  eliminatedRound?: number;
}

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('selection')
  const [roomCode, setRoomCode] = useState<string>('')
  const [playerId, setPlayerId] = useState<string>('')
  const [playerName, setPlayerName] = useState<string>('')
  const [playerRoleId, setPlayerRoleId] = useState<string | undefined>(undefined)
  const [selectedIngredient, setSelectedIngredient] = useState<string | undefined>(undefined)
  const [hasVoted, setHasVoted] = useState(false)
  const [gameStats, setGameStats] = useState<PlayerStats[]>([])
  const [gameWinner, setGameWinner] = useState<'coven' | 'corrupted' | 'draw'>('coven')
  const [sharedGameState, setSharedGameState] = useState<MultiplayerSharedState | null>(null)
  const multiplayer = useSupabaseMultiplayer()
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<MultiplayerSharedState | null>
      setSharedGameState(customEvent.detail ?? null)
    }

    window.addEventListener('gameStateUpdate', handler as EventListener)
    return () => window.removeEventListener('gameStateUpdate', handler as EventListener)
  }, [])

  useEffect(() => {
    if (!playerId || !sharedGameState) return
    const playerStatus = sharedGameState.players[playerId]
    if (playerStatus?.roleId) {
      setPlayerRoleId(playerStatus.roleId)
    }
  }, [playerId, sharedGameState])


  // Game timers
  const choosingTimer = useGameTimer(60) // 60 seconds for choosing
  const councilTimer = useGameTimer(120) // 2 minutes for council discussion

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

  const isHostPlayer = useMemo(() => {
    if (!playerId || !multiplayer.room) return false
    return multiplayer.room.players.some(p => p.id === playerId && p.isHost)
  }, [playerId, multiplayer.room])

  const dispatchGameIntent = useCallback((intent: GameIntent) => {
    if (!isHostPlayer && intent.type !== 'START_GAME') {
      return
    }

    setSharedGameState((prev) => {
      try {
        const nextState = applyIntent(prev, intent, { now: Date.now() })
        void multiplayer.updateGameState(nextState)
        return nextState
      } catch (error) {
        console.error('Failed to apply game intent', intent, error)
        return prev
      }
    })
  }, [isHostPlayer, multiplayer])

  useEffect(() => {
    if (!isHostPlayer) return

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ playerId: string; action: string; data?: any }>
      const payload = customEvent.detail
      if (!payload?.action || !payload.playerId) return

      switch (payload.action) {
        case 'nomination_vote':
          if (payload.data?.targetId) {
            dispatchGameIntent({
              type: 'SUBMIT_NOMINATION_VOTE',
              playerId: payload.playerId,
              targetId: payload.data.targetId,
            })
          }
          break
        case 'ingredient_choice':
          if (payload.data?.ingredientId) {
            dispatchGameIntent({
              type: 'SUBMIT_INGREDIENT',
              playerId: payload.playerId,
              ingredientId: payload.data.ingredientId,
            })
          }
          break
        case 'power_target':
          if (payload.data?.targetId) {
            dispatchGameIntent({
              type: 'SUBMIT_POWER_TARGET',
              playerId: payload.playerId,
              targetId: payload.data.targetId,
            })
          }
          break
        case 'council_vote':
          if (payload.data?.targetId) {
            dispatchGameIntent({
              type: 'SUBMIT_COUNCIL_VOTE',
              playerId: payload.playerId,
              targetId: payload.data.targetId,
            })
          }
          break
        default:
          break
      }
    }

    window.addEventListener('playerAction', handler as EventListener)
    return () => window.removeEventListener('playerAction', handler as EventListener)
  }, [dispatchGameIntent, isHostPlayer])

  useEffect(() => {
    if (!isHostPlayer || !sharedGameState?.phaseExpiresAt) return

    const delay = sharedGameState.phaseExpiresAt - Date.now()
    if (delay <= 0) {
      dispatchGameIntent({ type: 'PHASE_TIMEOUT' })
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatchGameIntent({ type: 'PHASE_TIMEOUT' })
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [dispatchGameIntent, isHostPlayer, sharedGameState?.phase, sharedGameState?.phaseExpiresAt])

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
      setAppMode('host-setup')
    } else if (mode === 'join') {
      setAppMode('player-join')
    }
  }

  const handleHostSetupSubmit = async (hostNameInput: string) => {
    const hostName = hostNameInput.trim() || 'Host'
    try {
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
  }

  const handleCancelHostSetup = () => {
    setAppMode('selection')
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
    if (!isHostPlayer || !multiplayer.room) return

    const actualPlayers = multiplayer.room.players.filter(p => p.name && p.name.trim() !== '')

    if (actualPlayers.length < 3) {
      alert('Need at least 3 players to start the game')
      return
    }

    const seeds: EnginePlayerSeed[] = actualPlayers.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
    }))

    const seed = `${multiplayer.room.id}-${Date.now()}`

    dispatchGameIntent({
      type: 'START_GAME',
      players: seeds,
      seed,
    })

    await multiplayer.startGame()
    setAppMode('host-game')
  }

  const handleLeave = () => {
    multiplayer.disconnect()
    localStorage.removeItem('multiplayer-session')
    setSharedGameState(null)
    setPlayerRoleId(undefined)
    setAppMode('selection')
  }

  function handleElected() {
    setRound({ ...round, phase: Phase.OFFERING })
    choosingTimer.pause()
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
    setHasVoted(false)
    councilTimer.restart()
  }

  function handleNextRound() {
    const nextRoundId = round.id + 1
    setSelectedIngredient(undefined)
    setHasVoted(false)
    setRound({
      id: nextRoundId,
      players: round.players,
      deck: [],
      phase: Phase.CHOOSING
    })
    choosingTimer.restart()
  }

  // Player action handlers
  const handleSelectIngredient = (ingredientId: string) => {
    setSelectedIngredient(ingredientId)
    // Update stats - track ingredient selection and corruption
    setGameStats(prev => prev.map(p => {
      if (p.playerId === playerId) {
        const ingredient = require('@/lib/ingredients').INGREDIENTS[ingredientId]
        return {
          ...p,
          ingredientsSelected: [...p.ingredientsSelected, ingredientId],
          totalCorruption: p.totalCorruption + (ingredient?.corruptionValue || 0)
        }
      }
      return p
    }))
    
    // TODO: Send to Supabase for real-time sync so other corrupted witches can see
    console.log('Selected ingredient:', ingredientId)
  }

  const handleVoteNomination = (votedPlayerId: string) => {
    setHasVoted(true)
    
    // Update stats - track votes received
    setGameStats(prev => prev.map(p => {
      if (p.playerId === votedPlayerId) {
        return { ...p, votesReceived: p.votesReceived + 1 }
      }
      return p
    }))
    
    // Track correct votes (voting for corrupted players)
    const votedPlayer = round.players.find(p => p.id === votedPlayerId)
    if (votedPlayer) {
      const role = require('@/lib/roles').ROLES[votedPlayer.roleId]
      if (role?.team === 'corrupted') {
        setGameStats(prev => prev.map(p => {
          if (p.playerId === playerId) {
            return { ...p, correctVotes: p.correctVotes + 1 }
          }
          return p
        }))
      }
    }
    
    // TODO: Send to Supabase for real-time sync
    console.log('Voted for:', votedPlayerId)
  }
  
  const handlePlayerEliminated = (eliminatedPlayerId: string) => {
    setGameStats(prev => prev.map(p => {
      if (p.playerId === eliminatedPlayerId) {
        return {
          ...p,
          survived: false,
          eliminatedRound: round.id
        }
      }
      return p
    }))
  }
  
  const handleGameEnd = (winner: 'coven' | 'corrupted' | 'draw') => {
    setGameWinner(winner)
    setAppMode('game-summary')
  }
  
  const handlePlayAgain = () => {
    // Reset everything
    setRound({
      id: 1,
      players: [],
      deck: [],
      phase: Phase.LOBBY
    })
    setSelectedIngredient(undefined)
    setAllPlayerSelections({})
    setHasVoted(false)
    setGameStats([])
    setSharedGameState(null)
    setAppMode('host-lobby')
  }
  
  const handleBackToMenu = () => {
    multiplayer.disconnect()
    localStorage.removeItem('multiplayer-session')
    setSharedGameState(null)
    setPlayerRoleId(undefined)
    setAppMode('selection')
  }

  const submitNominationVote = useCallback(async (targetId: string) => {
    try {
      await multiplayer.sendAction('nomination_vote', { targetId })
      setHasVoted(true)
    } catch (error) {
      console.error('Failed to submit nomination vote:', error)
    }
  }, [multiplayer])

  const submitIngredientChoice = useCallback(async (ingredientId: string) => {
    try {
      setSelectedIngredient(ingredientId)
      await multiplayer.sendAction('ingredient_choice', { ingredientId })
    } catch (error) {
      console.error('Failed to submit ingredient choice:', error)
    }
  }, [multiplayer])

  const submitCouncilVote = useCallback(async (targetId: string) => {
    try {
      await multiplayer.sendAction('council_vote', { targetId })
      setHasVoted(true)
    } catch (error) {
      console.error('Failed to submit council vote:', error)
    }
  }, [multiplayer])

  const submitPowerTarget = useCallback(async (targetId: string) => {
    try {
      await multiplayer.sendAction('power_target', { targetId })
    } catch (error) {
      console.error('Failed to use performer power:', error)
    }
  }, [multiplayer])

  const requestAdvancePhase = useCallback(() => {
    if (!isHostPlayer) return
    dispatchGameIntent({ type: 'PHASE_TIMEOUT' })
  }, [dispatchGameIntent, isHostPlayer])

  const beginNominationVotePhase = useCallback(() => {
    if (!isHostPlayer) return
    dispatchGameIntent({ type: 'ADVANCE_FROM_DISCUSSION' })
  }, [dispatchGameIntent, isHostPlayer])

  const activePhase = sharedGameState?.phase ?? round.phase
  const activeRoundNumber = sharedGameState?.roundNumber ?? round.id

  return (
    <div className="app-shell">
      {appMode !== 'selection' && (
        <div className="text-xs text-gray-500">
          Phase: {activePhase} | Round: {activeRoundNumber}
        </div>
      )}

      {/* Mode Selection */}
      {appMode === 'selection' && <ModeSelection onSelectMode={handleModeSelect} />}

      {/* Host setup */}
      {appMode === 'host-setup' && (
        <HostSetup onSubmit={handleHostSetupSubmit} onCancel={handleCancelHostSetup} />
      )}

      {/* Solo Lobby */}
      {appMode === 'solo-lobby' && <Lobby onBegin={handleBegin} />}

      {/* Host Lobby - Waiting for players */}
      {appMode === 'host-lobby' && multiplayer.room && (
        <HostLobby
          roomCode={multiplayer.room.code}
          players={multiplayer.room.players}
          onStartGame={handleStartGame}
          onCancel={handleLeave}
          onToggleReady={(playerId) => multiplayer.toggleReady(playerId)}
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

      {/* Player Lobby - Show PlayerView for joined players */}
      {appMode === 'player-game' && multiplayer.room && multiplayer.room.status === 'lobby' && (
        <PlayerView
          roomCode={roomCode}
          roomId={multiplayer.room?.id || null}
          playerId={playerId}
          playerName={playerName}
          room={multiplayer.room}
          toggleReady={multiplayer.toggleReady}
          sendAction={async () => {}}
          isConnected={true}
          onLeave={handleLeave}
        />
      )}

      {/* Game Screens (both host and players) */}
      {(appMode === 'host-game' || (appMode === 'player-game' && multiplayer.room?.status === 'in-progress')) && (
        <>
          {/* Host sees TV Display */}
          {appMode === 'host-game' && (
            <TVDisplay
              round={round}
              roomCode={roomCode}
              timer={
                round.phase === Phase.CHOOSING ? choosingTimer.timeLeft :
                round.phase === Phase.COUNCIL ? councilTimer.timeLeft :
                undefined
              }
              sharedState={sharedGameState}
              onAdvancePhase={requestAdvancePhase}
              onBeginNomination={beginNominationVotePhase}
            />
          )}

          {/* Players see interactive game screens */}
          {appMode === 'player-game' && (
            <PlayerGameScreen
              playerId={playerId}
              playerName={playerName}
              roomPlayers={multiplayer.room?.players ?? []}
              sharedState={sharedGameState}
              fallbackPhase={round.phase}
              fallbackRound={round.id}
              roleId={playerRoleId}
              localSelection={selectedIngredient}
              hasVoted={hasVoted}
              onSubmitNomination={submitNominationVote}
              onSubmitIngredient={submitIngredientChoice}
              onSubmitCouncil={submitCouncilVote}
              onSubmitPower={submitPowerTarget}
            />
          )}
        </>
      )}

      {/* Game Summary Screen */}
      {appMode === 'game-summary' && (
        <GameSummary
          winner={gameWinner}
          totalRounds={round.id}
          playerStats={gameStats}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  )
}
