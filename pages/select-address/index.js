var app = getApp() 
Page({
    data: {
        addressList: []
    },

    onShow: function() {
        this.initShippingAddress();
    },   

    selectTap: function(e) {
        var id = e.currentTarget.dataset.id;
        wx.request({
            url: app.globalData.domain,
            data: {
                mod:'address',
                act:'set_default',
                token: app.globalData.userInfo.token,
                id: id
            },
            success: (res) => {
                wx.navigateBack({})
            }
        })
    },

    addAddess: function() {
        wx.navigateTo({
            url: "/pages/address-add/index"
        })
    },

    editAddess: function(e) {
        wx.navigateTo({
            url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
        })
    },

    initShippingAddress: function() {
        var that = this;
        wx.request({
            url: app.globalData.domain,
            data: {
                mod:'address',
                act:'list',
                token: app.globalData.userInfo.token
            },
            success:function(res){
                console.log(res);
                if (res.data.code == 200) {
                    that.setData({
                        addressList: res.data.data
                    });
                } else {
                    that.setData({
                        addressList: null
                    });
                }
            }
        })
    }

})