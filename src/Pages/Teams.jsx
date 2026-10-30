import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  TeamCreateForm,
  TeamDetails,
  TeamList,
  TeamNotFound,
} from '../Components/TeamViews'

const MAX_TEAM_SIZE = 6
function Teams({ teams, onAddTeam, onDeleteTeam, onAddPokemon, onRemoveFromTeam }) {
  const { teamId } = useParams()
  const [pokemons, setPokemons] = useState([])
  const [teamName, setTeamName] = useState('')
  const [search, setSearch] = useState('')
  const [selectedPokemons, setSelectedPokemons] = useState([])
  const [selectedPokemonId, setSelectedPokemonId] = useState('')
  const [loading, setLoading] = useState(true)
  const [pokemonError, setPokemonError] = useState('')
  const [formError, setFormError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchPokemons() {
      setLoading(true)
      setPokemonError('')

      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000', {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`PokéAPI gaf een fout (${response.status}).`)

        const data = await response.json()
        setPokemons(data.results.map(({ name, url }) => {
          const id = Number(url.match(/\/pokemon\/(\d+)\/?$/)?.[1])
          return {
            id,
            name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          }
        }))
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Pokémon voor teams ophalen mislukt:', error)
          setPokemonError('Pokémon konden niet worden opgehaald. Probeer het later opnieuw.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchPokemons()
    return () => controller.abort()
  }, [retryCount])

  const filteredPokemons = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? pokemons.filter((pokemon) => pokemon.name.includes(query)) : pokemons
  }, [pokemons, search])

  const team = teams.find((item) => String(item.id) === teamId)
  const teamPokemonIds = new Set(team?.pokemons.map((pokemon) => pokemon.id) ?? [])
  const selectedPokemonIds = new Set(selectedPokemons.map((pokemon) => pokemon.id))
  const selectedPokemon = pokemons.find((pokemon) => String(pokemon.id) === selectedPokemonId)
  const teamIsFull = (team?.pokemons.length ?? 0) >= MAX_TEAM_SIZE
  const retryPokemonFetch = () => setRetryCount((count) => count + 1)

  function handleSearch(event) {
    setSearch(event.target.value)
    setSelectedPokemonId('')
  }

  function addSelectedPokemon() {
    const pokemon = selectedPokemon
    if (!pokemon || selectedPokemons.length >= MAX_TEAM_SIZE || selectedPokemonIds.has(pokemon.id)) return

    setSelectedPokemons([...selectedPokemons, pokemon])
    setSelectedPokemonId('')
  }

  function handleCreateTeam(event) {
    event.preventDefault()
    const name = teamName.trim()
    if (!name) return setFormError('Vul een teamnaam in.')

    onAddTeam(name, selectedPokemons)
    setTeamName('')
    setSelectedPokemons([])
    setSelectedPokemonId('')
    setSearch('')
    setFormError('')
  }

  function addPokemonToTeam() {
    const pokemon = selectedPokemon
    if (!team || !pokemon || teamIsFull || teamPokemonIds.has(pokemon.id)) return

    onAddPokemon(team.id, pokemon)
    setSelectedPokemonId('')
  }

  if (teamId && !team) return <TeamNotFound />

  if (team) {
    return (
      <TeamDetails
        team={team}
        teamIsFull={teamIsFull}
        pokemonOptions={filteredPokemons}
        search={search}
        onSearch={handleSearch}
        pokemonId={selectedPokemonId}
        onPokemonChange={setSelectedPokemonId}
        canAddPokemon={
          Boolean(selectedPokemon) &&
          !teamIsFull &&
          !teamPokemonIds.has(selectedPokemon?.id)
        }
        onAddPokemon={addPokemonToTeam}
        onRemoveFromTeam={onRemoveFromTeam}
        loading={loading}
        error={pokemonError}
        onRetry={retryPokemonFetch}
        total={filteredPokemons.length}
      />
    )
  }

  return (
    <div className="container py-4">
      <h1 className="fw-bold mb-3">Teams beheren</h1>
      <p className="text-muted mb-4">Maak teams aan en beheer de Pokémon in elk team.</p>
      <TeamCreateForm
        teamName={teamName}
        onTeamNameChange={(event) => setTeamName(event.target.value)}
        search={search}
        onSearch={handleSearch}
        selectedPokemons={selectedPokemons}
        onRemoveSelectedPokemon={(id) =>
          setSelectedPokemons(selectedPokemons.filter((pokemon) => pokemon.id !== id))
        }
        pokemonOptions={filteredPokemons}
        pokemonId={selectedPokemonId}
        onPokemonChange={setSelectedPokemonId}
        canSelectPokemon={
          Boolean(selectedPokemon) &&
          selectedPokemons.length < MAX_TEAM_SIZE &&
          !selectedPokemonIds.has(selectedPokemon?.id)
        }
        onSelectPokemon={addSelectedPokemon}
        loading={loading}
        pokemonError={pokemonError}
        onRetry={retryPokemonFetch}
        total={filteredPokemons.length}
        error={formError}
        onSubmit={handleCreateTeam}
      />
      <TeamList teams={teams} onDeleteTeam={onDeleteTeam} />
    </div>
  )
}

export default Teams
