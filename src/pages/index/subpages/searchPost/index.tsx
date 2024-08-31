import MsgCard from '@/components/msgCard'
import usePosts from '@/hooks/usePosts'
import { InfiniteLoading } from '@nutui/nutui-react-taro'
import { View } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'

definePageConfig({
  navigationBarTitleText: '查询列表',
})

export default function SearchPost() {
  const router = useRouter()
  const { hasMore, posts, loadMore, likePost } = usePosts(router.params.query)

  return (
    <View className="search-post">
      <InfiniteLoading
        target="scroll"
        hasMore={hasMore}
        onLoadMore={loadMore}
        loadingText={<>加载中</>}
        loadMoreText={<>没有更多了</>}
      >
          {posts?.map((item) => {
            const params = {
              userName: item.user.username,
              avatarSrc: item.user.head_pic,
              createdAt: item.createdAt,
              imgUrls: item.imageUrls,
              title: item.title,
              content: item.content,
              recordInfo: item.rides,
              commentCount: item.commentCount,
              likeCount: item.likeCount,
              postId: item.post_id,
              isLikedByUser: item.isLikedByUser,
            }
            return (
              <>
                <MsgCard {...params} likePost={likePost} />
              </>
            )
          })}
      </InfiniteLoading>
    </View>
  )
}
