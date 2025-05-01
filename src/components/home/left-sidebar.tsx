import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Community } from "@/lib/api.d";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "../ui/skeleton";

const useCommunitiesQuery = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['mycommunities'],
    queryFn: () => api.get('user/communities')
  })
  return { data: (data?.data?.communities || []) as Community[], isLoading, error, refetch }
}

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { data: communities, isLoading, error, refetch } = useCommunitiesQuery();

  return (
    <div className="w-64 p-4 hidden md:block bg-white dark:bg-gray-950 h-screen sticky top-0">
      <div className="flex items-center mb-8">
        <img src="../src/assets/genz-logo2.png" alt="" className='w-10 h-10' />
        <h1 className="text-2xl font-bold">GenZ Scholars</h1>
        <div className="w-2 h-2 rounded-full bg-green-500 ml-1"></div>
      </div>

      <nav className="space-y-2">
        <NavItem icon="🏠" label="Home" href="/" active />
        <NavItem icon="👤" label="Profile" href="/profile" />
        <NavItem icon="🔍" label="Explore Communities" href="/communities" />
        <NavItem icon="🤝" label="Friends" href="/friends" />
      </nav>

      
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">My Communities</h2>
        <div className="space-y-3">
          {error ? (
            <div className='flex flex-col gap-2'>
              <p className="text-sm text-red-500 dark:text-red-400">Error loading communities</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-10 rounded-lg" />
            ))
          ) : communities.length > 0 ? (
            communities.slice(0, 3).map((community) => (
              <CommunityItem key={community.id} community={community} />
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No joined communities</p>
          )}
        </div>
        {communities.length > 0 && <Button
          variant="link"
          className="mt-4 w-full text-sm text-primary flex justify-center py-2"
          onClick={() => navigate('/profile#communities')}
        >
          See All
        </Button>}
      </div>
    </div>
  )
}

const NavItem = ({ icon, label, href, active = false }: { icon: string; label: string; href: string; active?: boolean }) => {
  return (
    <Link
      to={href}
      className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 ${active ? 'bg-gray-100 dark:bg-gray-900' : ''}`}
    >
      <span className="mr-3">{icon}</span>
      <span className={`${active ? 'font-medium' : ''}`}>{label}</span>
    </Link>
  )
}

const CommunityItem = ({ community }: { community: Community }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      className="flex items-center w-full justify-start py-7"
      onClick={() => navigate(`/community/${community.id}`)}
    >
      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
      <div className="ml-2 text-left w-full">
        <p className="text-sm font-medium">{community.name}</p>
        <p className="text-xs text-gray-500">{community.memberCount} members</p>
      </div>
    </Button>
  )
}

export default LeftSidebar;
