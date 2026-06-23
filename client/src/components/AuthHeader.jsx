import { Link } from 'react-router-dom';

export default function AuthHeader({ links = [] }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link className="logo" to="/">IMPULSE</Link>
        <nav className="nav nav--visible">
          <Link to="/">На сайт</Link>
          {links.map((link) => (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
