import Link from 'next/link';

interface HeaderProps {
  title: string;
  user?: { // Optionnel pour l'utilisateur
    avatarUrl?: string;
    name: string;
  };
}

const Header: React.FC<HeaderProps> = ({ title, user }) => {
  return (
    <header className="bg-red-600 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/" className="hover:text-blue-300">Accueil</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-300">À propos</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-300">Contact</Link>
            </li>
          </ul>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <img 
                src={user.avatarUrl || "/default-avatar.png"} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <span>{user.name}</span>
            </div>
          ) : (
            <Link href="/login" className="hover:text-blue-300">
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
