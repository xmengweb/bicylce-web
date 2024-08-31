import { useRef, useState } from 'react'
import { View } from '@tarojs/components'
import { useLoad, request, getStorageSync } from '@tarojs/taro'
import { InfiniteLoading } from '@nutui/nutui-react-taro'
import { useStore } from '@/store/user'
import RecordCard from '@/components/recordCard'
import useFlagShow from '@/hooks/useFlagShow'
import './index.less'

definePageConfig({
  navigationBarTitleText: '骑行记录',
})

export default function Record() {
  const userId = useStore((store) => store.userId)
  const [hasMore, setHasMore] = useState(true)
  const [recordList, setRecordList] = useState<any[]>([])
  const total = useRef(0)
  const curPage = useRef(1)
  useFlagShow()
  async function getList(page = 1) {
    const res = await request({
      method: 'GET',
      url: 'https://api.xmcug.cn/ride',
      header: {
        Authorization: `Bearer ${getStorageSync('token')}`,
      },
      data: {
        page,
        limit: 10,
        userId,
      },
    })
    total.current = res.data.total
    setRecordList((prevRecordList) => [...prevRecordList, ...res.data.results])
  }
  useLoad(() => {
    getList(curPage.current)
  })
  const loadMore = async () => {
    if (curPage.current * 10 < total.current) {
      await getList(++curPage.current)
    } else {
      setHasMore(false)
    }
  }

  return (
    <View className="record">
      <InfiniteLoading
        target="scroll"
        hasMore={hasMore}
        onLoadMore={loadMore}
        loadingText={
          <>
            加载中
          </>
        }
        loadMoreText={
          <>
            没有更多了
          </>
        }
      >
        {recordList.map((item) => {
        return (
          <>
            <RecordCard recordInfo={item} />
          </>
        )
      })}
      </InfiniteLoading>
    </View>
  )
}
