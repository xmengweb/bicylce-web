import React from 'react'
import { useLoad, navigateTo } from '@tarojs/taro'
import { useStore } from '@/store/user'
import { View } from '@tarojs/components'
import { Button, Cell } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import ManCard from '@/components/manCard/index'
import './index.less'

const seletionsConfig = [
  {
    name: '骑行记录',
    url: '/pages/bicycle/subpages/record/index',
  },
  {
    name: '骑行数据',
    url: '/pages/my/subpages/data/index',
  },
  // {
  //   name: '我的动态',
  //   url: '/pages/my/subpages/data/index',
  // },
  { name: '邀请朋友', url: '' },
  {
    name: '关于小程序',
    url: '/pages/my/subpages/about/index',
  },
]

export default function My() {
  const hasLogin = useStore((store) => store.hasLogin)
  const userId = useStore((store) => store.userId)
  const username = useStore((store) => store.username)
  const headpic = useStore((store) => store.headpic)

  useLoad(() => {
    console.log('Page loaded.')
  })

  const onJumpclick = (_event: React.MouseEvent<HTMLDivElement, MouseEvent>, link: string) => {
    if (link) {
      navigateTo({ url: link })
    }
  }

  return (
    <View className="my">
      <ManCard
        name={username}
        pic={headpic}
        onClick={() => {
          let url = `/pages/my/subpages/setting/index?id=${userId}`
          navigateTo({ url: hasLogin ? url : '/pages/my/subpages/login/index' })
        }}
      />
      <View className="my-seletions">
        <Cell.Group>
          {seletionsConfig.map((item, index) => {
            if (index === 2) {
              return (
                <Cell
                  key={index}
                  className="nutui-cell-clickable"
                  title="邀请朋友"
                  extra={
                    <>
                      <ArrowRight />
                      <Button
                        style={{ position: 'absolute', width: '100%', height: '100%', border: 0 }}
                        openType="share"
                      />
                    </>
                  }
                  align="center"
                />
              )
            } else {
              return (
                <Cell
                  key={index}
                  className="nutui-cell-clickable"
                  title={item.name}
                  extra={<ArrowRight />}
                  align="center"
                  onClick={(event: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
                    onJumpclick(event, item.url)
                  }}
                />
              )
            }
          })}
        </Cell.Group>
      </View>
    </View>
  )
}
