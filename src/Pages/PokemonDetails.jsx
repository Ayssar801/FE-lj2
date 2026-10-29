import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function PokemonDetails({ teams, onAddPokemon }) {
  const { pokemonId } = useParams()
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [teamMessage, setTeamMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function fetchPokemon() {
      setLoading(true)
      setError('')
      setSelectedTeamId('')
      setTeamMessage('')

      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`PokéAPI gaf een fout (${response.status}).`)
        }

        setPokemon(await response.json())
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          console.error('Pokémon-details ophalen mislukt:', fetchError)
          setError('De details konden niet worden opgehaald. Probeer het later opnieuw.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchPokemon()
    return () => controller.abort()
  }, [pokemonId])

  function handleAddToTeam() {
    const team = teams.find((item) => String(item.id) === selectedTeamId)
    if (!pokemon || !team) return

    onAddPokemon(team.id, {
      id: pokemon.id,
      name: pokemon.name,
      image:
        pokemon.sprites.other['official-artwork'].front_default ??
        pokemon.sprites.front_default,
    })
    setTeamMessage(`${pokemon.name} is toegevoegd aan ${team.name}.`)
  }

  if (loading) {
    return (
      <div className="container py-5 text-center" role="status">
        <span className="spinner-border text-primary" aria-hidden="true" />
        <p className="mt-3 text-muted">Pokémon-details ophalen...</p>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <Link to="/pokemons" className="btn btn-outline-secondary btn-sm mb-3">
        ← Terug naar Pokémon
      </Link>

      {error ? (
        <div className="alert alert-danger" role="alert">{error}</div>
      ) : pokemon ? (
        <article className="pokemon-details card shadow-sm mx-auto">
          <div className="row g-0 align-items-center">
            <div className="col-12 col-md-5 p-4 bg-light text-center">
              <img
                className="img-fluid"
                src={
                  pokemon.sprites.other['official-artwork'].front_default ??
                  pokemon.sprites.front_default
                }
                alt={pokemon.name}
              />
            </div>
            <div className="col-12 col-md-7 p-4 p-lg-5">
              <p className="text-muted mb-1">#{String(pokemon.id).padStart(3, '0')}</p>
              <h1 className="fw-bold text-capitalize mb-3">{pokemon.name}</h1>

              <h2 className="h5 fw-bold">Types</h2>
              <div className="d-flex gap-2 flex-wrap mb-4">
                {pokemon.types.map(({ type }) => (
                  <span key={type.name} className={`type-badge type-${type.name}`}>
                    {type.name}
                  </span>
                ))}
              </div>

              <div className="row mb-4">
                <div className="col-6">
                  <h2 className="h6 fw-bold">Hoogte</h2>
                  <p>{(pokemon.height / 10).toFixed(1)} m</p>
                </div>
                <div className="col-6">
                  <h2 className="h6 fw-bold">Gewicht</h2>
                  <p>{(pokemon.weight / 10).toFixed(1)} kg</p>
                </div>
              </div>

              <h2 className="h5 fw-bold">Vaardigheden</h2>
              <p className="text-capitalize mb-4">
                {pokemon.abilities.map(({ ability }) => ability.name.replace('-', ' ')).join(', ')}
              </p>

              <section className="add-to-team-panel mb-4" aria-labelledby="add-to-team-heading">
                <h2 id="add-to-team-heading" className="h5 fw-bold">Toevoegen aan een team</h2>
                {teams.length > 0 ? (
                  <>
                    <div className="input-group">
                      <label className="input-group-text" htmlFor="pokemon-team-select">Team</label>
                      <select
                        id="pokemon-team-select"
                        className="form-select"
                        value={selectedTeamId}
                        onChange={(event) => {
                          setSelectedTeamId(event.target.value)
                          setTeamMessage('')
                        }}
                      >
                        <option value="">Kies een team...</option>
                        {teams.map((team) => {
                          const alreadyInTeam = team.pokemons.some((member) => member.id === pokemon.id)
                          const teamIsFull = team.pokemons.length >= 6
                          return (
                            <option
                              key={team.id}
                              value={team.id}
                              disabled={alreadyInTeam || teamIsFull}
                            >
                              {team.name} ({team.pokemons.length}/6
                              {alreadyInTeam ? ', al toegevoegd' : teamIsFull ? ', vol' : ''})
                            </option>
                          )
                        })}
                      </select>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddToTeam}
                        disabled={!selectedTeamId}
                      >
                        Toevoegen
                      </button>
                    </div>
                    {teamMessage && <p className="text-success mb-0 mt-2" role="status">{teamMessage}</p>}
                  </>
                ) : (
                  <p className="text-muted mb-0">
                    Je hebt nog geen teams. <Link to="/teams">Maak eerst een team aan</Link>.
                  </p>
                )}
              </section>

              <h2 className="h5 fw-bold">Stats</h2>
              <ul className="pokemon-stat-list">
                {pokemon.stats.map(({ base_stat: baseStat, stat }) => (
                  <li key={stat.name}>
                    <span className="text-capitalize">{stat.name.replace('-', ' ')}</span>
                    <strong>{baseStat}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ) : (
        <div className="alert alert-danger" role="alert">
          Deze Pokémon kon niet worden gevonden.
        </div>
      )}
    </div>
  )
}

export default PokemonDetails
