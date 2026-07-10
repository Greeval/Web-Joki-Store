import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import NegoThread from "@/components/NegoThread";
import { MessageSquare } from "lucide-react";

interface Props {
  params: Promise<{ threadId: string }>;
}

export default async function NegoDetailPage({ params }: Props) {
  const { threadId } = await params;
  const id = parseInt(threadId);

  const thread = await prisma.negoThread.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      orderItem: {
        include: {
          item: true,
          order: true,
        },
      },
    },
  });

  if (!thread) notFound();

  return (
    <main style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 60 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <MessageSquare size={24} style={{ color: "var(--accent-purple)" }} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Nego Thread #{thread.id}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
              Diskusi harga langsung dengan admin Greeval Store
            </p>
          </div>
        </div>

        <NegoThread
          thread={thread as any}
          viewAs="customer"
        />
      </div>
    </main>
  );
}
