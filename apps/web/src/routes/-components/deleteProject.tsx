import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { backend } from "@repo/trpc/react";
import { zodSchemas } from "@repo/trpc/zodSchemas";
import { useNavigate } from "@tanstack/react-router";
import { BiTrash } from "react-icons/bi";
import { trpcErrorHandler } from "../../lib/utils";

export default function DeleteProject({
  projectId,
  name,
}: {
  projectId: string;
  name: string;
}) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const navigate = useNavigate();
  const deleteProjectMutation = backend.projects.delete.useMutation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // prevent form reload
    try {
      const formData = await zodSchemas.projects.delete.parseAsync({
        projectId,
      });
      const res = await deleteProjectMutation.mutateAsync(formData);
      if (res.ok) {
        addToast({
          color: "success",
          description: "Project deleted successfully.",
        });
        onClose();
        navigate({ to: "/projects" });
      }
    } catch (error) {
      trpcErrorHandler(error);
    }
  }

  return (
    <>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-red-500/25"
      >
        <BiTrash className="w-5 h-5" />
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="bg-white dark:bg-neutral-900 text-black dark:text-white w-full max-w-lg"
        backdrop="blur"
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={onSubmit}>
              <ModalHeader className="flex flex-col gap-1 text-lg font-bold">
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="space-y-2 text-sm">
                <p>Are you sure you want to delete this project?</p>
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md text-xs">
                  <p>
                    <span className="font-semibold">ID:</span> {projectId}
                  </p>
                  <p>
                    <span className="font-semibold">Name:</span> {name}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  type="submit"
                  isLoading={deleteProjectMutation.isPending}
                >
                  Delete
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
