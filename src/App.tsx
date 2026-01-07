import React, { useState, useEffect, useMemo } from 'react'
import { Phase, Player, RoundState, OutcomeSummary, RoleId } from '@/lib/types'
import { buildRoundDeck, nextPhase } from '@/lib/state'
import { assignRandomRoles } from '@/lib/roles'
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

type AppMode = 'selection' | 'host-setup' | 'solo-lobby' | 'host-lobby' | 'host-game' | 'player-join' | 'player-game' | 'game-summary'

interface SharedMultiplayerState {
  roles: Record<string, RoleId>
  performerVotes: Record<string, string>
  performerId: string | null
}

const defaultSharedState: SharedMultiplayerState = {
  roles: {},
  performerVotes: {},
  performerId: null,
}

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
  const [allPlayerSelections, setAllPlayerSelections] = useState<Record<string, string>>({})
  const [hasVoted, setHasVoted] = useState(false)
  const [gameStats, setGameStats] = useState<PlayerStats[]>([])
  const [gameWinner, setGameWinner] = useState<'coven' | 'corrupted' | 'draw'>('coven')
  const [sharedGameState, setSharedGameState] = useState<SharedMultiplayerState | null>(null)
  const multiplayer = useSupabaseMultiplayer()
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<SharedMultiplayerState | null>
      setSharedGameState(customEvent.detail ?? null)
    }

    window.addEventListener('gameStateUpdate', handler as EventListener)
    return () => window.removeEventListener('gameStateUpdate', handler as EventListener)
  }, [])

  useEffect(() => {
    if (!playerId || !sharedGameState) return
    const assignedRole = sharedGameState.roles[playerId]
    if (assignedRole) {
      setPlayerRoleId(assignedRole)
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

  useEffect(() => {
    if (!isHostPlayer) return

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ playerId: string; action: string; data?: any }>
      if (customEvent.detail?.action !== 'nominate_performer') return
      const targetId = customEvent.detail.data?.targetId
      if (!targetId) return

      setSharedGameState(prev => {
        const base = prev ?? defaultSharedState
        const updated: SharedMultiplayerState = {
          ...base,
          performerVotes: {
            ...base.performerVotes,
            [customEvent.detail.playerId]: targetId,
          },
        }
        void multiplayer.updateGameState(updated)
        return updated
      })
    }

    window.addEventListener('playerAction', handler as EventListener)
    return () => window.removeEventListener('playerAction', handler as EventListener)
  }, [isHostPlayer, multiplayer])

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
    if (multiplayer.room) {
      // Filter out empty/invalid players
      const actualPlayers = multiplayer.room.players.filter(p => p.name && p.name.trim() !== '')
      
      if (actualPlayers.length < 2) {
        alert('Need at least 2 players to start the game')
        return
      }
      
      // Assign random secret roles
      const playerCount = actualPlayers.length
      const seed = `${multiplayer.room.id}-${Date.now()}`
      const assignedRoles = assignRandomRoles(playerCount, seed)
      
      const roleAssignments = actualPlayers.reduce((acc, player, index) => {
        acc[player.id] = assignedRoles[index]
        return acc
      }, {} as Record<string, RoleId>)

      const nextSharedState: SharedMultiplayerState = {
        ...defaultSharedState,
        roles: roleAssignments,
      }

      setSharedGameState(nextSharedState)
      await multiplayer.updateGameState(nextSharedState)
      await multiplayer.startGame()
      
      // Convert multiplayer players to game players with assigned roles
      const gamePlayers: Player[] = actualPlayers.map((p, index) => ({
        id: p.id,
        name: p.name,
        roleId: assignedRoles[index] // Secret random role assignment
      }))
      
      // Set role for current player
      const currentPlayerIndex = actualPlayers.findIndex(p => p.id === playerId)
      if (currentPlayerIndex !== -1) {
        setPlayerRoleId(assignedRoles[currentPlayerIndex])
      }
      
      // Initialize game stats
      const initialStats: PlayerStats[] = gamePlayers.map(p => ({
        playerId: p.id,
        playerName: p.name,
        roleId: p.roleId,
        survived: true,
        totalCorruption: 0,
        ingredientsSelected: [],
        votesReceived: 0,
        correctVotes: 0,
      }))
      setGameStats(initialStats)
      
      setRound({
        id: 1,
        players: gamePlayers,
        deck: [],
        phase: Phase.CHOOSING
      })
      setAppMode('host-game')
      
      // Start choosing timer
      choosingTimer.restart()
    }
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
    setSelectedIngredient(undefined)
    setAllPlayerSelections({})
    setHasVoted(false)
    setRound({
      id: round.id + 1,
      players: round.players,
      deck: [],
      phase: Phase.CHOOSING
    })
    choosingTimer.restart()
  }

  // Player action handlers
  const handleSelectIngredient = (ingredientId: string) => {
    setSelectedIngredient(ingredientId)
    // Update all selections
    setAllPlayerSelections(prev => ({
      ...prev,
      [playerId]: ingredientId
    }))
    
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

  const handleNominatePerformer = async (targetId: string) => {
    try {
      await multiplayer.sendAction('nominate_performer', { targetId })
    } catch (error) {
      console.error('Failed to nominate performer:', error)
    }
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
            />
          )}

          {/* Players see interactive game screens */}
          {appMode === 'player-game' && (
            <PlayerGameScreen
              playerId={playerId}
              playerName={playerName}
              players={multiplayer.room?.players ?? []}
              phase={round.phase}
              round={round.id}
              roleId={playerRoleId}
              timer={
                round.phase === Phase.CHOOSING ? choosingTimer.timeLeft :
                round.phase === Phase.COUNCIL ? councilTimer.timeLeft :
                undefined
              }
              onSelectIngredient={handleSelectIngredient}
              onVoteNomination={handleVoteNomination}
              selectedIngredient={selectedIngredient}
              hasVoted={hasVoted}
              allPlayerSelections={allPlayerSelections}
              onNominatePerformer={handleNominatePerformer}
              nominationTargetId={playerId ? sharedGameState?.performerVotes?.[playerId] ?? null : null}
              roleAssignments={sharedGameState?.roles}
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
