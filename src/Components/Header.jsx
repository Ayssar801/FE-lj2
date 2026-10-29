import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import pokeballImage from '../assets/image.png'

function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" to="/">
          <img className="brand-pokeball" src={pokeballImage} alt="" />
          <span>Pokémon Team Manager</span>
        </Link>
        <nav aria-label="Hoofdnavigatie">
          <Navigation />
        </nav>
      </div>
    </header>
  )
}

export default Header