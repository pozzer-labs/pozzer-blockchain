import { Link } from 'react-router';
import { useLanguage } from '@/react-app/hooks/useLanguage';
import { Globe, Menu, X } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';
import { useState } from 'react';

export default function Navigation() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/explorer', label: t('nav.explorer') },
    { to: '/testnet', label: 'Testnet' },
    { to: '/tokenomics', label: t('nav.tokenomics') },
    { to: '/roadmap', label: t('nav.roadmap') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Pozzer" className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-300 to-blue-500 bg-clip-text text-transparent">POZZER</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="text-sm hover:text-emerald-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: Language switcher + Mobile menu button */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              className="gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{language.toUpperCase()}</span>
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm py-2 px-3 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
