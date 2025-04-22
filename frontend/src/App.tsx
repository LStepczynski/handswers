import Cookies from "js-cookie";
import { Routes } from "./routes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom/sidebar/app-sidebar";
import { NavBreadcrumbs } from "@/components/custom/navBreadcrumbs/navBreadcrumbs";
import { BreadcrumbProvider } from "@/components/custom/navBreadcrumbs/breadcrumbProvider";

function App() {
  const cookieValue = Cookies.get("sidebar_state");
  const defaultOpen = cookieValue != "false"; // When no cookie is found, the default is open

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <BreadcrumbProvider>
        <div id="alert-popup-root"></div>
        <div className="flex absolute top-0 left-0 z-10">
          <AppSidebar />
          <SidebarTrigger className="w-10 h-10"></SidebarTrigger>
          <div className="h-10 flex items-center ml-4">
            <NavBreadcrumbs />
          </div>
        </div>
        <div className="flex absolute top-0 left-0 w-full h-10 bg-sidebar z-0"></div>
        <div className="w-full grid justify-center mt-24 mb-32">
          <div className="w-[95vw] sm:w-[600px] md:w-[700px] lg:w-[950px] xl:w-[1200px] justify-start">
            <Routes />
          </div>
        </div>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}

export default App;
