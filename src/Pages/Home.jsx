import { Link } from 'react-router-dom'
import pokeballImage from '../assets/image.png'

function Home({ favorites }) {
  const featuredFavorites = favorites.slice(0, 4)
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="welcome-heading">
        <h1 id="welcome-heading">
          Welkom bij
          <br />
          Pokémon Team Manager
        </h1>
        <img className="hero-pokeball" src={pokeballImage} alt="Pokébal" />
        <Link to="/pokemons" className="btn btn-primary btn-sm add-pokemon-button">
          Bekijk alle Pokémon
        </Link>
      </section>

      <section className="featured-section" aria-label="Jouw favoriete Pokémon">
        <h2 className="h4 fw-bold mb-3">Jouw favorieten</h2>
        {featuredFavorites.length > 0 ? (
          <div className="featured-grid">
            {featuredFavorites.map((pokemon) => {
              const formattedName = pokemon.name[0].toUpperCase() + pokemon.name.slice(1)

              return (
                <Link
                  className="featured-card"
                  key={pokemon.id}
                  to={`/pokemons/${pokemon.id}`}
                  aria-label={`Bekijk details van ${formattedName}`}
                >
                  <div className="featured-image-wrap">
                    <img src={pokemon.image} alt={formattedName} />
                  </div>
                  <h2>{formattedName}</h2>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="home-empty">
            <p>Je hebt nog geen favoriete Pokémon gekozen.</p>
            <Link to="/pokemons" className="btn btn-primary btn-sm">
              Kies je favorieten
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
