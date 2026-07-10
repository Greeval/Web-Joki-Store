import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import NegoThread from "@/components/NegoThread";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ threadId: string }>;
}

export default async function AdminNegoDetailPage({ params }: Props) {
  const { threadId } = await params;
  const id = parseInt(threadId);

  const thread = await prisma.negoThread.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      orderItem: {
        include: {
          item: true,
          order: { include: { user: true } },
        },
      },
    },
  });

  if (!thread) notFound();

  return (
    <main style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 60 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Link href="/admin/nego" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontSize: 14 }}>
            <ArrowLeft size={16} /> Kembali
          </Link>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
          <ShieldCheck size={20} style={{ color: "var(--accent-purple)" }} />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
              Nego #{thread.id} — View Admin
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
              Customer: {thread.orderItem.order.user?.nama ?? "Unknown"}
            </p>
          </div>
        </div>

        <NegoThread
          thread={thread as any}
          viewAs="admin"
        />
      </div>
    </main>
  );
}
