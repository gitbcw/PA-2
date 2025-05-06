import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { Button } from "@/components/ui/button";
import NewObjectiveForm from "./NewObjectiveForm";


interface EditObjectiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingObjective: any | null;
  objectives: any[];
  userId: string;
  onSuccess: (updated: any) => void;
}

export default function EditObjectiveDialog({ open, onOpenChange, editingObjective, objectives, userId, onSuccess }: EditObjectiveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑目标</DialogTitle>
        </DialogHeader>
        {editingObjective && (
          <NewObjectiveForm
            objectives={objectives}
            onSuccess={updated => {
              onSuccess(updated);
              onOpenChange(false);
            }}
            userId={userId}
            mode="edit"
            initialData={editingObjective}
            onClose={() => onOpenChange(false)}
          >
            <DialogFooter className="gap-2 px-6 pb-6">
              <Button type="submit" variant="default" size="sm">保存修改</Button>
              <Button type="button" variant="outline" size="sm" data-close="true">取消</Button>
            </DialogFooter>
          </NewObjectiveForm>
        )}
      </DialogContent>
    </Dialog>
  );
}
