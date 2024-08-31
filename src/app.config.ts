export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/my/index',
    'pages/my/subpages/data/index',
    'pages/index/subpages/searchPost/index',
    'pages/my/subpages/setting/index',
    'pages/my/subpages/login/index',
    'pages/index/subpages/addPost/index',
    'pages/index/subpages/readPost/index',
    'pages/bicycle/subpages/record/index',
    'pages/bicycle/subpages/detail/index',
    'pages/bicycle/index',
    'pages/bicycle/subpages/bicycling/index',
    'pages/my/subpages/about/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    position: 'bottom',
    color: '#70737a',
    selectedColor: '#2c2c2c',
    list: [
      {
        pagePath: 'pages/index/index',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-copy.png',
        text: '首页',
      },
      {
        pagePath: 'pages/bicycle/index',
        iconPath: 'assets/tabbar/bicycle.png',
        selectedIconPath: 'assets/tabbar/bicycle-copy.png',
        text: '骑行',
      },
      {
        pagePath: 'pages/my/index',
        iconPath: 'assets/tabbar/wode.png',
        selectedIconPath: 'assets/tabbar/wode-copy.png',
        text: '我的',
      },
    ],
  },
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于小程序位置展示效果',
    },
  },
  requiredBackgroundModes: ['location'],
  requiredPrivateInfos: ['getLocation', 'startLocationUpdateBackground', 'onLocationChange'],
})
