// pages/authorize/index.js
var app = getApp();
Page({
    data: {},
    bindGetUserInfo: function (e) {
        if (!e.detail.userInfo){
            return;
        } else {
            app.globalData.userInfo = e.detail.userInfo;
            wx.navigateTo({
                url: "/pages/start/start"
            })
        }
    }
})