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

    getMobileSystem:function(){
        var that = this;
        wx.getSystemInfo({
            success:function(res){
                that.setData({
                    systemInfo:res,
                })
                console.log(res);
                if(res.system.indexOf("iOS") > 0){
                    that.data.mobile_type = 'ios';
                }else if(res.system.indexOf("Android") > 0){
                    that.data.mobile_type = 'android';
                } else {
                    that.data.mobile_type = 'unknown';
                }
            }
        })
    },

    toPayTap: function(e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        var money = e.currentTarget.dataset.money;
        that.getMobileSystem();
        wx.request({
            url: app.globalData.domain,
            data: {
                mod:'wxpay',
                act:'callpay',
                id:orderId,
                uid:app.globalData.userInfo.token,
                openid:app.globalData.userInfo.openid,
                mobile_type:that.data.mobile_type,
                amount:money
            },
            success: function(res) {
                if (res.data.code == 200) {
                    var config = res.data.data;

                    wx.requestPayment({
                        'timeStamp': config.timeStamp,
                        'nonceStr': config.nonceStr,
                        'package': config.package,
                        'signType': config.signType,
                        'paySign': config.paySign,
                        success:function(res){
                            that.onShow();
                        },
                        fail:function(res){
                            wx.showModal({
                                title: '错误',
                                content: '支付失败,请稍后重试！',
                                showCancel: false
                            }) 
                        }
                    })
                } else {
                    wx.showModal({
                        title: '错误',
                        content: '支付失败,请稍后重试！',
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