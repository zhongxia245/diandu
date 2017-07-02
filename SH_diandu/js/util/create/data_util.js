/***************************************
 * window.DD.items 数据对象方法
 ***************************************/
window.data_util = (function () {
  /**
   * 根据id，设置数据仓库点读位置数据
   * @param  id 点读的id ,类似  1_1
   */
	function setDDItems(id, config) {
		// 点读背景默认从1开始，所以，这里减1
		var index = parseInt(id.split('_')[0])
		var arr = window.DD.items[index - 1]['data']
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].id == id) {
				arr[i] = $.extend({}, arr[i], config)
				break
			}
		}
	}

  /**
   * 根据id 获取 点读位置的数据
   * @param id  点读位置标识  类似 1_1
   */
	function getDDItems(id) {
		var index = parseInt(id.split('_')[0])
		var arr = window.DD.items[index - 1]['data']
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].id == id) {
				return arr[i]
			}
		}
	}

	/**
	 * 获取指定点读页的数据
	 * @param {any} pageIndex 
	 * @returns 
	 */
	function getPageData(pageIndex) {
		return window.DD.items[pageIndex - 1]
	}

  /**
   * 获取有效的点读位
   * @return {[type]} [description]
   */
	function getValidItems() {
		var destArr = []
		var delPageIds = ''
		var isDelGlobalAudio = false; // 是否删掉了全程音频的点读点
		var srcArr = window.DD.items
		ArrayUtil.sortByKey(srcArr, 'sort')

		// 点读页
		for (var i = 0; i < srcArr.length; i++) {
			if (!srcArr[i].isRemove) { // 去掉已经删除的点读页
				var destPage = {
					name: srcArr[i].name,
					pic: srcArr[i].pic,
					h: srcArr[i].h,
					w: srcArr[i].w,
					id: srcArr[i]['oldId'],
					seq: srcArr[i]['sort']
				}

				// 点读点
				var destItems = []
				var items = srcArr[i]['data']

				destPage['delPointIds'] = destPage['delPointIds'] || ''

				for (var j = 0; j < items.length; j++) {
					if (!items[j].isRemove && !_isEmpty(items[j])) { // 去掉删除的点读位

						var _tempData = $.extend({}, items[j])
						delete _tempData.data
						_tempData = JSON.stringify(_tempData)

						var obj = {
							x: items[j].x,
							y: items[j].y,
							point_size: items[j]['point_size'],
							filename: items[j].filename,
							url: items[j].url,
							title: items[j].title,

							area: items[j].area && JSON.stringify(items[j].area) || '',
							custom: items[j].custom && JSON.stringify(items[j].custom) || '',
							audio_panel: items[j].audio_panel && JSON.stringify(items[j].audio_panel) || '',
							pic: items[j].pic && JSON.stringify(items[j].pic) || '',

							content: items[j].content,
							hide: items[j].hide ? 1 : 0,
							questions: JSON.stringify(items[j].questions),
							type: _getTypeByName(items[j].type),

							remarks: JSON.stringify(items[j].remarks),

							onoff: JSON.stringify(items[j].onoff),
							linkurl: JSON.stringify(items[j].linkurl),

							data: _tempData,  //保存点读点的所有数据
						}

						if (items[j]['oldId']) obj['id'] = items[j]['oldId']

						destItems.push(obj)
					} else {
						// 记录下删除的点读位ID
						var _oldid = items[j]['oldId'] ? items[j]['oldId'] : ''

						if (_oldid) {
							destPage['delPointIds'] += _oldid + ','
						}

						// 有则删除全程音频
						window.global_audio_util.remove(items[j].id)
					}
				}

				destPage['delPointIds'] = destPage['delPointIds'].length > 0 ? destPage['delPointIds'].substr(0, destPage['delPointIds'].length - 1) : ''
				destPage['points'] = destItems
				destArr.push(destPage)
			} else {
				if (srcArr[i]['oldId']) {
					delPageIds += srcArr[i]['oldId'] + ','
				}
			}
		}

		delPageIds = delPageIds.length > 0 ? delPageIds.substr(0, delPageIds.length - 1) : ''
		return {
			data: destArr,
			delPageIds: delPageIds,
			isDelGlobalAudio: isDelGlobalAudio
		}
	}

  /**
   * 根据类型名字，获取类型的ID
   * @return {[type]} [description]
   */
	function _getTypeByName(typeName) {
		switch (typeName) {
			case 'video':
				return 1
			case 'audio':
				return 2
			case 'imgtext':
				return 3
			case 'exam':
				return 4
			case 'on-off':
				return 5
			case 'set-url':
				return 6
			case 'sway':
				return 7
			case 'viewer3d':
				return 8
			default:
				return 1
		}
	}

  /**
   * 判断创建的点读是否为空[没有上传数据]
	 * 空点读点不添加到数据库
   * @param item 点读位数据
   */
	function _isEmpty(item) {
		// 如果这些每一项都为空,则表示为空的点读位
		if (item.content ||
			item.filename ||
			item.questions ||
			item.title ||
			item.linkurl ||
			item.url ||
			item.remarks ||
			item.onoff ||
			item.pic) {
			return false
		}
		return true
	}

	return {
		getDDItems: getDDItems,
		setDDItems: setDDItems,
		getPageData: getPageData,
		getValidItems: getValidItems
	}
})()
