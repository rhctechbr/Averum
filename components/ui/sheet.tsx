"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

export function Sheet({ title, trigger, children }: { title: string; trigger: ReactNode; children: ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-[12px] bg-surface p-5 shadow-xl md:inset-y-0 md:left-auto md:right-0 md:w-[440px] md:rounded-none md:border-l md:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" aria-label="Fechar painel" className="h-10 w-10 px-0"><X size={19} /></Button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
