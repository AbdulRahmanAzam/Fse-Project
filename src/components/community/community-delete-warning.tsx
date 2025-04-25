import { Community } from "@/lib/api.d";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "../ui/dialog";

const CommunityDeleteWarning = ({
  showDeleteDialog,
  setShowDeleteDialog,
  deleteCommunity,
  community
}: {
  showDeleteDialog: boolean,
  setShowDeleteDialog: (show: boolean) => void,
  deleteCommunity: () => void,
  community: Community
}) => {
  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Community</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {community.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteCommunity();
              setShowDeleteDialog(false);
            }}
          >
            Delete Community
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CommunityDeleteWarning;
