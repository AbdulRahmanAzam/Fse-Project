import { Button } from "../ui/button";
import { Dialog, DialogFooter, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const CommentDeleteWarning = ({
  open,
  onOpenChange,
  onDelete
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              onDelete();
              onOpenChange(false);
            }}>
              Delete
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CommentDeleteWarning;
