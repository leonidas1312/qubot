import { Home, LogIn, Database, Box, Users, Terminal, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@supabase/auth-helpers-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Home",
    icon: Home,
    url: "/",
  },
  {
    title: "Login",
    icon: LogIn,
    url: "/login",
    hideWhenAuth: true,
  },
  {
    title: "Solvers",
    icon: Box,
    url: "/solvers",
  },
  {
    title: "Datasets",
    icon: Database,
    url: "/datasets",
  },
  {
    title: "Playground",
    icon: Terminal,
    url: "/playground",
    requireAuth: true,
  },
  {
    title: "Community",
    icon: Users,
    url: "/community",
  },
  {
    title: "Profile",
    icon: User,
    url: "/profile",
    requireAuth: true,
  },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const session = useSession()

  const filteredItems = items.filter(item => {
    if (session) {
      return !item.hideWhenAuth
    }
    return !item.requireAuth
  })

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => navigate(item.url)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}