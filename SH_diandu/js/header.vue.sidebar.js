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
			bg_audio_src: data.background,
			popup_sidebar: false,
			popup_setting: false,
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
			},
			// 设置页面
			setting_opacity: 100,
			setting_gap: 5,
			setting_bgaudio_enable: !!globalAudioConfig.src,
			setting_bgaudio_play: false,
			//侧边栏 by brian 20170511
			teamid: 0,
			logoid: 0,
			logoname: '',
			team_video_id: team_video_id,
			show_unit: 0,//正在展示的unit
			first_show: 0,
			unit_list: [],
			group_name: '',
			search: "",
			userid: window.__userid
		},
		created: function () {
			if (!this.globalAudio) {
				this.initGlobalAudio()
			}
			if (!this.bgAudio && !!this.bg_audio_src) {
				this.initBgAudio()
			}

			$.post("/edu/course/json_result/form_submit.php", { action: "get_teaminfo_by_teamvideoid", id: team_video_id }, function (ret) {
				if ('success' == ret.flag) {
					window.VueApp.group_name = ret.group_name;
					window.VueApp.unit_list = ret.unit_list;
					window.VueApp.teamid = ret.group_id;
					window.VueApp.logoid = ret.logoid;
					window.VueApp.logoname = ret.logoname;
				}
			}, 'json');
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
				this.audioplayer.currentTime = 0
				this.setAudioPlayerTotalTime()

				if (this.globalAudio) {
					if (this.pageTimes[this.pageActiveIndex] === null) {
						this.pauseAudio()
					}
					var currentPageTime = this.getPageTime(this.pageActiveIndex)
					this.globalAudio.currentTime = currentPageTime.startTime
				}

				if (window.galleryTop && !window.galleryTop.autoplaying) {
					window.galleryTop.slideTo(this.pageActiveIndex);
				}
			},
			//by brian 20170511
			first_show: function (v, v1) {
				var h = $("#weight_h").height();
				var full_w = $(window).height();
				var left_h = full_w - h - 35 - $(".team_name").height();
				$(".unit_list").height(left_h);
			},
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
				this.setting_bgaudio_play = false
			},
			pauseAudio: function () {
				if (!this.globalAudio.paused) {
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
			},
			/*============= 全程音频相关 END==================*/

			/*============= 背景音乐 START==================*/
			initBgAudio: function () {
				var that = this
				that.bgAudio = new Audio(that.bg_audio_src)

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
						console.log(window.galleryTop.autoplaying)
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
			},
			/*============= 背景音乐 END==================*/
			//by bran 20170511
			showUnitVideo: function (unitid, index) {
				if (this.show_unit == unitid) {
					this.show_unit = 0;
					return;
				}
				if (this.unit_list[index]['videolist'].length == 0) {
					var that = this;
					$.post("/edu/course/json_result/form_submit.php", { action: "get_unit_teamvideo", unitid: unitid }, function (ret) {
						if ("success" == ret['flag']) {
							that.unit_list[index]['videolist'] = ret['data'];
							that.show_unit = unitid;
						}
						else {
							alert(ret['reason']);
						}
					}, 'json');
				}
				else {
					this.show_unit = unitid;
				}
			},
			jumpTeamPage: function () {
				window.location.href = "/m/team/" + this.teamid + ".html";
			},
			jumpUnitPage: function (unitid) {
				window.location.href = "/m/unit/" + unitid + ".html";
			},
			jumpVideoPage: function (id, istext) {
				var url = "";
				if (0 == istext) {
					url = "/m/video/" + id + ".html"
				}
				else if (1 == istext) {
					url = "/m/graphic-article/" + id + ".html"
				}
				else if (2 == istext) {
					url = "/m/audio/" + id + ".html"
				}
				else if (3 == istext) {
					url = "/m/audio-passage/" + id + ".html"
				}
				else if (4 == istext) {
					url = "/m/exam/" + id + ".html"
				}
				else if (5 == istext) {
					url = "/m/point-read/" + id + ".html"
				}
				if ("" != url) {
					window.location.href = url;
				}
			},
			jumpPersonalPage: function () {
				window.location.href = "/edu/course/mobile/personal.php";
			},
			jumpTeamIconPage: function () {
				window.location.href = "/edu/course/mobile/group_icon_content.php?iconid=" + this.logoid;
			},
			goSearch: function () {
				window.location.href = "edu/course/mobile/search/search_new.php?keyword=" + this.search;
			}
		}
	})
}
function initSideBar() {
	window.side_bar = new Vue({
		el: "#side_bar",
		data: {
			teamid: 0,
			logoid: 0,
			logoname: '',
			team_video_id: team_video_id,
			show_unit: 0,//正在展示的unit
			first_show: 0,
			unit_list: [],
			group_name: '',
			search: "",
			userid: window.__userid
		},
		mounted: function () {
			$.post("/edu/course/json_result/form_submit.php", { action: "get_teaminfo_by_teamvideoid", id: team_video_id }, function (ret) {
				if ('success' == ret.flag) {
					side_bar.group_name = ret.group_name;
					side_bar.unit_list = ret.unit_list;
					side_bar.teamid = ret.group_id;
					side_bar.logoid = ret.logoid;
					side_bar.logoname = ret.logoname;
				}
			}, 'json');
		},
		watch: {
			first_show: function (v, v1) {
				var h = $("#weight_h").height();
				var full_w = $(window).height();
				var left_h = full_w - h - 35 - $(".team_name").height();
				$(".unit_list").height(left_h);
			}
		},
		methods: {
			showUnitVideo: function (unitid, index) {
				if (this.show_unit == unitid) {
					this.show_unit = 0;
					return;
				}
				if (this.unit_list[index]['videolist'].length == 0) {
					var that = this;
					$.post("/edu/course/json_result/form_submit.php", { action: "get_unit_teamvideo", unitid: unitid }, function (ret) {
						if ("success" == ret['flag']) {
							that.unit_list[index]['videolist'] = ret['data'];
							that.show_unit = unitid;
						}
						else {
							alert(ret['reason']);
						}
					}, 'json');
				}
				else {
					this.show_unit = unitid;
				}
			},
			jumpTeamPage: function () {
				window.location.href = "/m/team/" + this.teamid + ".html";
			},
			jumpUnitPage: function (unitid) {
				window.location.href = "/m/unit/" + unitid + ".html";
			},
			jumpVideoPage: function (id, istext) {
				var url = "";
				if (0 == istext) {
					url = "/m/video/" + id + ".html"
				}
				else if (1 == istext) {
					url = "/m/graphic-article/" + id + ".html"
				}
				else if (2 == istext) {
					url = "/m/audio/" + id + ".html"
				}
				else if (3 == istext) {
					url = "/m/audio-passage/" + id + ".html"
				}
				else if (4 == istext) {
					url = "/m/exam/" + id + ".html"
				}
				else if (5 == istext) {
					url = "/m/point-read/" + id + ".html"
				}
				if ("" != url) {
					window.location.href = url;
				}
			},
			jumpPersonalPage: function () {
				window.location.href = "/edu/course/mobile/personal.php";
			},
			jumpTeamIconPage: function () {
				window.location.href = "/edu/course/mobile/group_icon_content.php?iconid=" + this.logoid;
			},
			goSearch: function () {
				window.location.href = "edu/course/mobile/search/search_new.php?keyword=" + this.search;
			}
		}
	});

	side_bar.first_show = 1;
}
