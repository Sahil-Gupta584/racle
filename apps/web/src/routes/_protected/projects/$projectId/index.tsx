import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { addToast, Button, Switch } from "@heroui/react";
import { backend } from "@repo/trpc/react";
import { Link } from "@tanstack/react-router";
import {
  BiCalendar,
  BiGlobe,
  BiHash,
  BiPackage,
  BiTerminal,
} from "react-icons/bi";
import { BsArrowUpRight } from "react-icons/bs";
import { CgLock } from "react-icons/cg";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FiGitBranch } from "react-icons/fi";
import { RiLoader2Line } from "react-icons/ri";
import DeleteProject from "../../../-components/deleteProject";
import {
  formatTimeAgo,
  getLatestCommitInfo,
  getStatusColor,
  getStatusIcon,
  trpcErrorHandler,
} from "../../../../lib/utils";

export const Route = createFileRoute("/_protected/projects/$projectId/")({
  component: ProjectDetailsPage,
});

function ProjectDetailsPage() {
  const { projectId } = Route.useParams();
  const toggleAutoDeployMutation =
    backend.projects.toggleAutoDeploy.useMutation();

  const { data, isPending, refetch } = backend.projects.read.useQuery({
    projectId,
  });
  const createDeploymentMutation = backend.deployment.create.useMutation();
  const navigate = useNavigate();

  if (isPending) return <div className="p-6">Loading...</div>;
  if (!data?.result)
    return <div className="p-6 text-red-600">Project not found</div>;

  const project = data.result;
  async function createAndMoveToFirstDeployment(
    repositoryUrl: string,
    projectId: string,
  ) {
    const commitInfo = await getLatestCommitInfo(repositoryUrl);
    if (!commitInfo) throw new Error("Failed to fetch latest commit hash");

    const deployment = await createDeploymentMutation.mutateAsync({
      projectId,
      commitHash: commitInfo.hash || "Unknown",
      commitMessage: commitInfo.message || "Unknown",
    });
    if (!deployment.result) throw new Error("Failed to create deployment");
    navigate({
      to: "/projects/$projectId/deployment/$deploymentId",
      params: {
        deploymentId: deployment.result.id as string,
        projectId,
      },
    });
  }
  async function toggleAutoDeploy(isSelected: boolean) {
    try {
      const res = await toggleAutoDeployMutation.mutateAsync({
        autoDeploy: isSelected,
        projectId,
      });
      if (res.error) throw res.error;
      await refetch();
      addToast({
        color: "success",
        description: isSelected
          ? "AutoDeploy Enabled Successfully."
          : "AutoDeploy Disabled Successfully.",
      });
    } catch (error) {
      refetch();
      trpcErrorHandler(error);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-forge-950 via-forge-900 to-accent-950 text-forge-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-forge-300 bg-clip-text text-transparent">
              {project.name}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-forge-400">
              <div className="flex items-center">
                <FiGitBranch className="w-4 h-4 mr-1 text-accent-400" />
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-400 hover:text-accent-300 transition-colors flex items-center group"
                >
                  {project.repositoryUrl.replace("https://github.com/", "")}
                  <FaExternalLinkAlt className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
              <span>•</span>
              <div className="flex items-center">
                <BiCalendar className="w-4 h-4 mr-1 text-emerald-400" />
                Created {formatTimeAgo(project.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a href={"https://" + data.result.domainName + ".racle.com"}>
              <button className="flex items-center px-4 py-2 bg-forge-800/50 backdrop-blur-sm hover:bg-forge-700/50 border border-forge-700/50 text-forge-300 hover:text-white rounded-xl transition-all duration-200">
                <BiGlobe className="w-4 h-4 mr-2" />
                Visit Site
              </button>
            </a>
            <DeleteProject name={project.name} projectId={projectId} />
          </div>
        </div>

        {/* Project Configuration */}
        <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <BiPackage className="w-5 h-5 mr-2 text-accent-500" />
            Build Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                Install Command
              </label>
              <div className="mt-2 bg-forge-900/50 border border-forge-700/50 rounded-lg p-3">
                <code className="text-sm text-emerald-400 font-mono">
                  {project.installCmd}
                </code>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                Build Command
              </label>
              <div className="mt-2 bg-forge-900/50 border border-forge-700/50 rounded-lg p-3">
                <code className="text-sm text-emerald-400 font-mono">
                  {project.buildCmd}
                </code>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                Start Command
              </label>
              <div className="mt-2 bg-forge-900/50 border border-forge-700/50 rounded-lg p-3">
                <code className="text-sm text-emerald-400 font-mono">
                  {project.runCmd}
                </code>
              </div>
            </div>
          </div>
          {project.envs && (
            <div className="mt-6">
              <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                Environment Variables
              </label>
              <div className="mt-2 bg-forge-900/50 border border-forge-700/50 rounded-lg p-3">
                <code className="text-sm text-emerald-400 font-mono">
                  {project.envs}
                </code>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-white">
              Auto Deploy
            </label>
            <p className="text-xs text-forge-400 mt-1">
              Automatically deploy on new commits
            </p>
          </div>
          {toggleAutoDeployMutation.isPending ? (
            <RiLoader2Line className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Switch
              isSelected={project.autoDeploy}
              onValueChange={toggleAutoDeploy}
            />
          )}
        </div>
        {/* Deployments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <BiTerminal className="w-5 h-5 mr-2 text-emerald-500" />
              Recent Deployments
            </h2>
            {/* <button className="flex items-center px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-xl transition-all duration-200 text-sm shadow-lg hover:shadow-accent-500/25">
            <BiPlus className="w-4 h-4 mr-2" />
            New Deployment
          </button> */}
          </div>

          {project.deployments.length === 0 ? (
            <div className="bg-forge-800/30 backdrop-blur-sm border border-forge-700/50 rounded-xl p-12 text-center">
              <BiTerminal className="w-12 h-12 text-forge-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No deployments yet
              </h3>
              <p className="text-forge-400 mb-6">
                Get started by creating your first deployment
              </p>
              <Button
                onPress={() =>
                  createAndMoveToFirstDeployment(
                    project.repositoryUrl,
                    project.id,
                  )
                }
                isLoading={createDeploymentMutation.isPending}
                className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-accent-500/25"
              >
                Create First Deployment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {project.deployments.map((deployment) => (
                <Link
                  key={deployment.id}
                  to="/projects/$projectId/deployment/$deploymentId"
                  params={{
                    deploymentId: deployment.id,
                    projectId: deployment.projectId,
                  }}
                  className="group block bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 hover:border-accent-500/50 rounded-xl p-6 transition-all duration-200 hover:bg-forge-800/70"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(deployment.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deployment.status)}`}
                        >
                          {deployment.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-white group-hover:text-accent-300 transition-colors">
                          {deployment.commitMessage}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-forge-400">
                          <div className="flex items-center">
                            <BiHash className="w-3 h-3 mr-1 text-emerald-400" />
                            <span className="font-mono">
                              {deployment.commitHash}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <CgLock className="w-3 h-3 mr-1 text-accent-400" />
                            <span>{formatTimeAgo(deployment.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <BsArrowUpRight className="w-5 h-5 text-forge-400 group-hover:text-accent-400 group-hover:scale-110 transition-all duration-200" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {project.deployments.length}
            </div>
            <div className="text-sm text-forge-400">Total Deployments</div>
          </div>
          <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">
              {project.deployments.filter((d) => d.status === "Ready").length}
            </div>
            <div className="text-sm text-forge-400">Successful</div>
          </div>
          <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-amber-400 mb-1">
              {project.deployments.filter((d) => d.status === "Error").length}
            </div>
            <div className="text-sm text-forge-400">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
