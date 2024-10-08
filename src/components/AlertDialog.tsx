/* Copy and pasted with modifications from shadcn */

import React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

export const AlertDialog =
  AlertDialogPrimitive.Root as typeof AlertDialogPrimitive.Root & {
    Cancel: typeof AlertDialogCancel;
    Trigger: typeof AlertDialogPrimitive.Trigger;
    Portal: typeof AlertDialogPortal;
    Overlay: typeof AlertDialogOverlay;
    Content: typeof AlertDialogContent;
    Header: typeof AlertDialogHeader;
    Footer: typeof AlertDialogFooter;
    Title: typeof AlertDialogTitle;
    Description: typeof AlertDialogDescription;
    Action: typeof AlertDialogAction;
  };

AlertDialog.Trigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = ({
  children,
  ...props
}: AlertDialogPrimitive.AlertDialogPortalProps) => (
  <AlertDialogPrimitive.Portal {...props}>
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {children}
    </div>
  </AlertDialogPrimitive.Portal>
);
AlertDialog.Portal = AlertDialogPortal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(function AlertDialogOverlay({ className, children, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Overlay
      className={
        "animate-in fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
      }
      {...props}
      ref={ref}
    />
  );
});
AlertDialog.Overlay = AlertDialogOverlay;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(function AlertDialogContent({ className, ...props }, ref) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className="animate-in fade-in-90 slide-in-from-bottom-10 sm:zoom-in-90 sm:slide-in-from-bottom-0 fixed z-50 grid w-full max-w-lg scale-100 gap-4 bg-white p-6 opacity-100 sm:rounded-lg md:w-full dark:bg-slate-900"
        {...props}
      />
    </AlertDialogPortal>
  );
});
AlertDialog.Content = AlertDialogContent;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="flex flex-col space-y-2 text-center sm:text-left"
    {...props}
  />
);
AlertDialog.Header = AlertDialogHeader;

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4"}
    {...props}
  />
);
AlertDialog.Footer = AlertDialogFooter;

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(function AlertDialogTitle({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      className="text-lg font-semibold text-slate-900 dark:text-slate-50"
      {...props}
    />
  );
});
AlertDialog.Title = AlertDialogTitle;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className="text-sm text-slate-500 dark:text-slate-400"
      {...props}
    />
  );
});
AlertDialog.Description = AlertDialogDescription;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(function AlertDialogAction({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Action
      ref={ref}
      className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
      {...props}
    />
  );
});
AlertDialog.Action = AlertDialogAction;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(function AlertDialogCancel({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className="mt-2 inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-transparent px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
      {...props}
    />
  );
});
AlertDialog.Cancel = AlertDialogCancel;
