import React from "react";
import { createRoot } from "react-dom/client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type ButtonProps = {
  visible?: boolean;
  func?: () => void;
  label?: string;
};

type AlertOptions = {
  title: string;
  description: string;
  close?: ButtonProps;
  action?: ButtonProps;
};

export function alertPopup(options: AlertOptions) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  const cleanup = () => {
    setTimeout(() => {
      root.unmount();
      container.remove();
    }, 300);
  };

  const {
    title,
    description,
    close = { visible: true, label: "Cancel" },
    action = { visible: true, label: "Confirm" },
  } = options;

  const Alert = () => {
    const [open, setOpen] = React.useState(true);

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {close.visible && (
              <AlertDialogCancel
                onClick={() => {
                  close.func?.();
                  cleanup();
                }}
              >
                {close.label || "Close"}
              </AlertDialogCancel>
            )}
            {action.visible && (
              <AlertDialogAction
                onClick={() => {
                  action.func?.();
                  cleanup();
                }}
              >
                {action.label || "Continue"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  root.render(<Alert />);
}
