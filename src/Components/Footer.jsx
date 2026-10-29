import { Link } from 'react-router-dom'
import pokeballImage from '../assets/image.png'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="footer-brand">
          <img className="brand-pokeball" src={pokeballImage} alt="" />
          <div>
            <strong>Pokémon Team Manager</strong>
            <p>Beheer je Pokémon-team met data uit de officiële PokéAPI.</p>
          </div>
        </div>
        <nav className="footer-nav" aria-label="Footernavigatie">
          <Link to="/">Home</Link>
          <Link to="/pokemons">Pokemons</Link>
          <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>
        </nav>
      </div>
      <div className="site-footer-bottom">
        <small>© 2026 Pokémon Team Manager</small>
      </div>
    </footer>
  )
}

export default Footer