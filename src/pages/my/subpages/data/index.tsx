import { View } from '@tarojs/components'
import { Tabs } from '@nutui/nutui-react-taro'
import { useRef, useState } from 'react'
import { useLoad, request } from '@tarojs/taro'
import Echarts, { EChartOption } from 'taro-react-echarts'
import moment from 'moment'
import echarts from '../../../../assets/libs/echarts'
import './index.less'

definePageConfig({
  navigationBarTitleText: '数据统计',
})

const option_week: EChartOption = {
  legend: {
    top: 50,
    left: 'center',
    z: 100,
  },
  tooltip: {
    trigger: 'axis',
    show: true,
    confine: true,
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: {
    type: 'value',
  },
  // series: [
  //   {
  //     data: [0, 0, 0, 0, 0, 0, 0],
  //     type: 'bar',
  //   },
  // ],
}

const option_month: EChartOption = {
  legend: {
    top: 50,
    left: 'center',
    z: 100,
  },
  tooltip: {
    trigger: 'axis',
    show: true,
    confine: true,
  },
  xAxis: {
    type: 'category',
    data: ['1', '2', '3', '4', '5', '6'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [0, 0, 0, 0, 0, 0, 0],
      type: 'bar',
    },
  ],
}

const option_year: EChartOption = {
  legend: {
    top: 50,
    left: 'center',
    z: 100,
  },
  tooltip: {
    trigger: 'axis',
    show: true,
    confine: true,
  },
  xAxis: {
    type: 'category',
    data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      type: 'bar',
    },
  ],
}

export default function Data() {
  const [tab1value, setTab1value] = useState<string | number>('0')
  const echartsRef_week = useRef<any>(null)
  const echartsRef_month = useRef<any>(null)
  const echartsRef_year = useRef<any>(null)
  const weekOptionRef = useRef(option_week)
  const monthOptionRef = useRef(option_month)
  const yearOptionRef = useRef(option_year)

  useLoad(() => {
    request({
      method: 'GET',
      url: 'https://api.xmcug.cn/ride/current-week-daily',
    }).then((res) => {
      const todayNum = moment().day() === 0 ? 7 : moment().day()
      const data = new Array(7).fill(0)
      res.data.map((item) => {
        const momentDate = moment(new Date(item.date))
        const dayOfWeekNumber = momentDate.day() === 0 ? 7 : momentDate.day()
        let cal = 0,
          seconds = 0,
          distance = 0,
          times = item.rides.length
        item.rides.forEach((ride: any) => {
          cal += ride.cal
          seconds += ride.seconds
          distance += ride.distance
        })
        data[dayOfWeekNumber - 1] = [cal, seconds, distance, times]
      })
      const hasData = data.slice(0, todayNum).map((item) => {
        return item[2]
      })
      weekOptionRef.current = {
        series: [
          {
            data: hasData.concat(new Array(7 - hasData.length).fill(0)),
            type: 'bar',
          },
        ],
      }
      setTimeout(() => {
        echartsRef_week.current?.setOption(weekOptionRef.current)
      }, 1000)
    })

    request({
      method: 'GET',
      url: 'https://api.xmcug.cn/ride/current-month-daily',
    }).then((res) => {
      const data = new Array(moment().daysInMonth()).fill(0)
      res.data.map((item) => {
        const momentDate = moment(new Date(item.date))
        let cal = 0,
          seconds = 0,
          distance = 0,
          times = item.rides.length
        item.rides.forEach((ride: any) => {
          cal += ride.cal
          seconds += ride.seconds
          distance += ride.distance
        })
        data[momentDate.date() - 1] = [cal, seconds, distance, times]
      })
      monthOptionRef.current = {
        series: [
          {
            data: data.map((item) => {
              if (item === 0) return 0
              else return item[2]
            }),
            type: 'bar',
          },
        ],
        xAxis: {
          type: 'category',
          data: Array.from({ length: data.length }, (_, index) => index + 1),
        },
      }
      echartsRef_month.current?.setOption(monthOptionRef.current)
    })

    request({
      method: 'GET',
      url: 'https://api.xmcug.cn/ride/current-year-monthly',
    }).then((res) => {
      const data = new Array(12).fill(0)
      res.data.map((item) => {
        const momentDate = moment(new Date(item.month))
        let cal = 0,
          seconds = 0,
          distance = 0,
          times = item.rides.length
        item.rides.forEach((ride: any) => {
          cal += ride.cal
          seconds += ride.seconds
          distance += ride.distance
        })
        data[momentDate.month()] = [cal, seconds, distance, times]
      })
      yearOptionRef.current = {
        series: [
          {
            data: data.map((item) => {
              if (item === 0) return 0
              else return item[2]
            }),
            type: 'bar',
          },
        ],
      }

      echartsRef_year.current?.setOption(yearOptionRef.current)
    })
  })

  return (
    <View className="data-page" style={{ width: '100%', height: '100vh' }}>
      <Tabs
        value={tab1value}
        onChange={(value) => {
          if (value === 0) {
            echartsRef_week.current.setOption(weekOptionRef.current)
          } else if (value === 1) {
            console.log('month', echartsRef_month.current)
            console.log('week', echartsRef_week.current)

            echartsRef_month.current.setOption(monthOptionRef.current)
          } else if (value === 2) {
            echartsRef_year.current.setOption(yearOptionRef.current)
          }
          setTab1value(value)
        }}
        activeType="button"
      >
        <Tabs.TabPane title="周">
          <Echarts
            lazyUpdate
            echarts={echarts}
            option={option_week}
            onChartReady={(echartsInstance) => (echartsRef_week.current = echartsInstance)}
            // isPage={false}
            // style自定义设置echarts宽高
          />
        </Tabs.TabPane>
        <Tabs.TabPane title="月">
          <Echarts
            lazyUpdate
            echarts={echarts}
            option={option_month}
            onChartReady={(echartsInstance) => (echartsRef_month.current = echartsInstance)}
            // isPage={false}
            // style自定义设置echarts宽高
          />
        </Tabs.TabPane>
        <Tabs.TabPane title="年">
          <Echarts
            lazyUpdate
            echarts={echarts}
            option={option_year}
            onChartReady={(echartsInstance) => (echartsRef_year.current = echartsInstance)}
            // isPage={false}
            // style自定义设置echarts宽高
          />
        </Tabs.TabPane>
      </Tabs>
    </View>
  )
}
