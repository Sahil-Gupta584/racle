import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { httpBatchLink } from "@trpc/client";
import { Analytics } from "@vercel/analytics/react";
import { useCallback, useEffect, useState } from "react";

// Import the generated route tree
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { backend } from "@repo/trpc/react";
// import { ThemeProvider } from "next-themes";
import { backendUrl } from "./lib/utils";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const [queryClient] = useState(() => new QueryClient());

  const createTrpcClientFunction = useCallback(() => {
    return backend.createClient({
      links: [
        httpBatchLink({
          url: backendUrl + "/trpc",
        }),
      ],
    });
  }, []);
  const [trpcClient, setTrpcClient] = useState(createTrpcClientFunction);

  useEffect(() => {
    setTrpcClient(createTrpcClientFunction);
  }, [createTrpcClientFunction]);

  return (
    <HeroUIProvider>
      <backend.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Analytics />

          <ToastProvider
            toastProps={{
              classNames: { description: "break-all" },
            }}
            placement="top-center"
          />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </backend.Provider>
    </HeroUIProvider>
  );
}
