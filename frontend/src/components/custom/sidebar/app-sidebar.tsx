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
} from "lucide-react";

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

// Menu items.
const accessItems = [
  {
    title: "Home",
    url: "#",
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
    title: "Join",
    url: "#",
    icon: SquarePlus,
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

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center w-full">
          <img
            className="w-8 h-8 m-2 ml-10"
            src="handraise.png"
            alt="handswers"
          />
          <h1 className="mt-1 font-semibold text-lg">Handswers!</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
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
      </SidebarContent>
      <SidebarFooter>
        {false ? (
          <div className="m-1 p-2 hover:bg-background rounded-md transition-all flex items-center truncate gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
            </Avatar>
            <div className="text-sm">
              <p className="font-semibold">LStepczynski</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-[12px]">leonstepczynski@gmail.com</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[12px]">leonstepczynski@gmail.com</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
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
