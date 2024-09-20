"use client";

import { useEffect, useRef, useCallback } from "react";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/github-dark.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

hljs.registerLanguage("json", json);

export function AlertDialogDemo({
  className,
  buttonText,
  dialogTitle,
  dialogContent,
  lang,
  close,
  closeText,
  confirm,
  confirmText,
  children,
}: {
  className?: string;
  buttonText: string;
  dialogTitle: string;
  dialogContent: string;
  lang: string;
  close?: boolean;
  closeText?: string;
  confirm?: boolean;
  confirmText?: string;
  children?: React.ReactNode;
}) {
  const codeRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const highlightCode = useCallback(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, []);

  useEffect(() => {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const callback = (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (
              node instanceof HTMLElement &&
              node.classList.contains("alert-dialog-content")
            ) {
              highlightCode();
            }
          });
        }
      }
    };

    observerRef.current = new MutationObserver(callback);
    observerRef.current.observe(targetNode, config);

    // Initial check in case the content is already in the DOM
    highlightCode();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [highlightCode]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className={className}>
        <Button variant="default">
          {buttonText} {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl alert-dialog-content">
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="max-h-[60vh] overflow-y-auto rounded bg-gray-900 p-4">
              <pre className="text-sm">
                <code ref={codeRef} className={`language-${lang}`}>
                  {dialogContent}
                </code>
              </pre>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {close && (
            <AlertDialogCancel asChild>
              <Button variant="outline">
                {closeText ? closeText : "Close"}
              </Button>
            </AlertDialogCancel>
          )}
          {confirm && (
            <AlertDialogAction asChild>
              <Button variant="default">
                {confirmText ? confirmText : "Confirm"}
              </Button>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
