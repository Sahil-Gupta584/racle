import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { Link, useMatch, useNavigate } from "@tanstack/react-router";
import { FaSignOutAlt } from "react-icons/fa";
import { FiChevronRight, FiUser, FiZap } from "react-icons/fi";
import { signOut, useSession } from "../../lib/auth";
import NewProject from "./newProject";

export default function Header() {
  const match = useMatch({ strict: false });
  const navigate = useNavigate();

  const { data } = useSession();
  const user = data?.user;
  const params = match?.params as {
    projectId?: string;
    deploymentId?: string;
  };

  const truncateId = (id: string) => id.slice(0, 6) + "...";

  return (
    <nav className="top-0 w-full z-50 bg-forge-950/90 backdrop-blur-xl border-b border-forge-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between ">
          <div className="flex md:flex-row flex-col md:items-center items-baseline md:space-x-4 mt-2 md:h-16">
            <Link to="/projects" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-forge-300 bg-clip-text text-transparent">
                Racle
              </span>
            </Link>

            {/* Breadcrumb navigation */}
            {params?.projectId && (
              <div className="flex items-center text-forge-300 md:mx-2 my-3">
                <FiChevronRight />
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: params.projectId }}
                  className="hover:text-accent-500 transition-colors"
                >
                  {params.projectId.length > 8
                    ? truncateId(params.projectId)
                    : params.projectId}
                </Link>

                {params?.deploymentId && (
                  <>
                    <FiChevronRight className="mx-2" />
                    <Link
                      to="/projects/$projectId/deployment/$deploymentId"
                      params={{
                        projectId: params.projectId,
                        deploymentId: params.deploymentId,
                      }}
                      className="hover:text-accent-500 transition-colors"
                    >
                      {params.deploymentId.length > 8
                        ? truncateId(params.deploymentId)
                        : params.deploymentId}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse items-end gap-2 md:flex-row md:items-center space-x-4">
            <NewProject />
            {user && (
              <Dropdown
                classNames={{ content: ["shadow-[0px_0px_2px_#ed5eff]"] }}
              >
                <DropdownTrigger>
                  <button className="flex items-center space-x-2 group">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-accent-500 transition-colors"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-forge-800 flex items-center justify-center border-2 border-transparent group-hover:border-accent-500 transition-colors">
                        <FiUser className="text-forge-300" />
                      </div>
                    )}
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem key="profile">
                    <div className="flex items-center flex-col justify-center text-center gap-2 border-b-2 pb-2 border-b-gray-400">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={data.user.image as string}
                      />
                      <ul>
                        <li className="text-lg capitalize">{data.user.name}</li>
                        <li className="text-sm text-gray-500">
                          {data.user.email}
                        </li>
                      </ul>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    startContent={<FaSignOutAlt className="text-red-500" />}
                    onPress={() =>
                      signOut({
                        fetchOptions: {
                          onSuccess: () => navigate({ to: "/auth" }),
                        },
                      })
                    }
                  >
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
