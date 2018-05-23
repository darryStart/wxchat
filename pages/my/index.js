const app = getApp()

Page({
    data: {
    },

    onShow() {
        let that = this;

        var userInfo = app.globalData.userInfo;
        that.setData({
            userInfo:app.globalData.userInfo
        })
    },
    aboutUs: function() {
        wx.showModal({
            title: '关于我们',
            content: app.globalData.aboutUs,
            showCancel: false
        })
    },

    relogin: function() {
        wx.navigateTo({
            url: "/pages/start/start"
        })
    }
})