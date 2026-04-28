import { Provider } from "jotai";
import { cookies } from "next/headers";

import {
  SidebarInset,
  SidebarProvider
} from "@workspace/ui/components/sidebar";

import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

export const DashboardLayout = async ({
  children
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <AuthGuard>
      <OrganizationGuard>
        <Provider>
          <div className="flex h-svh min-h-0 w-full flex-col overflow-hidden">
            <SidebarProvider
              className="min-h-0 flex-1 overflow-hidden"
              defaultOpen={defaultOpen}
            >
              <DashboardSidebar />
              <SidebarInset className="min-h-0 overflow-hidden">
                {/* div (not main): SidebarInset already renders <main> */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  {children}
                </div>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </Provider>
      </OrganizationGuard>
    </AuthGuard>
  );
};
