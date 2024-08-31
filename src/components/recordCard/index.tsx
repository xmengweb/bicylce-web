import { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import { navigateTo, eventCenter } from '@tarojs/taro'
import { IconFont } from '@nutui/icons-react-taro'
import './index.less'

const infoList = [
  {
    numberdw: '秒',
    name: '时长',
  },
  {
    numberdw: 'km/h',
    name: '配速',
  },
  {
    numberdw: 'km/h',
    name: '极速',
  },
  {
    numberdw: 'km',
    name: '里程距离',
  },
]

interface IMarker {
  iconPath: string
  id: number
  latitude: number
  longitude: number
  width: number
  height: number
}

interface IPoint {
  longitude: number
  latitude: number
  time?: number
  speed?: number
}

export interface IRecordInfo {
  average_speed: number
  fatest_speed: number
  distance: number
  startPoint: string
  endPoint: string
  marker: IMarker[]
  polyline: {
    points: IPoint[]
    color: string
    width: number
    arrowLine: boolean
  }[]
  record_id: number
  userId: number
  created_at: string
  seconds: number
  stay_times: number
  cal: number
  height_dif: number
  min_height: number
  max_height: number
}

interface IProp {
  recordInfo: IRecordInfo
  isShowInfo?: boolean
  onChoose?: (record?: IRecordInfo) => void
}

export default function RecordCard({ recordInfo, isShowInfo = false, onChoose = () => {} }: IProp) {
  const formattedDate = useMemo(() => {
    const date = new Date(recordInfo.created_at)
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // getMonth()返回的月份从0开始，所以需要+1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return `${year}年${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }, [recordInfo])

  const renderData = function () {
    const { seconds, average_speed, fatest_speed, distance } = recordInfo
    const data = [seconds, average_speed, fatest_speed, distance]
    return infoList.map((item, index) => {
      let dom = (
        <View className="number">
          <Text className="text-number">{data[index].toFixed(2)}</Text>
          {item.numberdw}
        </View>
      )
      if (index == 0) {
        let seconds2 = seconds
        const hours = Math.floor(seconds2 / 3600)
        seconds2 %= 3600
        const minutes = Math.floor(seconds2 / 60)
        seconds2 %= 60
        if (hours > 0) {
          dom = (
            <View className="number">
              <Text className="text-number">{hours}</Text>时<Text className="text-number">{minutes}</Text>分
              <Text className="text-number">{seconds2}</Text>秒
            </View>
          )
        } else if (minutes > 0) {
          dom = (
            <View className="number">
              <Text className="text-number">{minutes}</Text>分<Text className="text-number">{seconds2}</Text>秒
            </View>
          )
        }
      }
      return (
        <View className="bottom-item" key={index}>
          {dom}
          <View className="name">{item.name}</View>
        </View>
      )
    })
  }

  return (
    <View
      className="recordCard"
      onClick={() => {
        if (isShowInfo) {
          onChoose(recordInfo)
        } else {
          navigateTo({
            url: '/pages/bicycle/subpages/detail/index',
            success: function () {
              setTimeout(() => {
                // 通过eventChannel向被打开页面传送数据
                eventCenter.trigger('acceptDataFromOpenerPage', { ...recordInfo })
              }, 100)
            },
          })
        }
      }}
    >
      <View className="title">
        <IconFont
          fontClassName="iconfont"
          classPrefix="icon"
          name="lvzhou_lujing_guiji"
          size={20}
          color="#74e533"
          style={{ marginRight: '3px' }}
        />
        <Text className="title-text">{formattedDate}</Text>
      </View>
      <View className="twoPoints">
        <View className="begin">
          <View className="beginPoint"></View>
          {recordInfo.startPoint}
        </View>
        <View className="end">
          <View className="endPoint"></View>
          {recordInfo.endPoint}
        </View>
      </View>
      <View className="bottom">{renderData()}</View>
    </View>
  )
}
