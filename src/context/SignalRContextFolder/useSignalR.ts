import { useContext } from "react";
import SignalContext from "../SignalRContextFolder/SignalRContext"; 

export const useSignal = () => {
  const context = useContext(SignalContext);
  if (!context) {
    throw new Error("useSignal must be used within a SignalProvider");
  }
  return context;
};