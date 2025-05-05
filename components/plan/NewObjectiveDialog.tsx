import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";
import NewObjectiveForm from "./NewObjectiveForm";


interface NewObjectiveDialogProps {
  objectives: any[];
  onSuccess: (o: any) => void;
  userId: string;
  trigger?: React.ReactNode;
}

export default function NewObjectiveDialog({ objectives, onSuccess, userId, trigger }: NewObjectiveDialogProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            新建目标
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建目标</DialogTitle>
        </DialogHeader>
        <NewObjectiveForm
          objectives={objectives}
          onSuccess={o => {
            onSuccess(o);
            setOpen(false);
          }}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
}
