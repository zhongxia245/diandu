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
		el: '#header_vue',
		data: {
			id: data.id,
			bg_audio_src: data.background,
			show_fullscreen: true,
			is_fullscreen: false,
			popup_sidebar: false,
			popup_setting: false,
			popup_pagelist: false,
			popup_audioplayer: false,
			pageActiveIndex: 0,
			// 评论弹窗是否展示
			show_page_comment_btn: true,
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
				play: false,
				isPlayGoToNext: false  		// 是否因为播放自动跳转到下一页
			},
			// 设置页面
			setting_opacity: 100,
			setting_gap: 5,
			setting_bgaudio_enable: !!data.background,
			setting_bgaudio_play: false,

			// 背景图放大
			hasScale: false,
			//侧边栏 by brian 20170511 START
			teamid: 0,
			logoid: 0,
			logoname: '',
			team_video_id: window.team_video_id,
			show_unit: 0,//正在展示的unit
			first_show: 0,
			unit_list: [],
			group_name: '',
			search: "",
			userid: window.__userid
			//侧边栏 by brian 20170511 END
		},
		created: function () {
			var version = Util.getBrowserInfo()
			if (version.iPhone && version.weixin) {
				MINT.Toast('请用safari浏览器打开，享受更好体验哦', 3000)
			}
			if (!this.globalAudio && !!this.audioplayer.src) {
				this.initGlobalAudio()
			}
			if (!this.bgAudio && !!this.bg_audio_src) {
				this.initBgAudio()
			}
			// 判断iframe是否被嵌套，如果不是则不显示全屏按钮功能
			if (self === top) {
				this.show_fullscreen = false
			}
			// PC端评论使用嵌套点读页面的评论
			if (Util.IsPC()) {
				this.show_page_comment_btn = false
			}
		},
		computed: {
			// 是否有背景音乐
			hasBgAudio: function () {
				return !!this.bg_audio_src
			},
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
				// 翻页后，重置当前点读页设置全程音频的时间
				this.audioplayer.currentTime = 0
				this.setAudioPlayerTotalTime()

				if (this.globalAudio) {
					if (this.pageTimes[this.pageActiveIndex] === null) {
						this.pauseAudio()
					}
					if (!this.isPlayGoToNext) {
						var currentPageTime = this.getPageTime(this.pageActiveIndex)
						this.globalAudio.currentTime = currentPageTime.startTime
						this.isPlayGoToNext = false
					}
				}

				if (window.galleryTop && !window.galleryTop.autoplaying) {
					window.galleryTop.slideTo(this.pageActiveIndex);
				}
			},
			//by brian 20170511 START
			first_show: function (v, v1) {
				var h = $("#weight_h").height();
				var full_w = $(window).height();
				var left_h = full_w - h - 35 - $(".team_name").height();
				$(".unit_list").height(left_h);
			},
			//by brian 20170511 END
			// 设置相关
			setting_opacity: function () {
				$('.wrap div[data-id]').css({
					opacity: this.setting_opacity / 100
				})
			},
			setting_gap: function () {
				this.swiperAutoPlay(true)
			},
			setting_bgaudio_enable: function () {
				if (this.setting_bgaudio_enable) {
					this.setting_bgaudio_play = true
				} else {
					this.setting_bgaudio_play = false
				}
			},
			setting_bgaudio_play: function () {
				if (this.setting_bgaudio_enable && this.setting_bgaudio_play) {
					this.bgAudio.play()
				} else {
					this.bgAudio.pause()
				}
			},
			hasScale: function () {
				Vue.nextTick(function () {
					if (VueApp.$data.hasScale) {
						var $btnScaleBtn = $('.diandu-header__scale')
						if ($btnScaleBtn.length) {
							$btnScaleBtn.addClass('custom-point-blink')
							setTimeout(function () {
								$btnScaleBtn.removeClass('custom-point-blink')
							}, window.BLINK_DURATION)
						}
					}
				})
			}
		},
		methods: {
			handleScaleNormal: function () {
				this.hasScale = false
				if (GLOBAL.picScale) {
					GLOBAL.picScale.goToNormal()
				}
			},
			// 全屏
			handleFullPanel: function () {
				if (!this.is_fullscreen) {
					this.is_fullscreen = true
					// 如果这边补全
					Util.requestFullScreen($('body')[0])
				} else {
					this.is_fullscreen = false
					Util.exitFullScreen()
				}
			},
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
								that.pauseBgAudio()
							},
							stopRecordCallback: function () {
								that.restartPlayBgAudio()
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
				this.popup_setting = false
			},
			handleOpenSetting: function () {
				this.popup_pagelist = false
				this.popup_sidebar = false
				this.popup_audioplayer = false
				this.popup_setting = !this.popup_setting
			},
			// 展示点读页列表
			handleOpenPageList: function () {
				this.popup_sidebar = false
				this.popup_audioplayer = false
				this.popup_setting = false
				this.popup_pagelist = !this.popup_pagelist
			},
			handleClosePageList: function () {
				this.popup_pagelist = false
			},
			// 显示音频播放列表
			handleOpenAudio: function () {
				this.popup_sidebar = false
				this.popup_pagelist = false
				this.popup_setting = false
				this.popup_audioplayer = !this.popup_audioplayer
			},
			// 选择点读页
			handleSelectedPage: function (e) {
				this.pageActiveIndex = parseInt($(e.target).data('index'))
				this.isPlayGoToNext = false
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
			/*============= 全程音频相关 START==================*/
			initGlobalAudio: function () {
				var that = this

				// 加载m3u8的音频文件，解决iphone加载音频特慢问题
				// that.globalAudio = new Audio(that.audioplayer.src)
				that.globalAudio = new Audio()
				that.globalAudio.load()
				Util.setAudioSource(that.globalAudio, that.audioplayer.src)


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
								that.isPlayGoToNext = true
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
				if (this.globalAudio && this.globalAudio.paused) {
					this.globalAudio.play()
				}
				this.audioplayer.play = true
				this.setting_bgaudio_play = false
				clearTimeout(this.bgAudioTimer)
			},
			pauseAudio: function () {
				if (this.globalAudio && !this.globalAudio.paused) {
					this.globalAudio.pause()
				}
				this.audioplayer.play = false
				this.restartPlayBgAudio()
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

				startTime = this.pageTimes[index]

				if (endIndex < this.pageTimes.length) {
					endTime = this.pageTimes[endIndex]
				}
				
				// 没有下一页的话，播放结束就不跳转到下一页
				if (!endTime && this.globalAudio) {
					endTime = parseInt(this.globalAudio.duration)
					endIndex = index
				}
				return {
					startTime: startTime,
					endTime: endTime,
					nextPageIndex: endIndex,
					duration: endTime - startTime
				}
			},
			/*============= 全程音频相关 END==================*/

			/*============= 背景音乐 START==================*/
			initBgAudio: function () {
				var that = this

				// that.bgAudio = new Audio(that.bg_audio_src)
				that.bgAudio = new Audio()
				Util.setAudioSource(that.bgAudio, that.bg_audio_src)
				that.bgAudio.load()
				if (Util.IsPC()) {
					that.playBgAudio()
				} else {
					// 移动端不能自动播放，只能点击屏幕开始播放
					$(document).one("touchstart", that.playBgAudio, false)
				}
			},
			playBgAudio: function () {
				this.setting_bgaudio_play = true
				this.swiperAutoPlay()
			},
			pauseBgAudio: function () {
				this.setting_bgaudio_play = false
				this.swiperStopAutoPlay()
			},
			swiperAutoPlay: function (flag) {
				flag = flag || this.setting_bgaudio_enable
				if (window.galleryTop) {
					if (this.setting_gap > 0 && flag) {
						window.galleryTop.params.autoplay = this.setting_gap * 1000
						window.galleryTop.startAutoplay()
					}
				}
			},
			swiperStopAutoPlay: function () {
				if (window.galleryTop) {
					window.galleryTop.stopAutoplay()
				}
			},
			restartPlayBgAudio: function () {
				var that = this
				/**
				 * 如果在其他音频或者视频播放之前，背景音乐就是关闭的，
				 * 那么其他音频或者视频播放结束，背景音频不继续播放，
				 * 需要手动打开
				 * */
				clearTimeout(that.bgAudioTimer)
				if (that.setting_bgaudio_enable) {
					that.bgAudioTimer = setTimeout(function () {
						that.bgAudio.play()
						that.setting_bgaudio_play = true
					}, 5000)
				}
			}
			/*============= 背景音乐 END==================*/
		}
	})
}
