import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "../lib/auth";
import Header from "./-components/header";

export const Route = createFileRoute("/_protected")({
  component: Home,
});

export default function Home() {
  const { data, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (isPending) return;
    if (!data) {
      navigate({ to: "/auth" });
      return;
    }
  }, [isPending]);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Outlet />
    </main>
  );
}
