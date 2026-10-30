import { Link } from 'react-router-dom'

const MAX_TEAM_SIZE = 6

function PokemonPicker({
  value,
  options,
  selectedId,
  onSearch,
  onChange,
  onSelect,
  buttonLabel,
  disabled,
}) {
  return (
    <div className="mb-3" style={{ maxWidth: '500px' }}>
      <input
        id="team-pokemon-search"
        className="form-control"
        type="search"
        placeholder="Zoek een Pokémon..."
        value={value}
        onChange={onSearch}
        aria-label="Zoek Pokémon"
      />
      <div className="input-group mt-2">
        <select
          className="form-select"
          value={selectedId}
          onChange={onChange}
          aria-label="Kies een Pokémon"
        >
          <option value="">Kies een Pokémon...</option>
          {options.map((pokemon) => (
            <option key={pokemon.id} value={pokemon.id}>{pokemon.name}</option>
          ))}
        </select>
        <button type="button" className="btn btn-primary" onClick={onSelect} disabled={disabled}>
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

function PokemonStatus({ loading, error, onRetry, noResults = false }) {
  if (loading) return <p role="status">Pokémon ophalen uit de PokéAPI...</p>
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button type="button" className="btn btn-outline-danger btn-sm ms-2" onClick={onRetry}>
          Opnieuw proberen
        </button>
      </div>
    )
  }
  return noResults ? <p className="text-muted">Geen Pokémon gevonden.</p> : null
}

export function TeamNotFound() {
  return (
    <div className="container py-5 text-center">
      <h1>Team niet gevonden</h1>
      <p className="text-muted">Het opgevraagde team bestaat niet of is verwijderd.</p>
      <Link to="/teams" className="btn btn-primary mt-3">Terug naar Teams</Link>
    </div>
  )
}

export function TeamDetails({
  team,
  teamIsFull,
  pokemonOptions,
  search,
  onSearch,
  pokemonId,
  onPokemonChange,
  canAddPokemon,
  onAddPokemon,
  onRemoveFromTeam,
  loading,
  error,
  onRetry,
  total,
}) {
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
          {team.pokemons.length} / {MAX_TEAM_SIZE} Pokémon
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
                <Link
                  className="p-3 bg-light rounded-top d-block"
                  to={`/pokemons/${pokemon.id}`}
                  aria-label={`Bekijk details van ${pokemon.name}`}
                >
                  <img className="img-fluid" src={pokemon.image} alt={pokemon.name} loading="lazy" />
                </Link>
                <div className="card-body d-flex flex-column justify-content-between">
                  <h3 className="h5 fw-bold text-capitalize">
                    <Link className="text-reset text-decoration-none" to={`/pokemons/${pokemon.id}`}>
                      {pokemon.name}
                    </Link>
                  </h3>
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
        <PokemonPicker
          value={search}
          options={pokemonOptions}
          selectedId={pokemonId}
          onSearch={onSearch}
          onChange={onPokemonChange}
          onSelect={onAddPokemon}
          buttonLabel="Toevoegen"
          disabled={!canAddPokemon}
        />
        {teamIsFull && (
          <p className="text-muted">Dit team is vol. Verwijder eerst een Pokémon om er een toe te voegen.</p>
        )}
        <PokemonStatus
          loading={loading}
          error={error}
          onRetry={onRetry}
          noResults={search.trim() && total === 0}
        />
      </section>
    </div>
  )
}

export function TeamCreateForm({
  teamName,
  onTeamNameChange,
  search,
  onSearch,
  selectedPokemons,
  onRemoveSelectedPokemon,
  pokemonOptions,
  pokemonId,
  onPokemonChange,
  canSelectPokemon,
  onSelectPokemon,
  loading,
  pokemonError,
  onRetry,
  total,
  error,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="card shadow-sm p-3 p-md-4 mb-5">
      <h2 className="h4 fw-bold mb-3">Nieuw team aanmaken</h2>
      <div className="input-group mb-4" style={{ maxWidth: '500px' }}>
        <label className="input-group-text" htmlFor="new-team-name">Teamnaam</label>
        <input
          id="new-team-name"
          className="form-control"
          type="text"
          placeholder="Bijvoorbeeld: Mijn team"
          value={teamName}
          onChange={onTeamNameChange}
          maxLength={50}
          required
        />
      </div>
      <PokemonPicker
        value={search}
        options={pokemonOptions}
        selectedId={pokemonId}
        onSearch={onSearch}
        onChange={onPokemonChange}
        onSelect={onSelectPokemon}
        buttonLabel="Selecteren"
        disabled={!canSelectPokemon}
      />
      {selectedPokemons.length > 0 && (
        <ul className="team-member-list mb-3">
          {selectedPokemons.map((pokemon) => (
            <li key={pokemon.id} className="selected-team-pokemon">
              <img src={pokemon.image} alt="" width="44" height="44" />
              <span className="text-capitalize">{pokemon.name}</span>
              <button
                type="button"
                className="btn-close ms-auto"
                aria-label={`${pokemon.name} verwijderen uit selectie`}
                onClick={() => onRemoveSelectedPokemon(pokemon.id)}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="text-muted">
        Kies Pokémon voor je team ({selectedPokemons.length} / {MAX_TEAM_SIZE}).
      </p>
      <PokemonStatus
        loading={loading}
        error={pokemonError}
        onRetry={onRetry}
        noResults={total === 0}
      />
      {error && <p className="text-danger" role="alert">{error}</p>}
      <button className="btn btn-primary align-self-start" type="submit">
        Team aanmaken
      </button>
    </form>
  )
}

export function TeamList({ teams, onDeleteTeam }) {
  if (teams.length === 0) {
    return <p className="text-muted py-4">Je hebt nog geen teams. Maak hierboven je eerste team aan.</p>
  }

  return (
    <div className="row g-3">
      {teams.map((team) => (
        <div className="col-12 col-md-6" key={team.id}>
          <article className="card team-card shadow-sm p-3 h-100">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div>
                <h2 className="h5 fw-bold mb-1">{team.name}</h2>
                <span className="badge bg-secondary">
                  {team.pokemons.length} / {MAX_TEAM_SIZE} Pokémon
                </span>
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
              {Array.from({ length: MAX_TEAM_SIZE }, (_, index) => {
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
  )
}
