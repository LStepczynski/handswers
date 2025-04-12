import {
  SquarePlus,
  Home,
  Inbox,
  User,
  Settings,
  BookMarked,
  Bot,
  CircleHelp,
  LogIn,
  LogOut,
  UserRoundPlus,
  Search,
  History,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { oauthRedirect } from "@/utils/oauthLogin";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUser } from "@/utils/getUser";
import { logOut } from "@/utils/logOut";

// Menu items.
const accessItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Account",
    url: "#",
    icon: User,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

const aboutItems = [
  {
    title: "General",
    url: "#",
    icon: CircleHelp,
  },
  {
    title: "About AI",
    url: "#",
    icon: Bot,
  },
  {
    title: "Guide",
    url: "#",
    icon: BookMarked,
  },
];

const adminItems = [
  {
    title: "Account Management",
    url: "/admin/account-management/1",
    icon: UserRoundPlus,
  },
];

const roomItems = [
  {
    title: "Join Room",
    url: "/room/join",
    icon: Search,
  },
  {
    title: "Create Room",
    url: "/room/create",
    icon: SquarePlus,
  },
  {
    title: "Room History",
    url: "/room/history/1",
    icon: History,
  },
];

export function AppSidebar() {
  const { isMobile } = useSidebar();

  const user = getUser();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center w-full">
          <img
            className="w-8 h-8 m-2 ml-10"
            src="/handraise.png"
            alt="handswers"
          />
          <h1 className="mt-1 font-semibold text-lg">Handswers!</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Question Rooms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {roomItems.map((item) => {
                if (
                  !user?.roles.includes("creator") &&
                  item.title != "Join Room"
                )
                  return null;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>About Us</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aboutItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user?.roles.includes("admin") && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        {user != undefined ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="m-1 p-2 hover:bg-background rounded-md transition-all flex items-center truncate gap-2">
                <Avatar>
                  <AvatarImage
                    referrerPolicy="no-referrer"
                    src={user.picture}
                  />
                </Avatar>
                <div className="text-sm">
                  <p className="font-semibold text-left">{user.name}</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <p className="text-[12px]">{user.email}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-[12px]">{user.email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isMobile ? "bottom" : "right"}
              className="w-56"
            >
              <DropdownMenuItem onClick={logOut}>
                <LogOut color="red" />
                <p>Log Out</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="m-2">
            <Button onClick={oauthRedirect()} className=" w-full">
              Log In <LogIn />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
