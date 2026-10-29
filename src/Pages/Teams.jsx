import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function Teams({ teams, onAddTeam, onDeleteTeam, onAddPokemon, onRemoveFromTeam }) {
  const { teamId } = useParams()
  const [pokemons, setPokemons] = useState([])
  const [newTeamName, setNewTeamName] = useState('')
  const [pokemonSearch, setPokemonSearch] = useState('')
  const [visiblePokemonCount, setVisiblePokemonCount] = useState(18)
  const [selectedPokemons, setSelectedPokemons] = useState([])
  const [loadingPokemons, setLoadingPokemons] = useState(true)
  const [pokemonError, setPokemonError] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function fetchPokemons() {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000', {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`PokéAPI gaf een fout (${response.status}).`)
        }

        const data = await response.json()
        setPokemons(data.results.map((pokemon) => {
          const id = Number(pokemon.url.match(/\/pokemon\/(\d+)\/?$/)?.[1])
          return {
            id,
            name: pokemon.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          }
        }))
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          console.error('Pokémon voor nieuw team ophalen mislukt:', fetchError)
          setPokemonError('Pokémon konden niet worden opgehaald. Probeer het later opnieuw.')
        }
      } finally {
        if (!controller.signal.aborted) setLoadingPokemons(false)
      }
    }

    fetchPokemons()
    return () => controller.abort()
  }, [])

  const filteredPokemons = useMemo(() => {
    const query = pokemonSearch.trim().toLowerCase()
    if (!query) return pokemons
    return pokemons.filter((pokemon) => pokemon.name.includes(query))
  }, [pokemons, pokemonSearch])

  const handleAddTeam = (e) => {
    e.preventDefault()
    const name = newTeamName.trim()
    if (!name) {
      setError('Vul een teamnaam in.')
      return
    }
    onAddTeam(name, selectedPokemons)
    setNewTeamName('')
    setSelectedPokemons([])
    setPokemonSearch('')
    setVisiblePokemonCount(18)
    setError('')
  }

  function togglePokemon(pokemon) {
    setSelectedPokemons((selected) => {
      if (selected.some((item) => item.id === pokemon.id)) {
        return selected.filter((item) => item.id !== pokemon.id)
      }
      if (selected.length >= 6) return selected
      return [...selected, pokemon]
    })
  }

  if (teamId) {
    const team = teams.find((item) => String(item.id) === teamId)

    if (!team) {
      return (
        <div className="container py-5 text-center">
          <h1>Team niet gevonden</h1>
          <p className="text-muted">Het opgevraagde team bestaat niet of is verwijderd.</p>
          <Link to="/teams" className="btn btn-primary mt-3">Terug naar Teams</Link>
        </div>
      )
    }

    return (
      <div className="container py-4">
        <Link to="/teams" className="btn btn-outline-secondary btn-sm mb-3">
          ← Terug naar Teams
        </Link>
        <header className="team-detail-header d-flex justify-content-between align-items-center flex-wrap gap-2 text-white p-4 rounded-3 shadow-sm mb-4">
          <div>
            <h1 className="h2 fw-bold text-white mb-1">{team.name}</h1>
            <p className="text-light opacity-75 mb-0">Beheer de Pokémon in dit team.</p>
          </div>
          <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
            {team.pokemons.length} / 6 Pokémon
          </span>
        </header>

        <h2 className="h3 fw-bold mb-3">Pokémon in dit team</h2>
        {team.pokemons.length === 0 ? (
          <p className="text-muted mb-4">Er zitten nog geen Pokémon in dit team.</p>
        ) : (
          <div className="row g-4">
            {team.pokemons.map((pokemon) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={pokemon.id}>
                <article className="card pokemon-card h-100 shadow-sm text-center">
                  <div className="p-3 bg-light rounded-top">
                    <img className="img-fluid" src={pokemon.image} alt={pokemon.name} loading="lazy" />
                  </div>
                  <div className="card-body d-flex flex-column justify-content-between">
                    <h3 className="h5 fw-bold text-capitalize">{pokemon.name}</h3>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onRemoveFromTeam(team.id, pokemon.id)}
                      aria-label={`Verwijder ${pokemon.name} uit ${team.name}`}
                    >
                      Verwijderen uit team
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}

        <section className="mt-5">
          <h2 className="h3 fw-bold mb-3">Pokémon toevoegen</h2>
          <div className="input-group mb-3" style={{ maxWidth: '500px' }}>
            <label className="input-group-text" htmlFor="team-pokemon-search">Zoeken</label>
            <input
              id="team-pokemon-search"
              className="form-control"
              type="search"
              placeholder="Zoek een Pokémon..."
              value={pokemonSearch}
              onChange={(event) => {
                setPokemonSearch(event.target.value)
                setVisiblePokemonCount(18)
              }}
            />
          </div>
          {team.pokemons.length >= 6 && (
            <p className="text-muted">Dit team is vol. Verwijder eerst een Pokémon om er een toe te voegen.</p>
          )}
          {loadingPokemons && <p role="status">Pokémon ophalen uit de PokéAPI...</p>}
          {pokemonError && <div className="alert alert-danger" role="alert">{pokemonError}</div>}
          {!loadingPokemons && !pokemonError && pokemonSearch.trim() && filteredPokemons.length === 0 && (
            <p className="text-muted">Geen Pokémon gevonden.</p>
          )}
          {!loadingPokemons && !pokemonError && filteredPokemons.length > 0 && (
            <>
              <p className="text-muted">
                Kies Pokémon uit de afbeeldingen. {Math.min(visiblePokemonCount, filteredPokemons.length)} van {filteredPokemons.length} getoond.
              </p>
              <div className="row g-3">
                {filteredPokemons.slice(0, visiblePokemonCount).map((pokemon) => {
                  const alreadyInTeam = team.pokemons.some((member) => member.id === pokemon.id)
                  const teamIsFull = team.pokemons.length >= 6
                  return (
                    <div className="col-12 col-sm-6 col-lg-4" key={pokemon.id}>
                      <div className="card p-2 h-100 d-flex flex-row align-items-center gap-3">
                        <img
                          src={pokemon.image}
                          alt=""
                          width="64"
                          height="64"
                          loading="lazy"
                          style={{ objectFit: 'contain' }}
                        />
                        <span className="text-capitalize flex-grow-1">{pokemon.name}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onAddPokemon(team.id, pokemon)}
                          disabled={alreadyInTeam || teamIsFull}
                        >
                          {alreadyInTeam ? 'Toegevoegd' : 'Toevoegen'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {visiblePokemonCount < filteredPokemons.length && (
                <button
                  type="button"
                  className="btn btn-outline-primary mt-3"
                  onClick={() => setVisiblePokemonCount((count) => count + 18)}
                >
                  Toon meer Pokémon
                </button>
              )}
            </>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="fw-bold mb-3">Teams beheren</h1>
      <p className="text-muted mb-4">Maak teams aan en beheer de Pokémon in elk team.</p>

      <form onSubmit={handleAddTeam} className="card shadow-sm p-3 p-md-4 mb-5" aria-label="Nieuw team aanmaken">
        <h2 className="h4 fw-bold mb-3">Nieuw team aanmaken</h2>
        <div className="input-group mb-4" style={{ maxWidth: '500px' }}>
          <label className="input-group-text" htmlFor="new-team-name">Teamnaam</label>
          <input
            id="new-team-name"
            type="text"
            className="form-control"
            placeholder="Bijvoorbeeld: Mijn team"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            maxLength={50}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="new-team-pokemon-search">
            Kies Pokémon ({selectedPokemons.length} / 6)
          </label>
          <input
            id="new-team-pokemon-search"
            className="form-control"
            type="search"
            placeholder="Zoeken (optioneel)..."
            value={pokemonSearch}
            onChange={(event) => {
              setPokemonSearch(event.target.value)
              setVisiblePokemonCount(18)
            }}
          />
        </div>
        {selectedPokemons.length > 0 && (
          <div className="mb-3">
            <p className="mb-2 fw-semibold">Geselecteerde Pokémon</p>
            <ul className="team-member-list">
              {selectedPokemons.map((pokemon) => (
                <li key={pokemon.id} className="selected-team-pokemon">
                  <img src={pokemon.image} alt="" width="44" height="44" />
                  <span className="text-capitalize">{pokemon.name}</span>
                  <button
                    type="button"
                    className="btn-close ms-auto"
                    aria-label={`${pokemon.name} verwijderen uit selectie`}
                    onClick={() => togglePokemon(pokemon)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
        {loadingPokemons && <p role="status">Pokémon ophalen uit de PokéAPI...</p>}
        {pokemonError && <div className="alert alert-danger" role="alert">{pokemonError}</div>}
        {!loadingPokemons && !pokemonError && filteredPokemons.length === 0 && (
          <p className="text-muted">Geen Pokémon gevonden.</p>
        )}
        {!loadingPokemons && !pokemonError && filteredPokemons.length > 0 && (
          <>
            <p className="text-muted">
              Kies Pokémon door op een afbeelding te klikken. {selectedPokemons.length} van 6 gekozen.
            </p>
            <div className="row g-3 mb-4">
              {filteredPokemons.slice(0, visiblePokemonCount).map((pokemon) => {
                const isSelected = selectedPokemons.some((item) => item.id === pokemon.id)
                const selectionIsFull = selectedPokemons.length >= 6
                return (
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={pokemon.id}>
                    <button
                      type="button"
                      className={`team-pokemon-option card h-100 w-100 p-2 ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => togglePokemon(pokemon)}
                      disabled={!isSelected && selectionIsFull}
                      aria-pressed={isSelected}
                      aria-label={`${pokemon.name}${isSelected ? ', gekozen' : ', kiezen'}`}
                    >
                      <img src={pokemon.image} alt="" loading="lazy" />
                      <span className="text-capitalize">{pokemon.name}</span>
                      <span className={`badge ${isSelected ? 'bg-primary' : 'bg-secondary'}`}>
                        {isSelected ? 'Gekozen' : 'Kies'}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
            {visiblePokemonCount < filteredPokemons.length && (
              <button
                type="button"
                className="btn btn-outline-primary mb-4"
                onClick={() => setVisiblePokemonCount((count) => count + 18)}
              >
                Toon meer Pokémon
              </button>
            )}
          </>
        )}
        <button className="btn btn-primary align-self-start" type="submit">
          Team aanmaken
        </button>
      </form>
      {error && <p className="text-danger" role="alert">{error}</p>}

      {teams.length === 0 ? (
        <p className="text-muted py-4">Je hebt nog geen teams. Maak hierboven je eerste team aan.</p>
      ) : (
        <div className="row g-3">
          {teams.map((team) => (
            <div className="col-12 col-md-6" key={team.id}>
              <article className="card team-card shadow-sm p-3 h-100">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <h2 className="h5 fw-bold mb-1">{team.name}</h2>
                    <span className="badge bg-secondary">{team.pokemons.length} / 6 Pokémon</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onDeleteTeam(team.id)}
                    aria-label={`Verwijder team ${team.name}`}
                  >
                    Verwijderen
                  </button>
                </div>
                <div className="team-roster my-3" aria-label="Pokémon in dit team">
                  {Array.from({ length: 6 }, (_, index) => {
                    const pokemon = team.pokemons[index]
                    return pokemon ? (
                      <div className="team-roster-slot" key={pokemon.id}>
                        <img src={pokemon.image} alt="" loading="lazy" />
                        <span className="text-capitalize">{pokemon.name}</span>
                      </div>
                    ) : (
                      <div className="team-roster-slot is-empty" key={`empty-${index}`}>
                        <span aria-hidden="true">＋</span>
                        <span>Vrije plek</span>
                      </div>
                    )
                  })}
                </div>
                <Link to={`/teams/${team.id}`} className="btn btn-primary btn-sm align-self-start mt-auto">
                  Team beheren
                </Link>
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Teams