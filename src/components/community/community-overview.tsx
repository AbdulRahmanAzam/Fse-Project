import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Community } from "@/lib/api.d";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCommunityColor } from "@/lib/random-colors";
import CommunityLeaveWarning from "./community-leave-warning";

interface CommunityCardProps {
  community: Community;
  onJoinLeave: (communityId: number) => void;
}

const CommunityOverview = ({ community, onJoinLeave }: CommunityCardProps) => {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const navigate = useNavigate();
  const [color1, color2] = getCommunityColor(community.id.toString());

  const handleJoinLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (community.isMember)
      setShowLeaveDialog(true);
    else
      onJoinLeave(community.id);
  };

  return (
    <>
      <Card
        className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-transform hover:-translate-y-1 cursor-pointer"
        onClick={() => navigate(`/community/${community.id}`)}
      >
        <div className="relative h-32">
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(to right, ${color1}, ${color2})`
            }}
          />
        </div>

        {/* Content */}
        <CardContent className="flex flex-col h-[180px] p-4 pt-6">
          <div className="flex-none">
            <CardTitle className="font-bold text-lg mb-1">{community.name}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
              {community.description}
            </CardDescription>
          </div>
          
          <div className="flex-grow" />
          
          <CardFooter className="flex justify-between p-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {community.memberCount.toLocaleString()} members
            </span>
            <Button
              variant={community.isMember ? "outline" : "default"}
              onClick={handleJoinLeave}
            >
              {community.isMember ? "Leave" : "Join"}
            </Button>
          </CardFooter>
        </CardContent>
      </Card>
      <CommunityLeaveWarning
        community={community}
        showLeaveDialog={showLeaveDialog}
        setShowLeaveDialog={setShowLeaveDialog}
        onJoinLeave={onJoinLeave}
      />
    </>
  );
};

export default CommunityOverview;