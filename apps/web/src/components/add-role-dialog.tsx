import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle } from "./ui/dialog";
import { orpc } from "@/utils/orpc";
import { Button } from "./ui/button";
import z from "zod";
import { Input } from "./ui/input";

interface AddRoleDialogProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    onRoleCreated: (roleId: string) => void;
}

const formSchema = z.object({
  name: z.string(),
  color: z.hex()
})

export const AddRoleDialog = ({open, setOpen}: AddRoleDialogProps) => {

  const addPositionMutation = useMutation(orpc.positionRouter.createPosition.mutationOptions())

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogTitle>Add Role</DialogTitle>
      <div>
        <Input type="color" />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Close</Button>
        </DialogClose>
        <Button>
          Create
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
