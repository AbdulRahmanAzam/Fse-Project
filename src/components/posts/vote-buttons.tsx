import { ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "../ui/button"
import { Post } from "@/lib/api.d"
import { cn } from "@/lib/utils"

const VoteButtons = ({
  post,
  handleVote
}: {
  post: Post,
  handleVote: (postId: number, voteType: 'up' | 'down') => void
}) => {
  return (
    <Button
      variant="ghost"
      className="flex px-1 hover:bg-accent/50"
    >
      <div
        className={cn("text-sm p-1 mx-1 hover:bg-accent rounded-full", post.userVote === 'up' && 'text-green-500')}
        onClick={() => handleVote(post.id, 'up')}
      >
        <ArrowUp className="w-4 h-4" />
      </div>
      <span className="text-sm">{post.upvotes - post.downvotes}</span>
      <div
        className={cn("text-sm p-1 mx-1 hover:bg-accent rounded-full", post.userVote === 'down' && 'text-red-500')}
        onClick={() => handleVote(post.id, 'down')}
      >
        <ArrowDown className="w-4 h-4" />
      </div>
    </Button>
  )
}

export default VoteButtons;
  