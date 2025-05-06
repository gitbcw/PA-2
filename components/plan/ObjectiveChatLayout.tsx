import React from "react";

interface ObjectiveChatLayoutProps {
  chatComponent: React.ReactNode;
  visualizationComponent: React.ReactNode;
}

export function ObjectiveChatLayout({ chatComponent, visualizationComponent }: ObjectiveChatLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1 min-w-[320px] max-w-xl">{chatComponent}</div>
      <div className="flex-1 min-w-[320px]">{visualizationComponent}</div>
    </div>
  );
}
