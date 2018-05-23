//index.js
//获取应用实例
var app = getApp();
var helper = require('../../utils/helper.js');
Page({
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 3000,
        duration: 1000,
        loadingHidden: false,
        userInfo: {},
        swiperCurrent: 0,
        selectCurrent: 0,
        categories: [],
        activeCategoryId: 0,
        goods: [],
        scrollTop: "0",
        loadingMoreHidden: true,
        searchInput: '',
    },

    onLoad: function() {
        var that = this;

        wx.setNavigationBarTitle({  
            title: app.globalData.shopName  
        }) 

        if(app.globalData.userInfo == null){
            app.wxLogin();
        }

        that.getAd();
        that.getCate();
    },

    getAd(){
        var that = this;
        wx.request({
            url: app.globalData.domain,
            data: {
                mod: 'ad',
                act: 'list'
            },
            success: function(res) {
                if(res.data.code == 200){
                    that.setData({
                        host:app.globalData.host,
                        banners: res.data.data
                    });
                } else {
                    console.log('');
                }
            }
        }) 
    },

    getCate(){
        var that = this;
        wx.request({
            url: app.globalData.domain,
            data:{
                mod:'category',
                act:'top'
            },
            success: function(res) {
                var categories = [{
                    category_id: 0,
                    category_name: "全部"
                }];

                if (res.data.code == 200) {
                    for (var i = 0; i < res.data.data.length; i++) {
                        categories.push(res.data.data[i]);
                    }
                }

                that.setData({
                    categories: categories,
                    activeCategoryId: 0
                });
                that.getGoodsList(0);
            }
        }) 
    },


    onPullDownRefresh(){
        this.getAd();
        this.getCate();
         wx.stopPullDownRefresh();
    },

    tabClick: function(e) {
        this.setData({
            activeCategoryId: e.currentTarget.id
        });
        this.getGoodsList(this.data.activeCategoryId);
    },
    //事件处理函数
    swiperchange: function(e) {
        this.setData({
            swiperCurrent: e.detail.current
        })
    },
    toDetailsTap: function(e) {
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },

    bindTypeTap: function(e) {
        this.setData({
            selectCurrent: e.index
        })
    },
    scroll: function(e) {
        var that = this,
        scrollTop = that.data.scrollTop;
        that.setData({
            scrollTop: e.detail.scrollTop
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
                name_like: that.data.searchInput,
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
    },

    onShareAppMessage:function () {

        var share_url = helper.getCurrentPageUrlWithArgs() + '?key=' + app.globalData.userInfo.rname;
        return helper.shareAppMessage('', share_url);
    },

    listenerSearchInput: function(e) {
        this.setData({
            searchInput: e.detail.value
        })

    },
    toSearch: function() {
        this.getGoodsList(this.data.activeCategoryId);
    }
})