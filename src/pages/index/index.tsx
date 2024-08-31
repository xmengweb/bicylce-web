import { navigateTo } from '@tarojs/taro'
import { useState } from 'react'
import { View } from '@tarojs/components'
import { SearchBar, Button, Swiper, Image, Avatar, InfiniteLoading } from '@nutui/nutui-react-taro'
import { Plus } from '@nutui/icons-react-taro'
import { useStore } from '@/store/user'
import MsgCard from '@/components/msgCard'
import usePosts from '@/hooks/usePosts'
import './index.less'

export type IPostsRes = {
  commentCount: number
  likeCount: number
  content: string
  createdAt: string
  imageUrls: Array<string>
  post_id: number
  rideId?: number | undefined
  rides?:
    | {
        average_speed: number
        created_at: string
        distance: number
        endPoint: string
        fatest_speed: number
        marker: Array<any>
        polyline: Array<any>
        record_id: number
        seconds: number
        startPoint: string
        userId: number
      }
    | undefined
  title: string
  user: {
    head_pic: string
    user_id: number
    username: string
  }
  isCommentedByUser: boolean
  isLikedByUser: boolean
  total: number
}
export default function Index() {
  const { hasMore, posts, loadMore, likePost } = usePosts()
  const head_pic = useStore((store) => store.headpic)
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = () => {
    navigateTo({
      url: `/pages/index/subpages/searchPost/index?query=${searchValue}`,
    })
  }

  return (
    <>
      <View className="index">
        <View className="input">
          <Avatar size="small" src={head_pic} style={{ marginLeft: '8px' }} />
          <SearchBar
            shape="round"
            placeholder="请输入搜索内容"
            value={searchValue}
            onSearch={handleSearch}
            onChange={(value) => setSearchValue(value)}
          />
          <Button className="dk" type="success" onClick={handleSearch}>
            搜索
          </Button>
        </View>
        <View style={{ height: 'calc(100vh - 80rpx)' }}>
          <InfiniteLoading
            target="scroll"
            hasMore={hasMore}
            onLoadMore={loadMore}
            loadingText={<>加载中</>}
            loadMoreText={<>没有更多了</>}
          >
            <Swiper autoPlay indicator height={160}>
              {[
                'https://www.japan-travel.cn/japan-magazine/202109_best-destinations-cycling-and-bike-tours-japan/22d027b4365ac7a43124a577c539f567c7290320.jpg',
                'http://img.daimg.com/uploads/allimg/190528/3-1Z52R32640.jpg'
              ].map((item, index) => (
                <Swiper.Item key={index}>
                  <Image src={item} mode="aspectFill" />
                </Swiper.Item>
              ))}
            </Swiper>
            <View className="community">
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
            </View>
            <View className="add-post">
              <Button
                shape="round"
                color="#00bc14"
                type="primary"
                icon={<Plus size={20} />}
                onClick={() => {
                  navigateTo({ url: '/pages/index/subpages/addPost/index' })
                }}
              />
            </View>
          </InfiniteLoading>
        </View>
      </View>
    </>
  )
}
