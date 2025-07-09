import { backend } from "@repo/trpc/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BiCode,
  BiGitBranch,
  BiPackage,
  BiSquare,
  BiTerminal,
} from "react-icons/bi";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { TbLoader2 } from "react-icons/tb";
import { getStatusColor, getStatusIcon } from "../../../../../../lib/utils";

export const Route = createFileRoute(
  "/_protected/projects/$projectId/deployment/$deploymentId/",
)({
  component: DeploymentPage,
});

function DeploymentPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const { deploymentId } = Route.useParams();
  const { data, isPending, refetch } = backend.deployment.read.useQuery({
    deploymentId,
  });
  const [hasTriggered, setHasTriggered] = useState(false);
  const backendUtils = backend.useUtils();

  useEffect(() => {
    if (hasTriggered) return;
    setHasTriggered(true);
    setIsStreaming(true);
    const eventSource = new EventSource(
      `http://localhost:3000/get-logs?deploymentId=${deploymentId}`,
    );
    backendUtils.projects.read.invalidate();
    eventSource.onmessage = (event) => {
      if (String(event.data).trim() === "End") {
        setIsStreaming(false);
        refetch();
      } else {
        setLogs((prev) => [...prev, event.data]);
      }
    };

    eventSource.onerror = (err) => {
      console.log("EventSource failed:", err);
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  }, []);

  if (isPending) return <div className="p-6">Loading...</div>;
  if (!data?.result)
    return <div className="p-6 text-red-600">Deployment not found</div>;

  const deployment = data.result;
  const project = deployment.project;

  return (
    <div className="min-h-screen bg-gradient-to-br from-forge-950 via-forge-900 to-accent-950 text-forge-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-forge-300 bg-clip-text text-transparent">
                Deployment Details
              </h1>
              <div className="flex items-center space-x-4 text-sm text-forge-400">
                <span className="font-mono">{deployment.id}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-forge-800/50 backdrop-blur-sm hover:bg-forge-700/50 border border-forge-700/50 text-forge-300 hover:text-white rounded-xl transition-all duration-200">
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Redeploy
              </button>
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-accent-500/25">
                <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                Visit Site
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(deployment.status)}
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-white">
                      {deployment.status === "Building"
                        ? "Building"
                        : deployment.status === "Ready"
                          ? "Deployment Successful"
                          : deployment.status === "Error"
                            ? "Deployment Failed"
                            : "Queued"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deployment.status)}`}
                    >
                      {deployment.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-forge-400">
                    <div className="flex items-center">
                      <BiGitBranch className="w-4 h-4 mr-1 text-accent-400" />
                      main
                    </div>
                    <div className="flex items-center">
                      <BiCode className="w-4 h-4 mr-1 text-emerald-400" />
                      {deployment.commitHash}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-forge-400">Commit</div>
                <div className="font-medium text-white">
                  {deployment.commitMessage}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BiPackage className="w-5 h-5 mr-2 text-accent-500" />
                Project Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                    Project Name
                  </label>
                  <div className="mt-1 text-white font-medium">
                    {project.name}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                    Repository
                  </label>
                  <div className="mt-1">
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-400 hover:text-accent-300 text-sm flex items-center group transition-colors"
                    >
                      {project.repositoryUrl.replace("https://github.com/", "")}
                      <FaExternalLinkAlt className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                    Framework
                  </label>
                  <div className="mt-1 text-white font-medium">Vite</div>
                </div>
              </div>
            </div>

            {/* Build Commands */}
            <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BiTerminal className="w-5 h-5 mr-2 text-emerald-500" />
                Build Commands
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                    Install
                  </label>
                  <div className="mt-1 bg-forge-900/50 border border-forge-700/50 rounded-lg p-3">
                    <code className="text-sm text-emerald-400 font-mono">
                      {project.installCmd}
                    </code>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                    Build
                  </label>
                  <div className="mt-1 bg-forge-900/50 border border-forge-700/50 rounded-lg p-3">
                    <code className="text-sm text-emerald-400 font-mono">
                      {project.buildCmd}
                    </code>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-forge-400 uppercase tracking-wider">
                    Start
                  </label>
                  <div className="mt-1 bg-forge-900/50 border border-forge-700/50 rounded-lg p-3">
                    <code className="text-sm text-emerald-400 font-mono">
                      {project.runCmd}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Logs */}
          <div className="lg:col-span-2">
            <div className="bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-forge-700/50">
                <div className="flex items-center space-x-3">
                  <BiTerminal className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-semibold text-white">
                    Deployment Logs
                  </h2>
                  {isStreaming && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-emerald-400">Live</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div
                  className={`bg-forge-900 text-emerald-400 ${data.result && data.result.status === "Error" && "text-red-400"}  p-6 font-mono text-sm overflow-auto max-h-[600px] min-h-[400px]`}
                >
                  {/* Terminal Header */}
                  <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-forge-700/50">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>
                    <span className="text-forge-400 text-xs">
                      deployment-{deploymentId}
                    </span>
                  </div>

                  {/* Log Content */}
                  <div className="space-y-1">
                    {logs.length === 0 ? (
                      <div className="text-forge-500 italic">
                        No logs available yet...
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 group"
                        >
                          <span className="text-forge-500 text-xs mt-0.5 font-mono min-w-[60px]">
                            {String(index + 1).padStart(3, "0")}
                          </span>
                          <span className=" group-hover:text-emerald-300 transition-colors">
                            {log}
                          </span>
                        </div>
                      ))
                    )}
                    {isStreaming && (
                      <div className="flex items-center space-x-2 mt-4">
                        <TbLoader2 className="w-4 h-4 animate-spin text-accent-500" />
                        <span className="text-accent-400">Building...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scroll to bottom indicator */}
                {logs.length > 20 && (
                  <div className="absolute bottom-4 right-4">
                    <button className="bg-forge-700/90 hover:bg-forge-600/90 backdrop-blur-sm border border-forge-600 rounded-xl p-2 text-forge-300 hover:text-white transition-all duration-200">
                      <BiSquare className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
