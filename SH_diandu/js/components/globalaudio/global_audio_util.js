/**
 * 全程音频的数据保存获取相关方法
 * 先把多个音频的完成， 在兼容以前旧的数据
 */
window.global_audio_util = (function () {
	return {
		init: function (data) {
			// 编辑的时候，解析数据到这里来
		},
		set: function (pointId, data) {
			DD.globalAudioData = DD.globalAudioData || {}
			DD.globalAudioData[pointId] = data
		},
		get: function (pointId) {
			DD.globalAudioData = DD.globalAudioData || {}
			if (DD.globalAudioData[pointId]) {
				return DD.globalAudioData[pointId]
			}
			return {}
		},
		getAll: function () {
			return DD.globalAudioData || []
		},
		remove: function (pointId) {
			DD.globalAudioData = DD.globalAudioData || {}
			if (DD.globalAudioData[pointId]) {
				delete DD.globalAudioData[pointId]
			}
		},
	}
})()
