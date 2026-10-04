import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { WorkspaceContent, WorkspaceNavigationProvider } from "@/components/workspace-navigation";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceNavigationProvider>
      <div className="min-h-screen bg-canvas md:flex">
        <MobileNav />
        <Sidebar />
        <WorkspaceContent>{children}</WorkspaceContent>
      </div>
    </WorkspaceNavigationProvider>
  );
}
