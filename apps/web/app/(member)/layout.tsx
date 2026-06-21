import { MemberSidebar } from "@/components/layout/member-sidebar";
import { MemberHeader } from "@/components/layout/member-header";
import { MemberFooter } from "@/components/layout/member-footer";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-muted/10">
      <MemberSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <MemberHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <MemberFooter />
      </div>
    </div>
  );
}
