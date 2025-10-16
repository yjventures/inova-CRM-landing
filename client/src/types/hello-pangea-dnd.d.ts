declare module "@hello-pangea/dnd" {
  import * as React from "react";

  export interface DropResult {
    draggableId: string;
    type: string;
    source: { droppableId: string; index: number };
    destination: { droppableId: string; index: number } | null;
    reason: "DROP" | "CANCEL";
    mode: "FLUID" | "SNAP";
    combine?: unknown;
  }

  export const DragDropContext: React.FC<{ onDragEnd: (result: DropResult) => void; children?: React.ReactNode }>;
  export const Droppable: React.FC<{
    droppableId: string;
    children: (provided: {
      innerRef: (element: HTMLElement | null) => any;
      droppableProps: React.HTMLAttributes<any>;
      placeholder: React.ReactNode;
    }) => React.ReactNode;
  }>;
  export const Draggable: React.FC<{
    draggableId: string;
    index: number;
    children: (provided: {
      innerRef: (element: HTMLElement | null) => any;
      draggableProps: React.HTMLAttributes<any>;
      dragHandleProps: React.HTMLAttributes<any>;
    }, snapshot: { isDragging: boolean }) => React.ReactNode;
  }>;
}


