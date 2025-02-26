import { createContext, useContext, useState, ReactNode } from "react";

type OperationStatus = "idle" | "loading" | "error";

interface OperationStatusContextType {
  status: OperationStatus;
  setStatus: (status: OperationStatus) => void;
}

const OperationStatusContext = createContext<OperationStatusContextType | undefined>(undefined);

export const OperationStatusProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<OperationStatus>("idle");

  return <OperationStatusContext.Provider value={{ status, setStatus }}>{children}</OperationStatusContext.Provider>;
};

export const useOperationStatus = () => {
  const context = useContext(OperationStatusContext);
  if (!context) {
    throw new Error("useOperationStatus must be used within an OperationStatusProvider");
  }
  return context;
};
