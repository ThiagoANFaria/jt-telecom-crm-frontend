import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Bell } from 'lucide-react';
import JTVoxLogo from '@/components/JTVoxLogo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 bg-card/95 backdrop-blur-sm shadow-sm border-b border-border/50 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center">
        <JTVoxLogo />
      </div>
      
      {/* Navigation Menu - Centro */}
      <nav className="hidden md:flex items-center space-x-6">
        <a href="/dashboard" className="text-sm font-medium text-foreground hover:text-[#0057B8] transition-colors">
          Dashboard
        </a>
        <a href="/leads" className="text-sm font-medium text-foreground hover:text-[#0057B8] transition-colors">
          Leads
        </a>
        <a href="/clients" className="text-sm font-medium text-foreground hover:text-[#0057B8] transition-colors">
          Clientes
        </a>
        <a href="/proposals" className="text-sm font-medium text-foreground hover:text-[#0057B8] transition-colors">
          Propostas
        </a>
        <a href="/contracts" className="text-sm font-medium text-foreground hover:text-[#0057B8] transition-colors">
          Contratos
        </a>
      </nav>

      {/* User Actions - Direita */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-[#0057B8]/10 text-muted-foreground hover:text-[#0057B8]"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00C853] rounded-full text-xs flex items-center justify-center text-white">
            3
          </span>
        </Button>

        <div className="flex items-center gap-3 px-3 py-2 bg-card/60 rounded-lg border border-border/50">
          <div className="w-8 h-8 bg-gradient-to-r from-[#0057B8] to-[#003d82] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.user_level}</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="flex items-center gap-2 border-[#0057B8]/20 text-[#0057B8] hover:bg-[#0057B8] hover:text-white transition-all duration-200 hover:shadow-lg"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default Header;