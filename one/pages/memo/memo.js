//index.js
var util = require("../../utils/util.js");
//更改数组 第三个参数是对象
function editArr(arr, i, editCnt) {
  let newArr = arr, editingObj = newArr[i];
  newArr.map(function (a) {
    if (a.id == i) {
      for (var x in editCnt) {
        a[x] = editCnt[x];
      }
    }
  })

  // for (var x in editCnt){
  //   editingObj[x]= editCnt[x];
  // }
  return newArr;
}
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    showAll: true,
    lists: [],
    newLi: { id: '', content: '', begin: util.formatDate2(), needRemind: true, editing: false, done: false },
  },
  bindDateChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      'newLi.begin': e.detail.value
    })
  },
  onReady: function (e) {
    this.remind();
  },
  toUrl(e) {
    let url = e.target.dataset.url;
    wx.navigateTo({
      url: '../' + url + '/' + url
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function () {
    var that = this;
    //获取之前保留在缓存里的数据
    wx.getStorage({
      key: 'todolist',
      success: function (res) {
        if (res.data) {
          that.setData({
            lists: res.data
          })
        }
      }
    })
    //获取用户信息
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    })
  },
  iptChange(e) {
    this.setData({
      'newLi.content': e.detail.value,
      'newLi.begin': util.formatDate2()
    })
  },

  formReset() {
    this.setData({
      'newLi.content': ''
    })
  },
  //判断输入是否为空，如果不是数据提交
  formSubmit() {
    let newLists = this.data.lists, i = 0, newTodo = this.data.newLi;

    if (newLists.length > 0) {
      i = Number(util.sortBy(newLists, 'id', true)[0].id) + 1;
    }
    newTodo.id = i;
    if (newTodo.content != '') {
      newLists.push(newTodo);
      this.setData({
        lists: newLists,
        newLi: { id: '', content: '', begin: util.formatDate2(), needRemind: true, editing: false, done: false }
      })
    }
    this.remind();
  },
  //修改备忘录
  toChange(e) {
    let i = e.target.dataset.id;

    this.setData({
      lists: editArr(this.data.lists, i, { editing: true })
    })
  },

  //该备忘事项已完成
  setDone(e) {
    let i = e.target.dataset.id, newLists = this.data.lists;
    newLists.map(function (l, index) {
      if (l.id == i) {
        newLists[index].done = !l.done;
        newLists[index].needRemind = false;
      }
    })
    this.setData({
      lists: newLists
    })
  },
  //删除该备忘事项
  toDelete(e) {
    let i = e.target.dataset.id, newLists = this.data.lists;
    newLists.map(function (l, index) {
      if (l.id == i) {
        newLists.splice(index, 1);
      }
    })
    this.setData({
      lists: newLists
    })
  },
  //全部备忘事项已完成
  doneAll() {
    let newLists = this.data.lists;
    newLists.map(function (l) {
      l.done = true;
    })
    this.setData({
      lists: newLists
    })
  },
  //删除全部备忘事项
  deleteAll() {
    this.setData({
      lists: []
    })
  },
  //显示全部未完成事项
  showUnfinished() {
    this.setData({
      showAll: false
    })
  },
  //显示全部事项
  showAll() {
    this.setData({
      showAll: true
    })
  },
  //保存数据
  saveData() {
    let listsArr = this.data.lists;
    wx.setStorage({
      key: 'todolist',
      data: listsArr
    })
  },
  //提醒功能
  getRemindArr() {
    let thisLists = this.data.lists, closeT = 0, notDoneLists = [];
    let date = new Date(), now = [date.getFullYear(),date.getMonth() + 1,date.getDate()]
    thisLists.map(function (l) {
      if (l.needRemind) {
        notDoneLists.push(l)
      }
    })
    if (notDoneLists.length > 0) {
      let newLists = util.sortBy(notDoneLists, 'begin'), firstT = (newLists[0].begin).split(':'), id = newLists[0].id, cnt = newLists[0].content;
      closeT = ((firstT[0] - now[0]) * 60 + (firstT[1] - now[1]) - 1) * 60;
      closeT = closeT >= 0 ? closeT : 0;
      return { closeT, id, cnt };
    } else {
      return false;
    }
  },
  //提醒功能提示框，判断是否已完成
  remind() {
    let result = this.getRemindArr(), t = result.closeT, id = result.id, that = this, cnt = result.cnt;
    function alarm() {
      let newLists = that.data.lists;
      wx.showModal({
        title: '已经完成了吗？',
        content: cnt,
        cancelText:'否',
        confirmText:'是',
        success: function (res) {
          if (res.confirm) {
            newLists.map(function (l, index) {
              if (l.id == id) {
                newLists[index].done = true;
                newLists[index].needRemind = false;
              }
            })
            that.setData({
              lists: newLists
            })
          } else {
            newLists.map(function (l, index) {
              if (l.id == id) {
                newLists[index].needRemind = false;
              }
            })
            that.setData({
              lists: newLists
            })
          }
        }
      })

    }
    if (result) {
      setTimeout(alarm, Math.floor(t * 1000), function () {
        that.remind();
      })
    }

  }


})