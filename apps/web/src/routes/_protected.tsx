import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "../lib/auth";
import Header from "./-components/header";

export const Route = createFileRoute("/_protected")({
  component: Home,
});

export default function Home() {
  const { data, isPending } = useSession();
  const navigate = useNavigate();
  const {
    location: { pathname },
  } = useRouterState();
  const routesToHide = ["/auth", "/checkout"];

  useEffect(() => {
    if (isPending) return;
    if (!data) {
      navigate({ to: "/auth" });
      return;
    }
    if (data && pathname === "/auth") {
      navigate({ to: "/" });
      return;
    }
  }, [isPending]);

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
