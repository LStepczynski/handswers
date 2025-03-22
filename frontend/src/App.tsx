import Cookies from "js-cookie";
import { Routes } from "./routes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom/sidebar/app-sidebar";

function App() {
  const cookieValue = Cookies.get("sidebar_state");
  const defaultOpen = cookieValue != "false"; // When no cookie is found, the default is open

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <Routes />
      </main>
    </SidebarProvider>
  );
}

export default App;
