"use client";

import React, { ReactNode } from "react";

interface GoalChatLayoutProps {
  chatComponent: ReactNode;
  visualizationComponent: ReactNode;
}

export function GoalChatLayout({
  chatComponent,
  visualizationComponent,
}: GoalChatLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-[80vh]">
      {/* 左侧聊天区域 */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden flex flex-col border-r relative">
        {chatComponent}
      </div>
      
      {/* 右侧目标可视化区域 */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-auto">
        {visualizationComponent}
      </div>
    </div>
  );
}
