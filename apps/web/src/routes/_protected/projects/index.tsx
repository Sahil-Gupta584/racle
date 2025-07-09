import { backend } from "@repo/trpc/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BiCheckCircle,
  BiFilter,
  BiGlobe,
  BiPackage,
  BiSearch,
} from "react-icons/bi";
import { BsActivity, BsArrowUpRight } from "react-icons/bs";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FiClock, FiGitBranch, FiGitCommit, FiZap } from "react-icons/fi";
import {
  formatTimeAgo,
  getStatusColor,
  getStatusIcon,
} from "../../../lib/utils";

export const Route = createFileRoute("/_protected/projects/")({
  component: Projects,
});

function Projects() {
  const { data } = backend.projects.getAll.useQuery();
  function getRepoName(url: string) {
    try {
      const parts = url.split("/");
      return parts.slice(-2).join("/");
    } catch {
      return "Unknown Repo";
    }
  }

  if (!data?.result) return "Loading...";
  return (
    <div className="min-h-screen bg-gradient-to-br from-forge-950 via-forge-900 to-accent-950 text-forge-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-forge-300 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-forge-400">
              Manage and deploy your applications
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-forge-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2.5 bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl text-white placeholder-forge-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all w-64"
              />
            </div>
            <button className="flex items-center px-3 py-2.5 bg-forge-800/50 backdrop-blur-sm hover:bg-forge-700/50 border border-forge-700/50 rounded-xl text-forge-300 hover:text-white transition-all duration-200">
              <BiFilter className="w-4 h-4 mr-2 text-accent-400" />
              Filter
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-forge-400 text-sm font-medium">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {data.result.length}
                </p>
              </div>
              <BiPackage className="w-8 h-8 text-accent-500" />
            </div>
          </div>
          <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-forge-400 text-sm font-medium">
                  Total Deployments
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {data.result.reduce(
                    (acc, p) => acc + p._count.deployments,
                    0,
                  )}
                </p>
              </div>
              <FiZap className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-forge-400 text-sm font-medium">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  98.5%
                </p>
              </div>
              <BiCheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-forge-400 text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-accent-400 mt-1">247</p>
              </div>
              <BsActivity className="w-8 h-8 text-accent-500" />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {data.result.length === 0 ? (
          <div className="bg-forge-800/30 backdrop-blur-sm border border-forge-700/50 rounded-xl p-12 text-center">
            <BiPackage className="w-16 h-16 text-forge-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No projects yet
            </h3>
            <p className="text-forge-400 mb-6 max-w-md mx-auto">
              Get started by creating your first project and deploying your
              application
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.result.map((project) => {
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
                          window.open(
                            `https://${project.domainName}.racle.xyz`,
                            "_blank",
                          );
                        }}
                        className="text-accent-400 hover:text-accent-300 transition-colors flex items-center group cursor-pointer"
                      >
                        https://{project.domainName}.racle.xyz
                        <FaExternalLinkAlt className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>

                    {/* Commit & Deployment in one line */}
                    <div className="flex items-center justify-between text-xs text-forge-400">
                      <div className="flex items-center min-w-0 flex-1">
                        <FiGitCommit className="w-3 h-3 mr-1 text-accent-400" />
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
