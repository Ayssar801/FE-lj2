import { useState, useEffect } from 'react'
import PokemonCard from '../Components/PokemonCard'

function Pokemons({ favorites, onToggleFavorite }) {
  const [pokemons, setPokemons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchPokemons() {
      setLoading(true)
      setError('')

      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000', {
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error(`PokéAPI gaf een fout (${res.status}).`)
        }

        const data = await res.json()
        const allPokemons = data.results.map((pokemon) => {
          const id = Number(pokemon.url.match(/\/pokemon\/(\d+)\/?$/)?.[1])
          return {
            id,
            name: pokemon.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          }
        })

        setPokemons(allPokemons)
        setError('')
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Pokémon ophalen mislukt:', err)
          setError('Fout bij het ophalen van Pokémon gegevens. Probeer het later opnieuw.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchPokemons()
    return () => controller.abort()
  }, [retryCount])

  const filteredPokemons = pokemons.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  )
  const favoriteIds = new Set(favorites.map((favorite) => favorite.id))
  const favoritePokemons = filteredPokemons.filter((pokemon) => favoriteIds.has(pokemon.id))
  const otherPokemons = filteredPokemons.filter((pokemon) => !favoriteIds.has(pokemon.id))

  function renderPokemonCards(pokemonList) {
    return (
      <div className="row g-4">
        {pokemonList.map((pokemon) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={pokemon.id}>
            <PokemonCard
              pokemon={pokemon}
              isFavorite={favoriteIds.has(pokemon.id)}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container py-4 pokemon-list-page" aria-busy={loading}>
      <div className="text-center mb-4">
        <h1 className="fw-bold text-dark">Pokémon Overzicht</h1>
        <p className="text-muted">Overzicht van Pokémon opgehaald via de PokéAPI.</p>
      </div>

      <div className="row justify-content-center mb-4">
        <div className="col-12 col-md-6">
          <div className="input-group pokemon-search">
            <label className="input-group-text bg-white" htmlFor="pokemon-search">Zoeken</label>
            <input
              id="pokemon-search"
              type="text"
              className="form-control"
              placeholder="Zoek op Pokémonnaam..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Laden...</span>
          </div>
          <p className="mt-3 text-muted">Pokémon ophalen uit de PokéAPI...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
          <div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm mt-2"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-muted text-center" aria-live="polite">
            {filteredPokemons.length} Pokémon gevonden
          </p>
          {filteredPokemons.length > 0 ? (
            <>
              {favoritePokemons.length > 0 && (
                <section className="mb-5" aria-labelledby="favorite-pokemon-heading">
                  <h2 id="favorite-pokemon-heading" className="h3 fw-bold mb-3">
                    ★ Jouw favorieten
                  </h2>
                  {renderPokemonCards(favoritePokemons)}
                </section>
              )}
              {otherPokemons.length > 0 && (
                <section aria-labelledby="all-pokemon-heading">
                  <h2 id="all-pokemon-heading" className="h3 fw-bold mb-3">
                    Alle Pokémon
                  </h2>
                  {renderPokemonCards(otherPokemons)}
                </section>
              )}
            </>
          ) : (
            <p className="text-center py-5">Geen Pokémon gevonden voor “{search}”.</p>
          )}
        </>
      )}
    </div>
  )
}

export default Pokemons
