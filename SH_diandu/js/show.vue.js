/**
 * 初始化Vue组件
 * @param {any} data 
 */
function initVue(data) {
	data = data || {}
	var globalAudioConfig = JSON.parse(data.content || '{}')
	window.VueApp = new Vue({
		el: '#container',
		data: {
			id: data.id,
			popup_sidebar: false,
			popup_pagelist: false,
			popup_audioplayer: false,
			pageActiveIndex: 0,
			hasGlobalAudio: !!globalAudioConfig.id,
			popup_audioplayer_flag: false, //音频播放器如果默认没有点击过，没有点击过，3s后自动关闭
			// 点读页列表
			pagelist: {
				rate: 3,
				pic: data.pic || '',
				title: data.title || '',
				data: data.pages || []
			},
			// 音频播放器
			audioplayer: {
				data: globalAudioConfig,
				src: globalAudioConfig.src,
				currentTime: 0,
				totalTime: 0,
				play: false
			}
		},
		created: function () {
			if (!this.globalAudio) {
				this.initGlobalAudio()
			}
		},
		computed: {
			pageCount: function () {
				return this.pagelist.data.length
			},
			currentTimeStr: function () {
				return Util.num2time(this.audioplayer.currentTime)
			},
			totalTimeStr: function () {
				return Util.num2time(this.audioplayer.totalTime)
			},
			//全程音频每个点读页对应的时间
			pageTimes: function () {
				var _pageTimes = this.audioplayer.data.pageConfig || []
				var _pageTimesNum = []
				for (var i = 0; i < _pageTimes.length; i++) {
					_pageTimesNum.push(Util.time2num(_pageTimes[i]))
				}
				return _pageTimesNum
			}
		},
		watch: {
			currentTimeStr: function () {
				var currentPageTime = this.getPageTime(this.pageActiveIndex)
				var currentTime = this.audioplayer.currentTime + currentPageTime.startTime
				// 从音频上获取的时间，是浮点型，因此需要转成整数在比较
				if (parseInt(this.globalAudio.currentTime) !== currentTime) {
					this.globalAudio.currentTime = currentTime
				}
			},
			pageActiveIndex: function () {
				this.audioplayer.currentTime = 0
				this.setAudioPlayerTotalTime()

				if (this.globalAudio) {
					var currentPageTime = this.getPageTime(this.pageActiveIndex)
					this.globalAudio.currentTime = currentPageTime.startTime
				}

				if (window.galleryTop) {
					window.galleryTop.slideTo(this.pageActiveIndex);
				}
			}

		},
		methods: {
			// 展开目录列表
			handleOpenSideBar: function () {
				this.popup_sidebar = !this.popup_sidebar
				this.popup_pagelist = false
				this.popup_audioplayer = false
			},
			// 展示点读页列表
			handleOpenPageList: function () {
				this.popup_sidebar = false
				this.popup_audioplayer = false
				this.popup_pagelist = !this.popup_pagelist
			},
			// 显示音频播放列表
			handleOpenAudio: function () {
				var that = this
				this.popup_sidebar = false
				this.popup_pagelist = false
				this.popup_audioplayer = !this.popup_audioplayer
				setTimeout(function () {
					if (!that.popup_audioplayer_flag) {
						that.popup_audioplayer = false
					}
				}, 3000)
			},
			// 选择点读页
			handleSelectedPage: function (e) {
				this.pageActiveIndex = parseInt($(e.target).data('index'))
				this.popup_pagelist = false
			},
			handleAudioPlayerSetting: function () {
				alert('正在建设中...')
			},
			handleAudioPlayerClick: function () {
				this.popup_audioplayer_flag = true
			},
			// ====================== 全程音频 =======================
			handleAudioPlayerPlay: function () {
				var that = this;
				that.audioplayer.play = !that.audioplayer.play
				if (that.audioplayer.play) {
					that.playAudio()
				} else {
					that.pauseAudio()
				}
			},
			handleAudioPlayerPre: function () {
				this.globalAudio.currentTime -= 15
			},
			handleAudioPlayerNext: function () {
				this.globalAudio.currentTime += 15
			},
			initGlobalAudio: function () {
				var that = this
				that.globalAudio = new Audio(that.audioplayer.src)


				that.globalAudio.addEventListener('canplaythrough', function (e) {
					that.setAudioPlayerTotalTime()
					that.globalAudioTimer = setInterval(function () {
						var currentPageTime = that.getPageTime(that.pageActiveIndex)
						if (that.audioplayer.currentTime < that.audioplayer.totalTime) {
							var currentTime = parseInt(that.globalAudio.currentTime) - currentPageTime.startTime
							currentTime = currentTime < 0 ? 0 : currentTime
							that.audioplayer.currentTime = currentTime
						} else {
							// 处理是否需要点读页跳转的逻辑
							if (that.pageActiveIndex + 1 < that.pageCount) {
								that.pageActiveIndex = currentPageTime.nextPageIndex
							}
						}
					}, 500)
				})


				that.globalAudio.addEventListener('ended', function () {
					that.audioplayer.play = false
					that.globalAudio.pause()
					that.audioplayer.currentTime = 0
					clearInterval(this.globalAudioTimer)
				})
			},
			playAudio: function () {
				if (this.globalAudio.paused) {
					this.globalAudio.play()
				}
			},
			pauseAudio: function () {
				if (!this.globalAudio.paused) {
					this.globalAudio.pause()
				}
			},
			/**
			 * 设置播放器的总时长
			 * eg：第二页的音频播放时间 == 第二页音频时间 - 第一页音频时间
			 */
			setAudioPlayerTotalTime: function () {
				var currentPageTime = this.getPageTime(this.pageActiveIndex)
				this.audioplayer.totalTime = currentPageTime.duration
			},
			/**
			 * 获取指定点读页的上一个时间和下一个时间
			 * @param index 需要获取点读页的下标
			 */
			getPageTime: function (index) {
				index = index || 0
				var startTime = 0
				var endTime = 0
				var startIndex = index
				var endIndex = index + 1

				// 获取开始的时间
				while (true) {
					if (startIndex === 0) {
						startTime = this.pageTimes[0]
						break
					} else {
						var _startTime = this.pageTimes[startIndex]
						if (_startTime) {
							startTime = _startTime
							break
						} else {
							startIndex--
						}
					}
				}

				//获取下一页的时间
				while (true) {
					var _endTime
					if (endIndex < this.pageTimes.length) {
						_endTime = this.pageTimes[endIndex]
						if (_endTime) {
							endTime = _endTime
							break
						} else {
							endIndex++
						}
					} else {
						endTime = parseInt(this.globalAudio.duration)
						break
					}
				}

				return {
					startTime: startTime,
					endTime: endTime,
					nextPageIndex: endIndex,
					duration: endTime - startTime
				}
			}
		}
	})
}
