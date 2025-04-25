import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Community } from "@/lib/api.d";

const CommunityLeaveWarning = ({
  community,
  showLeaveDialog,
  setShowLeaveDialog,
  onJoinLeave
}: {
  community: Community,
  showLeaveDialog: boolean,
  setShowLeaveDialog: (show: boolean) => void,
  onJoinLeave: (communityId: number) => void
}) => {
  return (
    <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Community</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave {community.name}? You can always join back later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onJoinLeave(community.id);
              setShowLeaveDialog(false);
            }}
          >
            Leave Community
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityLeaveWarning;
