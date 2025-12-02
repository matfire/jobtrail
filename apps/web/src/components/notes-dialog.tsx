import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Notebook } from "lucide-react";
import { useState } from "react";
import { orpc } from "@/utils/orpc";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";

interface NotesDialogProps {
	applicationId: string;
}

export const NotesDialog = ({ applicationId }: NotesDialogProps) => {
	const { data } = useQuery(
		orpc.noteRouter.getNotes.queryOptions({ input: { applicationId } }),
	);
	const createNoteMutation = useMutation(
		orpc.noteRouter.createNote.mutationOptions(),
	);
	const queryClient = useQueryClient();
	const [newNote, setNewNote] = useState("");

	const [open, setOpen] = useState(false);

	const handleNoteCreation = () => {
		createNoteMutation.mutate(
			{
				applicationId,
				content: newNote,
			},
			{
				onSuccess: async () => {
					await queryClient.invalidateQueries({
						queryKey: orpc.noteRouter.getNotes.key({
							input: { applicationId },
						}),
					});
					setNewNote("");
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost">
					<Notebook />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>View/Add Notes</DialogTitle>
					<DialogDescription />
				</DialogHeader>
				<div className="flex h-full max-h-[60vh] flex-col gap-4">
					<div className="flex flex-col gap-4 overflow-y-auto">
						{data?.data.map((note) => (
							<Card key={note.id}>
								<CardContent>{note.content}</CardContent>
							</Card>
						))}
					</div>
					<div>
						<Textarea
							value={newNote}
							onChange={(e) => setNewNote(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Close</Button>
					</DialogClose>
					<Button onClick={handleNoteCreation} disabled={newNote.length === 0}>
						Add Note
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
