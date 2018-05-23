//index.js
//获取应用实例
var app = getApp();
Page({
    data: {
        loadingHidden: false,
        swiperCurrent: 0,
        goods: [],
        scrollTop: "0",
        loadingMoreHidden: true,
    },

    onLoad: function() {
        var that = this;

        wx.setNavigationBarTitle({  
            title: app.globalData.shopName  
        }) 

        if(app.globalData.userInfo == null){
            app.wxLogin();
        }

        that.getGoodsList(0);
    },


    onPullDownRefresh(){
        this.getGoodsList(0);
        wx.stopPullDownRefresh();
    },

    toDetailsTap: function(e) {
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },

    getGoodsList: function(categoryId) {
        if (categoryId == 0) {
            categoryId = "";
        }
        var that = this;
        wx.request({
            url: app.globalData.domain,
            data: {
                mod:'product',
                act:'cate_page',
                cate_id: categoryId,
            },
            success: function(res) {
                that.setData({
                    goods: [],
                    loadingMoreHidden: true
                });
                var goods = [];
                if (res.data.code != 200 || res.data.data.length == 0) {
                    that.setData({
                        loadingMoreHidden: false,
                    });
                    return;
                }
                for (var i = 0; i < res.data.data.length; i++) {
                    goods.push(res.data.data[i]);
                }
                that.setData({
                    goods: goods,
                    host:app.globalData.host
                });
            }
        })
    }
})