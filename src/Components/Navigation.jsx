import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <ul className="site-nav">
      <li className="nav-item">
        <NavLink to="/">Home</NavLink>
      </li>
      <li className="nav-item">
        <NavLink to="/pokemons">Pokemons</NavLink>
      </li>
      <li className="nav-item">
        <NavLink to="/teams">Teams</NavLink>
      </li>
    </ul>
  )
}

export default Navigation