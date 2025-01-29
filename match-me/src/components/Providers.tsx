import React, { ReactNode } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastContainer position="bottom-right" hideProgressBar />
      {children}
    </HeroUIProvider>
  );
}
