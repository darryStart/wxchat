// var wxpay = require('../../utils/pay.js') 
var app = getApp();
Page({
    data: {
        statusType: ["待付款", "待发货", "待收货", "已完成"],
        currentType: 0,
        tabClass: ["", "", "", "", ""]
    },

    onShow: function() {
        // 获取订单列表
        wx.showLoading();
        var that = this;
      
        wx.request({
            url: app.globalData.domain,
            data: {
                mod:'order',
                act:'order_list',
                token:app.globalData.userInfo.token,
                status:that.data.currentType
            },
            success: (res) => {
                wx.hideLoading();
                if (res.data.code == 200) {
                    that.setData({
                        orderList: res.data.data,
                        // logisticsMap: res.data.data.logisticsMap,
                        // goodsMap: res.data.data.goodsMap
                    });
                } else {
                    this.setData({
                        orderList: null,
                        logisticsMap: {},
                        goodsMap: {}
                    });
                }
            }
        })

    },


    statusTap: function(e) {
        var curType = e.currentTarget.dataset.index;
        this.data.currentType = curType 
        this.setData({
            currentType: curType
        });
        this.onShow();
    },

    cancelOrderTap: function(e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确定要取消该订单吗？',
            content: '',
            success: function(res) {
                if (res.confirm) {
                    wx.showLoading();
                    wx.request({
                        url: app.globalData.domain,
                        data: {
                            mod:'order',
                            act:'cancel_order',
                            token: app.globalData.userInfo.token,
                            order_id: orderId
                        },
                        success: (res) => {
                            wx.hideLoading();
                            if (res.data.code == 200) {
                                that.onShow();
                            }
                        }
                    })
                }
            }
        })
    },

    toPayTap: function(e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        var money = e.currentTarget.dataset.money;
        var needScore = e.currentTarget.dataset.score;
        wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/amount',
            data: {
                token: wx.getStorageSync('token')
            },
            success: function(res) {
                if (res.data.code == 0) {
                    // res.data.data.balance
                    money = money - res.data.data.balance;
                    if (res.data.data.score < needScore) {
                        wx.showModal({
                            title: '错误',
                            content: '您的积分不足，无法支付',
                            showCancel: false
                        }) 
                        return;
                    }
                    if (money <= 0) {
                        // 直接使用余额支付
                        wx.request({
                            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/pay',
                            method: 'POST',
                            header: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            data: {
                                token: wx.getStorageSync('token'),
                                orderId: orderId
                            },
                            success: function(res2) {
                                that.onShow();
                            }
                        })
                    } else {
                        wxpay.wxpay(app, money, orderId, "/pages/order-list/index");
                    }
                } else {
                    wx.showModal({
                        title: '错误',
                        content: '无法获取用户资金信息',
                        showCancel: false
                    })
                }
            }
        })
    },


    onPullDownRefresh: function() {
        // 页面相关事件处理函数--监听用户下拉动作
    }
})