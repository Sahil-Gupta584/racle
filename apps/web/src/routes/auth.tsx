import { Button } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FiZap } from "react-icons/fi";
import { signIn, useSession } from "../lib/auth";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

export default function RouteComponent() {
  const { data, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (isPending) return;
    if (data?.user.id) {
      navigate({ to: "/projects" });
    }
  }, [data?.user, data, navigate, isPending]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-forge-950 via-forge-900 to-accent-950">
      <div className="w-full max-w-md bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg mb-6">
          <FiZap className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-forge-300 bg-clip-text text-transparent mb-6">
          Welcome to DeployForge
        </h1>

        <p className="text-forge-300 mb-8 text-center">
          Sign in to deploy, scale, and monitor your applications
        </p>

        <Button
          className="w-full flex items-center justify-center gap-3 px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-accent-800 to-accent-800 hover:from-accent-600 hover:to-accent-700 transition shadow-lg hover:shadow-accent-500/25 rounded-xl"
          onPress={async () => {
            await signIn.social({
              provider: "google",
              callbackURL:
                import.meta.env.VITE_WEB_BASE_URL + "?redirectTo=/projects",
            });
          }}
        >
          <FcGoogle className="text-2xl" />
          Sign in with Google
        </Button>

        <Button
          className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-forge-700 to-forge-800 hover:from-forge-600 hover:to-forge-700 border border-forge-600/50 transition-all duration-300 rounded-xl"
          onPress={async () => {
            await signIn.social({
              provider: "github",
              callbackURL: import.meta.env.VITE_WEB_BASE_URL,
            });
          }}
        >
          <FaGithub className="text-2xl" />
          Sign in with GitHub
        </Button>

        <p className="text-sm text-forge-400 mt-6">
          Secure login powered by OAuth 2.0
        </p>
      </div>
    </div>
  );
}
