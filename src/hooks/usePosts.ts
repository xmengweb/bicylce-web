import { IPostsRes } from "@/pages/index"
import { useStore } from "@/store/user"
import { request, getStorageSync, useDidShow } from '@tarojs/taro'
import { useCallback, useEffect, useRef, useState } from "react"

const usePosts = (query?: string) => {
  const hasLogin = useStore((store) => store.hasLogin)
  const [hasMore, setHasMore] = useState(true)
  const [posts, setPosts] = useState<IPostsRes[]>([])
  const total = useRef(0)
  const curPage = useRef(1)

  async function getPosts(isLogin: boolean, curpage = 1, q = "") {
    try {
      const res = await request({
        method: 'GET',
        url: 'https://api.xmcug.cn/posts',
        header: {
          Authorization: `Bearer ${getStorageSync('token')}`,
        },
        data: {
          page: curpage,
          limit: 10,
          isLogin,
          query: q
        },
      })
      setPosts(res.data.data)
      total.current = res.data.total
    } catch (error) {
      console.log(error)
    }
  }

  const loadMore = async () => {
    if (curPage.current * 10 < total.current) {
      const res = await request({
        method: 'GET',
        url: 'https://api.xmcug.cn/posts',
        header: {
          Authorization: `Bearer ${getStorageSync('token')}`,
        },
        data: {
          page: ++curPage.current,
          limit: 10,
          isLogin: hasLogin,
          query: query
        },
      })
      setPosts((prevPosts) => [...prevPosts, ...res.data.data])
      total.current = res.data.total
    } else {
      setHasMore(false)
    }
  }

  const likePost = useCallback(
    async function (postId: number) {
      const res = await request({
        method: 'PATCH',
        url: `https://api.xmcug.cn/posts/${postId}/like`,
      })
      if (res.data.success) {
        const newposts = posts.map((post) => {
          if (post.post_id === postId) {
            return {
              ...post,
              isLikedByUser: !post.isLikedByUser, // 切换点赞状态
              likeCount: post.likeCount + (post.isLikedByUser ? -1 : 1), // 更新点赞数
            }
          }
          return post
        })
        setPosts(newposts)
      }
    },
    [posts, setPosts],
  )

  useDidShow(() => {
    curPage.current = 1
    getPosts(hasLogin, 1, query)
  })

  useEffect(() => {
    curPage.current = 1
    getPosts(hasLogin, 1, query)
  }, [hasLogin, query])

  return { hasMore, posts, loadMore, getPosts, setPosts, likePost }
}

export default usePosts
