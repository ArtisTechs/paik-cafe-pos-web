import React, { createContext, useContext } from "react";
import useGlobalState from "../hooks/global-state";

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const globalState = useGlobalState();

  return (
    <GlobalStateContext.Provider value={globalState}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use the context
export const useGlobalContext = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error(
      "useGlobalContext must be used within a GlobalStateProvider"
    );
  }
  return context;
};
