import Link from 'next/link';

interface HeaderProps {

    title: string;
  
  }

  const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-red-600 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-blue-300">Accueil</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-300">À propos</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-300">Contact</Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-blue-300">Blog</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;