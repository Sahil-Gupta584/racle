import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { backend, type TBackendInput } from "@repo/trpc/react";
import { zodSchemas } from "@repo/trpc/zodSchemas";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { BiCode, BiGlobe, BiPlus } from "react-icons/bi";
import { BsGithub } from "react-icons/bs";
import { useSession } from "../../lib/auth";
import { trpcErrorHandler } from "../../lib/utils";

export default function NewProject() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const { data } = useSession();
  const navigate = useNavigate();
  type TCreateProject = TBackendInput["projects"]["create"];
  const createProjectMutation = backend.projects.create.useMutation();
  const createDeploymentMutation = backend.deployment.create.useMutation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<TCreateProject>({
    defaultValues: {
      installCmd: "npm install",
      buildCmd: "npm run build",
      runCmd: "npm run start",
    },
  });

  async function onSubmit(formDataRaw: TCreateProject) {
    try {
      if (!data?.user.id) return;
      formDataRaw.userId = data?.user.id;
      const formData = await zodSchemas.projects.create.parseAsync(formDataRaw);
      const res = await createProjectMutation.mutateAsync(formData);
      if (res.error) throw res.error;
      if (!res.result) throw new Error("Failed to create project");
      const triggerDeploymentRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/trigger-deploy?deploymentId=${res.result.deployment.id}`
      );
      const result = await triggerDeploymentRes.json();
      if (!result.ok) throw new Error("Failed to trigger deployment");

      navigate({
        to: "/projects/$projectId/deployment/$deploymentId",
        params: {
          deploymentId: res.result.deployment.id as string,
          projectId: res.result.project.id,
        },
      });
      onClose();
    } catch (error) {
      trpcErrorHandler(error);
    }
  }
  return (
    <>
      <Button
        onPress={onOpen}
        className="inline-flex items-center  bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-accent-500/25"
      >
        <BiPlus className="w-5 h-5" />
        New Project
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="bg-gradient-to-br from-forge-950 via-forge-900 to-forge-950 w-fit"
        backdrop="blur"
        isDismissable={false}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="flex flex-col gap-1">
                New Project
              </ModalHeader>
              <ModalBody>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg wh">
                    <div className="flex items-center gap-2">
                      <BsGithub className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-200 ">Demo Repo:</span>
                    </div>
                    <Snippet
                      hideSymbol={true}
                      className="text-xs text-blue-300 bg-blue-500/20 w-fit whitespace-break-spaces"
                      classNames={{ pre: ["truncate whitespace-pre-wrap"] }}
                    >
                      https://github.com/Sahil-Gupta584/vite-template
                    </Snippet>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <Input
                      startContent={<BsGithub />}
                      placeholder="Paste URL of a repo here"
                      label="Repository"
                      variant="bordered"
                      {...register("repositoryUrl")}
                    />
                    <Input
                      startContent={<BiCode />}
                      placeholder="Enter project name here"
                      label="Project Name"
                      variant="bordered"
                      {...register("name")}
                    />
                  </div>
                </div>
                <Input
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">
                        .racle.com
                      </span>
                    </div>
                  }
                  startContent={<BiGlobe />}
                  placeholder="Enter domain name here"
                  label="Domain Name"
                  variant="bordered"
                  {...register("domainName")}
                />

                <Accordion>
                  <AccordionItem
                    key="1"
                    aria-label="Accordion 1"
                    title="Build and Deployment Settings"
                    className="border border-gray-700 px-2 rounded-lg "
                  >
                    <div className="space-y-4">
                      <Input
                        placeholder="npm install"
                        label="Install Command"
                        variant="bordered"
                        {...register("installCmd")}
                      />
                      <Input
                        placeholder="npm run build"
                        label="Build Command"
                        variant="bordered"
                        {...register("buildCmd")}
                      />
                      <Input
                        placeholder="npm run start"
                        label="Run Command"
                        variant="bordered"
                        {...register("runCmd")}
                      />
                    </div>
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    aria-label="Accordion 2"
                    title="Environment Variables"
                    className="border border-gray-700 px-2 rounded-lg mt-2 "
                  >
                    <Textarea
                      placeholder="EXAMPLE_NAME=OIUYGBNMOIHN"
                      {...register("envs")}
                    />
                  </AccordionItem>
                </Accordion>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={
                    isSubmitting ||
                    createDeploymentMutation.isPending ||
                    createProjectMutation.isPending
                  }
                >
                  create
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
