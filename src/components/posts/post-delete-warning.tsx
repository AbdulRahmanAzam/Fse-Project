import { Button } from "../ui/button";
import { Dialog, DialogFooter, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const PostDeleteWarning = ({
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
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={(e) => {
              e.stopPropagation();
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

export default PostDeleteWarning;
