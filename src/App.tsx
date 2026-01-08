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
import { TutorialOverlay } from '@/components/TutorialOverlay'
import { Tutorial, useTutorial } from '@/components/Tutorial'
import { SettingsPanel } from '@/components/SettingsPanel'
import { PostGameSummary } from '@/components/PostGameSummary'
import { useSupabaseMultiplayer } from '@/hooks/useSupabaseMultiplayer'
import { useGameTimer } from '@/hooks/useGameTimer'
import { useKeyboardShortcuts } from '@/hooks/useAccessibility'
import Lobby from '@/screens/Lobby'
import Choosing from '@/screens/Choosing'
import Offering from '@/screens/Offering'
import Reveal from '@/screens/Reveal'
import Outcome from '@/screens/Outcome'
import Council from '@/screens/Council'
import { MultiplayerSharedState } from '@/lib/multiplayerState'
import { applyIntent, EnginePlayerSeed, GameIntent } from '@/lib/gameEngine'

type AppMode = 'selection' | 'host-setup' | 'host-lobby' | 'host-game' | 'player-join' | 'player-game' | 'game-summary'

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
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPostGameSummary, setShowPostGameSummary] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastSession, setLastSession] = useState<any>(null)
  const multiplayer = useSupabaseMultiplayer()
  const tutorial = useTutorial()
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<MultiplayerSharedState | null>
      console.log('[gameStateUpdate] Received update:', customEvent.detail?.phase, customEvent.detail?.roundNumber)
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

  // Detect game end and show summary
  useEffect(() => {
    if (!sharedGameState) return;
    if (sharedGameState.phase === 'GAME_END' && !showPostGameSummary) {
      // Wait a moment before showing summary (let outcome animation finish)
      const timer = setTimeout(() => {
        setShowPostGameSummary(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sharedGameState, showPostGameSummary]);


  // Game timers
  const choosingTimer = useGameTimer(60) // 60 seconds for choosing
  const councilTimer = useGameTimer(120) // 2 minutes for council discussion

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: ',',
      ctrlKey: true,
      handler: () => setShowSettings(true),
      description: 'Open settings',
    },
    {
      key: 'Escape',
      handler: () => {
        if (showSettings) setShowSettings(false);
        if (tutorial.showTutorial) tutorial.setShowTutorial(false);
      },
      description: 'Close modals',
    },
  ], !showSettings && !tutorial.showTutorial);

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
    const lastSessionStr = localStorage.getItem('multiplayer-last-session')
    
    // Check for recent left session first (for rejoin banner)
    if (lastSessionStr && !savedSession) {
      try {
        const lastSess = JSON.parse(lastSessionStr)
        const age = Date.now() - lastSess.timestamp
        if (age < 30 * 60 * 1000) { // 30 minutes
          setLastSession(lastSess)
        } else {
          localStorage.removeItem('multiplayer-last-session')
        }
      } catch (error) {
        console.error('Error parsing last session:', error)
        localStorage.removeItem('multiplayer-last-session')
      }
    }
    
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        const now = Date.now()
        if (session.timestamp && now - session.timestamp < 4 * 60 * 60 * 1000) {
          setRoomCode(session.roomCode)
          setPlayerId(session.playerId)
          setPlayerName(session.playerName)
          
          // Use rejoinRoom to restore existing player state
          multiplayer.rejoinRoom(session.roomCode, session.playerId, session.playerName)
            .then(() => {
              console.log('Rejoined room successfully')
              if (session.isHost) {
                if (multiplayer.room?.status === 'in-progress') {
                  setAppMode('host-game')
                } else {
                  setAppMode('host-lobby')
                }
              } else {
                setAppMode('player-game')
              }
            })
            .catch((error) => {
              console.error('Failed to rejoin room:', error)
              localStorage.removeItem('multiplayer-session')
            })
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
      console.log('[dispatchGameIntent] Non-host tried to dispatch:', intent.type)
      return
    }

    console.log('[dispatchGameIntent] Dispatching intent:', intent.type)
    setSharedGameState((prev) => {
      try {
        const nextState = applyIntent(prev, intent, { now: Date.now() })
        console.log('[dispatchGameIntent] New state phase:', nextState.phase, 'Round:', nextState.roundNumber)
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
        case 'chat_message':
          if (payload.data?.message) {
            // Get player name from multiplayer.room
            const playerInfo = multiplayer.room?.players.find(p => p.id === payload.playerId)
            const playerName = playerInfo?.name || 'Unknown'
            dispatchGameIntent({
              type: 'SEND_CHAT_MESSAGE',
              playerId: payload.playerId,
              playerName,
              message: payload.data.message,
            })
          }
          break
        case 'chat_reaction':
          if (payload.data?.emoji) {
            const playerInfo = multiplayer.room?.players.find(p => p.id === payload.playerId)
            const playerName = playerInfo?.name || 'Unknown'
            dispatchGameIntent({
              type: 'SEND_CHAT_REACTION',
              playerId: payload.playerId,
              playerName,
              emoji: payload.data.emoji,
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
  const handleModeSelect = async (mode: 'host' | 'join') => {
    if (mode === 'host') {
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
    setIsConnecting(true);
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
    } finally {
      setIsConnecting(false);
    }
  }

  const handleStartGame = async (enableInfection: boolean = false, enableCorruption: boolean = false) => {
    if (!isHostPlayer || !multiplayer.room) return

    // Filter out host player unless they explicitly have a non-host role/name
    // Host only participates if they joined as a regular player too
    const actualPlayers = multiplayer.room.players.filter(p => 
      p.name && 
      p.name.trim() !== '' && 
      (!p.isHost || p.name !== 'Host')
    )

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

    // Apply state synchronously to avoid race condition
    try {
      const initialGameState = applyIntent(null, {
        type: 'START_GAME',
        players: seeds,
        seed,
      }, { now: Date.now() })
      
      // Apply optional rulesets to the initial state
      initialGameState.meta.rulesets = {
        enableInfection,
        enableCorruption,
      }
      
      console.log('[handleStartGame] Initial state created:', initialGameState.phase, 'Players:', Object.keys(initialGameState.players).length, 'Rulesets:', initialGameState.meta.rulesets)
      
      // Set state synchronously
      setSharedGameState(initialGameState)
      
      // Broadcast to database
      await multiplayer.updateGameState(initialGameState)
      await multiplayer.startGame()
      
      // Now safe to change mode
      setAppMode('host-game')
    } catch (error) {
      console.error('Failed to start game:', error)
      alert('Failed to start game. Please try again.')
    }
  }

  const handleLeave = async () => {
    // If we're the host, delete the room entirely
    if (isHostPlayer && multiplayer.roomId) {
      await multiplayer.deleteRoom();
    } else {
      // Just disconnect if we're a regular player
      multiplayer.disconnect();
    }
    localStorage.removeItem('multiplayer-session');
    setSharedGameState(null);
    setPlayerRoleId(undefined);
    setAppMode('selection');
  }

  const handleLeaveGame = useCallback(() => {
    // Store session data for potential rejoin
    const sessionData = {
      roomCode,
      playerId,
      playerName,
      isHost: isHostPlayer,
      timestamp: Date.now(),
    }
    localStorage.setItem('multiplayer-last-session', JSON.stringify(sessionData))
    setLastSession(sessionData)
    
    // Disconnect but keep session for rejoin
    multiplayer.disconnect()
    setAppMode('selection')
  }, [roomCode, playerId, playerName, isHostPlayer, multiplayer])

  const handleRejoinLastGame = useCallback(() => {
    const savedSession = localStorage.getItem('multiplayer-last-session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        console.log('Rejoining last game:', session)
        
        setRoomCode(session.roomCode)
        setPlayerId(session.playerId)
        setPlayerName(session.playerName)
        
        multiplayer.rejoinRoom(session.roomCode, session.playerId, session.playerName)
          .then(() => {
            console.log('Rejoined successfully')
            setAppMode(session.isHost ? 'host-game' : 'player-game')
            setLastSession(null)
            localStorage.removeItem('multiplayer-last-session')
          })
          .catch((error) => {
            console.error('Failed to rejoin:', error)
            alert('Failed to rejoin game. The game may have ended.')
            setLastSession(null)
            localStorage.removeItem('multiplayer-last-session')
          })
      } catch (error) {
        console.error('Error parsing session:', error)
        localStorage.removeItem('multiplayer-last-session')
      }
    }
  }, [multiplayer])

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

  const sendChatMessage = useCallback(async (message: string) => {
    try {
      await multiplayer.sendAction('chat_message', { message })
    } catch (error) {
      console.error('Failed to send chat message:', error)
    }
  }, [multiplayer])

  const sendChatReaction = useCallback(async (emoji: string) => {
    try {
      await multiplayer.sendAction('chat_reaction', { emoji })
    } catch (error) {
      console.error('Failed to send chat reaction:', error)
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

  const handleTutorialComplete = useCallback(async () => {
    try {
      setShowTutorial(false)
      if (isHostPlayer) {
        dispatchGameIntent({ type: 'MARK_TUTORIAL_COMPLETE' })
        // Start the phase timer for round 1
        if (sharedGameState?.roundNumber === 1 && sharedGameState.phase === Phase.NOMINATION_DISCUSSION) {
          const updatedState = {
            ...sharedGameState,
            tutorialComplete: true,
            phaseExpiresAt: Date.now() + (sharedGameState.meta?.phaseDurations?.discussionMs ?? 60000)
          }
          setSharedGameState(updatedState)
          // Broadcast timer start to all players
          await multiplayer.updateGameState(updatedState)
        }
      }
    } catch (error) {
      console.error('Error completing tutorial:', error)
      setShowTutorial(false)
    }
  }, [dispatchGameIntent, isHostPlayer, sharedGameState, multiplayer])

  const handleShowTutorial = useCallback(() => {
    try {
      setShowTutorial(true)
    } catch (error) {
      console.error('Error showing tutorial:', error)
    }
  }, [])

  const activePhase = sharedGameState?.phase ?? round.phase
  const activeRoundNumber = sharedGameState?.roundNumber ?? round.id

  // Show tutorial on game start if not completed (host only, to avoid disrupting players mid-game)
  useEffect(() => {
    if (sharedGameState && !sharedGameState.tutorialComplete && appMode === 'host-game' && sharedGameState.roundNumber === 1 && sharedGameState.phase === Phase.NOMINATION_DISCUSSION) {
      setShowTutorial(true)
    }
  }, [sharedGameState?.tutorialComplete, sharedGameState?.roundNumber, sharedGameState?.phase, appMode])

  return (
    <div className="app-shell">
      {/* Rejoin Banner */}
      {lastSession && appMode === 'selection' && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(14, 165, 233, 0.95)',
          border: '2px solid #0ea5e9',
          borderRadius: '12px',
          padding: '16px 24px',
          color: '#f0f9ff',
          boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '500px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              🔄 Rejoin Game?
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Room {lastSession.roomCode} as {lastSession.playerName}
            </div>
          </div>
          <button
            onClick={handleRejoinLastGame}
            style={{
              backgroundColor: '#f0f9ff',
              color: '#0369a1',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Rejoin
          </button>
          <button
            onClick={() => {
              setLastSession(null)
              localStorage.removeItem('multiplayer-last-session')
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#f0f9ff',
              border: '2px solid #f0f9ff',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      
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

      {/* Host Lobby - Waiting for players */}
      {appMode === 'host-lobby' && multiplayer.room && (
        <HostLobby
          roomCode={multiplayer.room.code}
          players={multiplayer.room.players}
          onStartGame={handleStartGame}
          onCancel={handleLeave}
          onToggleReady={(playerId) => multiplayer.toggleReady(playerId)}
          isConnected={multiplayer.isConnected}
        />
      )}

      {/* Player Join Screen */}
      {appMode === 'player-join' && (
        <PlayerJoin
          initialRoomCode={roomCode}
          onJoin={handlePlayerJoin}
          onBack={handleLeave}
          isConnecting={isConnecting}
          isConnected={multiplayer.isConnected}
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

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay 
          onComplete={handleTutorialComplete}
          autoAdvanceMs={8000}
        />
      )}

      {/* Tutorial Component */}
      {tutorial.showTutorial && (
        <Tutorial onComplete={() => tutorial.setShowTutorial(false)} />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)}
          onShowTutorial={() => {
            setShowSettings(false);
            tutorial.resetTutorial();
          }}
        />
      )}

      {/* Settings Button (floating) */}
      {appMode !== 'selection' && !showSettings && !tutorial.showTutorial && (
        <button
          onClick={() => setShowSettings(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(76, 29, 149, 0.9))',
            border: '2px solid rgba(212, 175, 55, 0.5)',
            color: '#e9d5ff',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          aria-label="Open settings"
          title="Settings (Ctrl+,)"
        >
          ⚙️
        </button>
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
              onSendChatMessage={sendChatMessage}
              onSendChatReaction={sendChatReaction}
              onShowHelp={handleShowTutorial}
              onLeaveGame={handleLeaveGame}
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

      {/* Post-Game Summary (Multiplayer) */}
      {showPostGameSummary && sharedGameState && (
        <PostGameSummary
          gameState={sharedGameState}
          playerNames={
            multiplayer.room?.players.reduce((acc, p) => {
              acc[p.id] = p.name;
              return acc;
            }, {} as Record<string, string>) || {}
          }
          onClose={() => setShowPostGameSummary(false)}
          onPlayAgain={isHostPlayer ? () => {
            setShowPostGameSummary(false);
            setAppMode('host-lobby');
            multiplayer.disconnect();
            localStorage.removeItem('multiplayer-session');
          } : undefined}
        />
      )}
    </div>
  )
}
