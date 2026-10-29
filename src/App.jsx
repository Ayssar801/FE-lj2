import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './Components/Header'
import Footer from './Components/Footer'
import Home from './Pages/Home'
import Teams from './Pages/Teams'
import Pokemons from './Pages/pokemons'
import PokemonDetails from './Pages/PokemonDetails'

function loadTeams() {
  try {
    const storedTeams = localStorage.getItem('pokemon-teams')
    const parsedTeams = storedTeams ? JSON.parse(storedTeams) : []
    return Array.isArray(parsedTeams) ? parsedTeams : []
  } catch (error) {
    console.error('Teams ophalen uit lokale opslag mislukt:', error)
    return []
  }
}

function loadFavorites() {
  try {
    const storedFavorites = localStorage.getItem('pokemon-favorites')
    const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : []
    return Array.isArray(parsedFavorites)
      ? parsedFavorites.filter(
        (pokemon) =>
          Number.isInteger(pokemon?.id) &&
          typeof pokemon.name === 'string' &&
          typeof pokemon.image === 'string',
      )
      : []
  } catch (error) {
    console.error('Favorieten ophalen uit lokale opslag mislukt:', error)
    return []
  }
}

function App() {
  const [teams, setTeams] = useState(loadTeams)
  const [favorites, setFavorites] = useState(loadFavorites)
  const [storageError, setStorageError] = useState('')

  function saveTeams(nextTeams) {
    setTeams(nextTeams)
    try {
      localStorage.setItem('pokemon-teams', JSON.stringify(nextTeams))
      setStorageError('')
    } catch (error) {
      console.error('Teams opslaan mislukt:', error)
      setStorageError('Teams konden niet worden opgeslagen. Controleer de browseropslag.')
    }
  }

  function addTeam(name, pokemons) {
    saveTeams([
      ...teams,
      { id: `${Date.now()}`, name, pokemons },
    ])
  }

  function deleteTeam(teamId) {
    saveTeams(teams.filter((team) => team.id !== teamId))
  }

  function addPokemonToTeam(teamId, pokemon) {
    saveTeams(
      teams.map((team) => {
        if (team.id !== teamId || team.pokemons.length >= 6) return team
        if (team.pokemons.some((member) => member.id === pokemon.id)) return team
        return { ...team, pokemons: [...team.pokemons, pokemon] }
      }),
    )
  }

  function removePokemonFromTeam(teamId, pokemonId) {
    saveTeams(
      teams.map((team) =>
        team.id === teamId
          ? { ...team, pokemons: team.pokemons.filter((pokemon) => pokemon.id !== pokemonId) }
          : team,
      ),
    )
  }

  function toggleFavorite(pokemon) {
    const nextFavorites = favorites.some((favorite) => favorite.id === pokemon.id)
      ? favorites.filter((favorite) => favorite.id !== pokemon.id)
      : [...favorites, pokemon]

    setFavorites(nextFavorites)
    try {
      localStorage.setItem('pokemon-favorites', JSON.stringify(nextFavorites))
      setStorageError('')
    } catch (error) {
      console.error('Favorieten opslaan mislukt:', error)
      setStorageError('Favorieten konden niet worden opgeslagen. Controleer de browseropslag.')
    }
  }

  return (
    <>
      <Header />
      <main>
        {storageError && (
          <div className="alert alert-danger m-3" role="alert">
            {storageError}
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home favorites={favorites} />} />
          <Route
            path="/teams"
            element={
              <Teams
                teams={teams}
                onAddTeam={addTeam}
                onDeleteTeam={deleteTeam}
                onAddPokemon={addPokemonToTeam}
                onRemoveFromTeam={removePokemonFromTeam}
              />
            }
          />
          <Route
            path="/teams/:teamId"
            element={
              <Teams
                teams={teams}
                onAddTeam={addTeam}
                onDeleteTeam={deleteTeam}
                onAddPokemon={addPokemonToTeam}
                onRemoveFromTeam={removePokemonFromTeam}
              />
            }
          />
          <Route
            path="/pokemons"
            element={
              <Pokemons favorites={favorites} onToggleFavorite={toggleFavorite} />
            }
          />
          <Route
            path="/pokemons/:pokemonId"
            element={
              <PokemonDetails teams={teams} onAddPokemon={addPokemonToTeam} />
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App