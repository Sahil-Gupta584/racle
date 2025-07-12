import type { TBackendOutput } from "@repo/trpc/react";
import { Link } from "@tanstack/react-router";
import { BiGlobe } from "react-icons/bi";
import { BsArrowUpRight } from "react-icons/bs";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FiClock, FiGitBranch, FiGitCommit, FiZap } from "react-icons/fi";
import {
  formatTimeAgo,
  getProjectUrl,
  getStatusColor,
  getStatusIcon,
} from "../../lib/utils";

type TProject = NonNullable<
  TBackendOutput["projects"]["getAll"]["result"]
>[number];

export default function ProjectCard({ project }: { project: TProject }) {
  function getRepoName(url: string) {
    try {
      const parts = url.split("/");
      return parts.slice(-2).join("/");
    } catch {
      return "Unknown Repo";
    }
  }
  const latestStatus = project.deployments[0]
    ? project.deployments[0].status
    : "";
  const { commitMessage } = project.deployments[0] || {
    commitHash: "",
    commitMessage: "",
  };
  const latestDeployment = project.deployments[0];

  return (
    <Link
      key={project.id}
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className="group bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 hover:border-accent-500/50 rounded-xl p-6 transition-all duration-300 hover:bg-forge-800/70 hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white group-hover:text-accent-300 transition-colors truncate">
            {project.name}
          </h3>
          <div className="flex items-center mt-2">
            {getStatusIcon(latestStatus)}
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(latestStatus)}`}
            >
              {latestStatus}
            </span>
          </div>
        </div>
        <BsArrowUpRight className="w-5 h-5 text-forge-400 group-hover:text-accent-400 group-hover:scale-110 transition-all duration-200 flex-shrink-0" />
      </div>

      {/* Repository Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm text-forge-400">
          <div className="flex items-center min-w-0 flex-1">
            <FiGitBranch className="w-4 h-4 mr-2 text-accent-400" />
            <span className="text-accent-400 hover:text-accent-300 transition-colors flex items-center group cursor-pointer truncate">
              {getRepoName(project.repositoryUrl)}
            </span>
          </div>
          <span className="ml-2 px-2 py-1 bg-forge-700/50 rounded text-xs text-forge-300">
            main
          </span>
        </div>
        <div className="flex items-center text-sm text-forge-400">
          <BiGlobe className="w-4 h-4 mr-2 text-accent-400" />
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(getProjectUrl(project.domainName), "_blank");
            }}
            className="text-accent-400 hover:text-accent-300 transition-colors flex items-center group cursor-pointer"
          >
            {getProjectUrl(project.domainName)}
            <FaExternalLinkAlt className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>

        {/* Commit & Deployment in one line */}
        <div className="flex items-center justify-between text-xs text-forge-400">
          <div className="flex items-center min-w-0 flex-1">
            <FiGitCommit className="w-4 h-4 mr-1 text-accent-400" />
            <span className="truncate mr-2" title={commitMessage}>
              {commitMessage || "No commit message"}
            </span>
          </div>
          {latestDeployment && (
            <span className="flex items-center ml-2">
              <FiClock className="w-3 h-3 mr-1 text-blue-400" />
              {formatTimeAgo(latestDeployment.createdAt)}
            </span>
          )}
        </div>
      </div>

      {/* Deployment Count */}
      <div className="flex items-center justify-between pt-4 border-t border-forge-700/50">
        <div className="flex items-center text-sm text-forge-400">
          <FiZap className="w-4 h-4 mr-2 text-amber-400" />
          <span>{project._count.deployments} deployments</span>
        </div>
        <div className="text-xs text-forge-500">
          Updated {formatTimeAgo(project.updatedAt)}
        </div>
      </div>
    </Link>
  );
}
