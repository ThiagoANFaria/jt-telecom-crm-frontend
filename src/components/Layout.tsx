
import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <SidebarProvider>
        <div className="flex flex-1 w-full">
          <AppSidebar />
          
          <div className="flex-1 flex flex-col">
            <div className="flex items-center h-12 px-6 border-b border-border/50">
              <SidebarTrigger className="text-[#0057B8] hover:bg-[#0057B8]/10 p-2 rounded-lg transition-all" />
            </div>
            
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
