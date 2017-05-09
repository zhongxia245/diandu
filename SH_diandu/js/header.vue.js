/**
 * @time 2017-05-08 22:58:44
 * @author zhongxia
 * VUE组件,每一个vue不要有太多功能，最好是单独功能抽离出来
 * 目前包含：
 * 1. 全程音频播放
 * 2. 点读列表
 * 3. 评论弹窗
 * 4. 左侧目录列表 [TODO]
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
			// 评论弹窗是否展示
			show_page_comment: false,
			page_comment_count: 0,
			// 点读页列表
			pagelist: {
				intro: data.saytext,
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
			// 是否有全程音频
			hasGlobalAudio: function () {
				var pageTimes = JSON.parse(DATA.content).pageConfig
				return !!globalAudioConfig.id && !!pageTimes[this.pageActiveIndex]
			},
			globalAudioIconPath: function () {
				if (this.audioplayer.play) {
					return './imgs/mods/header/global_audio_play.gif'
				} else {
					return './imgs/mods/header/global_audio.png'
				}
			},
			page_comment_count_str: function () {
				return this.page_comment_count === 0 ? '' : this.page_comment_count
			},
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
			// 打开评论
			handleOpenComment: function () {
				var that = this
				var pageid = that.pagelist.data[that.pageActiveIndex].id

				if (!that.show_page_comment) {
					Model.getComment(pageid, function (result) {
						that.show_page_comment = true
						that.page_comment_count = result.length
						new PageComment('.m-bg[data-id="' + pageid + '"] .m-dd-start-comment-div', {
							data: result,
							pageid: pageid,
							videoid: GLOBAL.videoid,
							userid: window.__userid,
							startRecordCallback: function () {
								//开始录音结束背景音乐
								GLOBAL.BGAUDIO.pause();
							},
							stopRecordCallback: function () {
								GLOBAL.BGAUDIO.setTimePlay();
							}
						})
					})
				} else {
					that.show_page_comment = false
					that.page_comment_count = 0
					$('.m-bg[data-id="' + pageid + '"] .m-dd-start-comment-div').html('')
				}
			},
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
			},
			// 选择点读页
			handleSelectedPage: function (e) {
				this.pageActiveIndex = parseInt($(e.target).data('index'))
				this.popup_pagelist = false
			},
			handleAudioPlayerSetting: function () {
				alert('正在建设中...')
			},
			// ====================== 全程音频 =======================
			handleAudioPlayerPlay: function () {
				var that = this;
				if (!that.audioplayer.play) {
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
					that.pauseAudio()
					that.audioplayer.currentTime = 0
					clearInterval(this.globalAudioTimer)
				})
			},
			playAudio: function () {
				if (this.globalAudio.paused) {
					this.globalAudio.play()
				}
				this.audioplayer.play = true
			},
			pauseAudio: function () {
				if (!this.globalAudio.paused) {
					this.globalAudio.pause()
				}
				this.audioplayer.play = false
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
				var endIndex = index + 1

				if (this.pageTimes[index] === null) {
					this.pauseAudio()
				}

				startTime = this.pageTimes[index]

				if (endIndex < this.pageTimes.length) {
					endTime = this.pageTimes[endIndex]

					// 没有下一页的话，播放结束就不跳转到下一页
					if (!endTime) {
						endTime = parseInt(this.globalAudio.duration)
						endIndex = index
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