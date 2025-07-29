import { backend, type TBackendOutput } from "@repo/trpc/react";
import { createFileRoute } from "@tanstack/react-router";
import { BiCheckCircle, BiFilter, BiPackage, BiSearch } from "react-icons/bi";
import { BsActivity } from "react-icons/bs";
import { FiZap } from "react-icons/fi";
import ProjectCard from "../../-components/projectCard";

export const Route = createFileRoute("/_protected/projects/")({
  component: Projects,
});

function Projects() {
  const { data } = backend.projects.getAll.useQuery();
  type TProject = NonNullable<
    TBackendOutput["projects"]["getAll"]["result"]
  >[number];

  if (!data?.result) return "Loading...";
  return (
    <div className="grow bg-gradient-to-br from-forge-950 via-forge-900 to-accent-950 text-forge-100">
      <div className="p-8 max-w-7xl mx-auto md:space-y-8 space-y-4">
        {/* Header */}
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-forge-300 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-forge-400">
              Manage and deploy your applications
            </p>
          </div>
          <div className="flex items-center space-x-4 ">
            <div className="relative grow">
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-forge-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 w-full md:w-64 pr-4 py-2.5 bg-forge-800/50 backdrop-blur-sm border border-forge-700/50 rounded-xl text-white placeholder-forge-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all "
              />
            </div>
            <button className="flex items-center px-3 py-2.5 bg-forge-800/50 backdrop-blur-sm hover:bg-forge-700/50 border border-forge-700/50 rounded-xl text-forge-300 hover:text-white transition-all duration-200">
              <BiFilter className="w-4 h-4 mr-2 text-accent-400" />
              Filter
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                    (acc: number, p: TProject) => acc + p._count.deployments,
                    0
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
            {data.result.map((project: TProject) => (
              <ProjectCard project={project} key={project.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
