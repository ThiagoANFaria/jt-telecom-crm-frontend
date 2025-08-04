
import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { LogOut, User, Bell } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-card/80 backdrop-blur-sm shadow-sm border-b border-border/50 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-[#0057B8] hover:bg-[#0057B8]/10 p-2 rounded-lg transition-all" />
            </div>
            
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
                  <p className="font-medium text-foreground">{profile?.name || user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {profile?.user_level === 'master' ? 'Admin Master' : 
                     profile?.user_level === 'admin' ? 'Administrador' : 'Usuário'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2 border-[#0057B8]/20 text-[#0057B8] hover:bg-[#0057B8] hover:text-white transition-all duration-200 hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
