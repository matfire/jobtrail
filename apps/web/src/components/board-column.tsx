import type { ApplicationWithPosition } from "@jobtrail/api/schemas/combi";
import type { VALID_KAMBAN_TABLES } from "@jobtrail/common";
import { type DragEvent, useState } from "react";
import { ApplicationCard } from "./application-card";

interface BoardColumnProps {
	type: VALID_KAMBAN_TABLES;
	onDrop: (appId: string, status: VALID_KAMBAN_TABLES) => void;
	items: ApplicationWithPosition[];
	title: string;
}

export const BoardColumn = ({
	type,
	onDrop,
	items,
	title,
}: BoardColumnProps) => {
	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		console.log(e);
		const appId = e.dataTransfer.getData("applicationId");
		onDrop(appId, type);
	};

	return (
		<div
			className="min-w-[280px] flex-1 rounded-lg bg-muted/50 p-4"
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-semibold text-foreground">{title}</h3>
				<span className="rounded-full bg-background px-2 py-1 text-muted-foreground text-sm">
					{items.length}
				</span>
			</div>
			<div className="space-y-3">
				{items.map((app) => {
					console.log(app);
					return (
						<div
							key={app.application.id}
							draggable
							onDragStart={(e) =>
								e.dataTransfer.setData("applicationId", app.application.id)
							}
							className="cursor-move"
						>
							<ApplicationCard
								application={app.application}
								position={app.position}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};
