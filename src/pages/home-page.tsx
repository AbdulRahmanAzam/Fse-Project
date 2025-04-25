import FeedComponent from '@/components/home/feed';
import LeftSidebar from '@/components/home/left-sidebar';
import RightSidebar from '@/components/home/right-sidebar';

const HomePage = () => {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />

      <main className="flex-1 border-x border-gray-200 dark:border-gray-800">
        <div className="container max-w-4xl mx-auto py-4 px-2">
          <FeedComponent />
        </div>
      </main>

      <RightSidebar />
    </div>
  )
}

export default HomePage;
