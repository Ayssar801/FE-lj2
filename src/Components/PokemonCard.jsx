import { Link } from 'react-router-dom'

function PokemonCard({ pokemon, name, image, types = [], isFavorite = false, onToggleFavorite }) {
  const cardName = pokemon?.name ?? name
  const cardImage = pokemon?.image ?? image
  const cardTypes = pokemon?.types ?? types
  const formattedName = cardName ? cardName.charAt(0).toUpperCase() + cardName.slice(1) : ''

  return (
    <div className="card pokemon-card h-100 shadow-sm text-center">
      {pokemon?.id && (
        <Link
          className="pokemon-card-details-link"
          to={`/pokemons/${pokemon.id}`}
          aria-label={`Bekijk details van ${formattedName}`}
        />
      )}
      <div className="pokemon-card-image p-3 bg-light rounded-top">
        <img
          src={cardImage}
          alt={formattedName}
          loading="lazy"
          className="img-fluid"
          style={{ height: '130px', objectFit: 'contain' }}
        />
        {onToggleFavorite && (
          <button
            type="button"
            className={`favorite-star${isFavorite ? ' is-favorite' : ''}`}
            onClick={() => onToggleFavorite(pokemon)}
            aria-label={isFavorite ? `${formattedName} verwijderen uit favorieten` : `${formattedName} toevoegen aan favorieten`}
            aria-pressed={isFavorite}
          >
            ★
          </button>
        )}
      </div>
      <div className="card-body d-flex flex-column justify-content-between">
        <h5 className="card-title fw-bold mb-2">
          {pokemon?.id ? (
            <Link className="pokemon-card-name" to={`/pokemons/${pokemon.id}`}>
              {formattedName}
            </Link>
          ) : formattedName}
        </h5>
        <div className="d-flex justify-content-center gap-1 flex-wrap">
          {cardTypes.map((t) => (
            <span key={t} className={`type-badge type-${t}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PokemonCard
