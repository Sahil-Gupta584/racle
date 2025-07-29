import { addToast } from "@heroui/react";
import { CgLock } from "react-icons/cg";
import { FaCheckCircle } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import { RiLoader2Line } from "react-icons/ri";
export const backendUrl = import.meta.env.VITE_BACKEND_URL;
if (!backendUrl) throw new Error("Backend Url not found");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trpcErrorHandler(error: any) {
  // console.log(query.error)

  if (error) {
    if (error?.data?.code === "BAD_REQUEST") {
      const data = JSON.parse(error);
      addToast({
        color: "danger",
        title: "Input Error",
        description: `${data[0]?.message}`,
      });

      return;
    }

    // local error handlers
    if (error?.name === "ZodError") {
      addToast({
        color: "danger",
        description: `${error?.issues[0]?.message} (${error?.issues[0]?.path[0]})`,
      });
      return;
    }

    console.log({ error });
    addToast({
      color: "danger",
      description: `${error}`,
    });
  }
}

export function parseGitHubRepoUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}
export async function getLatestCommitInfo(repoUrl: string) {
  try {
    const parsed = parseGitHubRepoUrl(repoUrl);
    if (!parsed) return null;

    const res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits`
    );

    if (!res.ok) return null;

    const commits = await res.json();
    const latest = commits?.[0];

    return {
      hash: latest?.sha,
      message: latest?.commit?.message,
    };
  } catch (error) {
    console.log("Failed to get commit info", error);
  }
}

export const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "Ready":
      return <FaCheckCircle className="w-5 h-5 text-green-500" />;
    case "Building":
      return <RiLoader2Line className="w-5 h-5 text-blue-500 animate-spin" />;
    case "Failed":
      return <FiAlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <CgLock className="w-5 h-5 text-slate-500" />;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "Ready":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Building":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Error":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

export function getProjectUrl(domainName: string) {
  if (
    !import.meta.env.VITE_BACKEND_URL &&
    import.meta.env.VITE_BACKEND_URL.includes("localhost")
  ) {
    return `http://${domainName}.localhost:3000`; // Or whatever your local dev server uses
  }
  return `https://${domainName}.racle.xyz`;
}
