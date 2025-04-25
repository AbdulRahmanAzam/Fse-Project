import { Post } from "@/lib/api.d";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { MoreHorizontal } from "lucide-react";
import VoteButtons from "./vote-buttons";
import { formatTime } from "@/lib/utils";

const PostOverview = ({
  post,
  handleVote,
}: {
  post: Post,
  handleVote: (postId: number, voteType: 'up' | 'down') => void,
}) => {
  const navigate = useNavigate();
  const voteDifference = post.upvotes - post.downvotes;
  const [isOpen, setIsOpen] = useState(voteDifference >= 0);

  return (
    <div className="flex items-start gap-1">
      {!isOpen && <div className='flex items-center gap-1'>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-0 w-6 h-6 flex items-center justify-center hover:bg-accent/50"
          onClick={() => setIsOpen(true)}
        >
          +
        </Button>
        <p className='text-sm text-muted-foreground'>Post hidden</p>
      </div>}

      <div className="flex-1">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <CollapsibleContent>
            <article key={post.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {post.image ? (
                    <img src={post.image} alt="Post" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="rounded-full w-5 h-5 bg-gray-300" />
                  )}
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={() => navigate(`/community/${post.community.id}`)}
                  >
                    {post.community.name}
                  </Button>
                  <Label className="text-sm text-gray-500">{formatTime(new Date(post.createdAt))}</Label>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent/50"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsOpen(false)}>
                      Hide post
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>
                      Report
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Save
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col justify-between my-2 space-y-2">
                <h1 className="text-lg font-bold truncate">{post.title}</h1>
                <p className="line-clamp-5 text-sm text-gray-700 dark:text-gray-300">{post.content}</p>
              </div>

              {post.image && (
                <div className="rounded-lg overflow-hidden mb-4">
                  <img src={post.image} alt="Post" className="w-full" />
                </div>
              )}

              <div className="flex items-center space-x-1">
                <VoteButtons post={post} handleVote={handleVote} />
                <Button
                  variant="ghost"
                  className="text-sm text-gray-500"
                  onClick={() => { }}
                >
                  Comments
                </Button>
              </div>
            </article>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}

export default PostOverview;
