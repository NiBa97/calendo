import { createContext, useContext, useState, ReactNode } from "react";
// import { useToast } from "@chakra-ui/toast";

type OperationStatus = "idle" | "loading" | "error";

interface OperationStatusContextType {
  status: OperationStatus;
  setStatus: (status: OperationStatus) => void;
}

const OperationStatusContext = createContext<OperationStatusContextType | undefined>(undefined);

export const OperationStatusProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<OperationStatus>("idle");
  // const toast = useToast();

  const wrapPromise = async <T,>(promise: Promise<T>): Promise<T> => {
    try {
      setStatus("loading");
      const result = await promise;
      setStatus("idle");
      return result;
    } catch (error) {
      console.log("error", error);
      // Don't show error state or toast for cancelled requests
      if (error instanceof Error && error.message.includes("autocancelled")) {
        setStatus("idle");
        return Promise.reject(error);
      }

      setStatus("error");
      // toast({
      //   title: "Error",
      //   description: error instanceof Error ? error.message : "An error occurred",
      //   status: "error",
      //   duration: 3000,
      //   isClosable: true,
      // });
      throw error;
    }
  };

  return <OperationStatusContext.Provider value={{ status, setStatus }}>{children}</OperationStatusContext.Provider>;
};

export const useOperationStatus = () => {
  const context = useContext(OperationStatusContext);
  if (!context) {
    throw new Error("useOperationStatus must be used within an OperationStatusProvider");
  }
  return context;
};
