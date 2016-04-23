/*****************************************************
 * 时间:2016-04-23 22:07:36
 * 作者:zhongxia
 *
 * 操作数据的一些相关方法
 * 提供的方法:
 * 1. getItemByKeyAndValue      根据key 和 value 或者 对象数组的中某个对象
 * 2. setItemByKeyAndValue      根据key 和 value 设置 对象数组中的某个对象
 * 3. prevOrNextItem            根据 排序的字段key 和当前的下标,指定向前或者先后移动几位
 * 4. clone                     深克隆一个数据对象
 *****************************************************/
window.ArrayUtil = (function () {
    /**
     * 根据key 和值获取数组中的 匹配的第一项数据
     * @param  {[type]} arr   [description]
     * @param  {[type]} key   [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    function getItemByKeyAndValue(arr, key, value) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] === value) {
                return arr[i];
            }
        }
    }

    /**
     * 根据 key　和 旧的value ，给数组中的某一个对象设置新值，整个替换
     * @param {[type]} arr      [description]
     * @param {[type]} key      [description]
     * @param {[type]} oldValue [description]
     * @param {[type]} newValue [description]
     */
    function setItemByKeyAndValue(arr, key, oldValue, newObj) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] === oldValue) {
                return arr[i] = newObj;
            }
        }
        ;
    }

    /**
     * 向前移动，或者向后移动一位
     * @param  {[type]} arr       [description]
     * @param  {[type]} key       [description]
     * @param  {[type]} index     [description]
     * @param  {[type]} nextCount [description]
     * @return {[type]}           [description]
     */
    function prevOrNextItem(arr, key, index, nextCount) {
        var currentItem = getItemByKeyAndValue(arr, key, index);
        var item = getItemByKeyAndValue(arr, key, index + nextCount);
        if (item) {
            var temp = currentItem[key];
            currentItem[key] = index + nextCount;
            item[key] = temp;
        }
    }

    /**
     * 深复制
     * @param  {[type]} arr [description]
     * @return {[type]}     [description]
     */
    function clone(arr) {
        var arr_bak = [];
        for (var i = 0; i < arr.length; i++) {
            arr_bak.push(arr[i]);
        }
        return arr_bak;
    }

    /**
     * 数组中的某一项，向前移动一位
     * @param  {[type]} arr   [description]
     * @param  {[type]} index [description]
     * @param  {[type]} key   [description]
     * @return {[type]}       [description]
     */
    function prevItem(arr, key, index) {
        prevOrNextItem(arr, key, index, -1)
    }

    /**
     * 数组中的某一项，向前移动一位
     * @param  {[type]} arr   [description]
     * @param  {[type]} index [description]
     * @param  {[type]} key   [description]
     * @return {[type]}       [description]
     */
    function nextItem(arr, key, index) {
        prevOrNextItem(arr, key, index, 1)
    }

    /**
     * 数组对象 根据指定字段排序
     * @param  {[type]} arr [description]
     * @param  {[type]} key [description]
     * @return {[type]}     [description]
     */
    function sortByKey(arr, key) {
        arr.sort(function (x, y) {
            return x[key] > y[key] ? 1 : -1;
        });
    }


    return {
        getItemByKeyAndValue: getItemByKeyAndValue,
        setItemByKeyAndValue: setItemByKeyAndValue,
        prevItem: prevItem,
        nextItem: nextItem,
        sortByKey: sortByKey,
        clone: clone
    }
})();
