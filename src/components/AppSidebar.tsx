
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  FileCheck,
  CheckSquare,
  GitBranch,
  MessageCircle,
  Phone,
  Zap,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    url: '/leads',
    icon: UserPlus,
  },
  {
    title: 'Clientes',
    url: '/clients',
    icon: Users,
  },
  {
    title: 'Propostas',
    url: '/proposals',
    icon: FileText,
  },
  {
    title: 'Contratos',
    url: '/contracts',
    icon: FileCheck,
  },
  {
    title: 'Tarefas',
    url: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Pipelines',
    url: '/pipelines',
    icon: GitBranch,
  },
  {
    title: 'Chatbot',
    url: '/chatbot',
    icon: MessageCircle,
  },
  {
    title: 'Telefonia',
    url: '/telephony',
    icon: Phone,
  },
  {
    title: 'Automação',
    url: '/automation',
    icon: Zap,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-gray-200 bg-white shadow-lg">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#0057B8] font-bold font-montserrat text-lg px-4 py-4">
            JT VOX
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                          isActive
                            ? 'bg-[#0057B8] text-white shadow-lg shadow-[#0057B8]/25 scale-105'
                            : 'text-gray-700 hover:bg-[#0057B8]/10 hover:text-[#0057B8] hover:scale-102'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                        {!isCollapsed && (
                          <span className={`font-opensans ${isActive ? 'font-semibold' : ''}`}>
                            {item.title}
                          </span>
                        )}
                        {isActive && !isCollapsed && (
                          <div className="ml-auto w-2 h-2 bg-[#00C853] rounded-full animate-pulse"></div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
