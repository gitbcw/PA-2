import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AiAssistant from "@/components/plan/AiAssistant";

interface AiAssistantDialogProps {
  open: boolean;
  onClose: () => void;
  onAdoptGoal: (goal: any) => void;
}

const AiAssistantDialog: React.FC<AiAssistantDialogProps> = ({ open, onClose, onAdoptGoal }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>AI 辅助生成目标</DialogTitle>
        <DialogDescription>让 AI 帮你制定 SMART 目标或分解目标，生成内容可直接采纳为新目标。</DialogDescription>
      </DialogHeader>
      <AiAssistant onAdoptGoal={onAdoptGoal} />
    </DialogContent>
  </Dialog>
);

export default AiAssistantDialog;
