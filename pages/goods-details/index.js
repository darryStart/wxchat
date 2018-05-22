//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
    data: {
        autoplay: true,
        interval: 3000,
        duration: 1000,
        goodsDetail: {},
        swiperCurrent: 0,
        hasMoreSelect: false,
        selectSizePrice: 0,
        totalScoreToPay: 0,
        shopNum: 0,
        hideShopPopup: true,
        buyNumber: 0,
        buyNumMin: 1,
        buyNumMax: 0,

        propertyChildIds: "",
        propertyChildNames: "",
        canSubmit: false,
        shopCarInfo: {},
        shopType: "addShopCar",
    },

    //事件处理函数
    swiperchange: function(e) {
        this.setData({
            swiperCurrent: e.detail.current
        })
    },

    onLoad: function(e) {
        var that = this;
        if (e.inviter_id) {
            wx.setStorage({
                key: 'inviter_id_' + e.id,
                data: e.inviter_id
            })
        }

        // 获取购物车数据
        wx.getStorage({
            key: 'shopCarInfo',
            success: function(res) {
                that.setData({
                    shopCarInfo: res.data,
                    shopNum: res.data.shopNum
                });
            }
        }) 

        wx.request({
            url: app.globalData.domain,
            data: {
                mod: 'product',
                act: 'get_detail',
                product_id: e.id
            },
            success: function(res) {
                if(res.data.code == 200){
                    var info = res.data.data;
                    that.setData({
                        goodsDetail: info,
                        buyNumMax: info.product_num,
                        buyNumber: (info.product_sellnum > 0) ? 1 : 0,
                        host:app.globalData.host
                    });
                    WxParse.wxParse('article', 'html', info.product_text, that, 5);
                } else {
                    console.log('error goods');
                }
            }
        }) 
    },
    goShopCar: function() {
        wx.reLaunch({
            url: "/pages/shop-cart/index"
        });
    },
    toAddShopCar: function() {
        this.setData({
            shopType: "addShopCar"
        }) 
        this.bindGuiGeTap();
    },

    bindGuiGeTap: function() {
        this.setData({  
            hideShopPopup: false 
        })  
    },

    closePopupTap: function() {
        this.setData({  
            hideShopPopup: true 
        })  
    },

    tobuy: function() {
        this.setData({
            shopType: "tobuy"
        });
        this.bindGuiGeTap();
    },

    numJianTap: function() {
        if (this.data.buyNumber > this.data.buyNumMin) {
            var currentNum = this.data.buyNumber;
            currentNum--;
            this.setData({
                buyNumber: currentNum
            })
        }
    },
    numJiaTap: function() {
        if (this.data.buyNumber < this.data.buyNumMax) {
            var currentNum = this.data.buyNumber;
            currentNum++;
            this.setData({
                buyNumber: currentNum
            })
        }
    },


    /**
    * 加入购物车
    */
    addShopCar: function() {
        if (this.data.buyNumber < 1) {
            wx.showModal({
                title: '提示',
                content: '购买数量不能为0！',
                showCancel: false
            }) 
            return;
        }
        //组建购物车
        var shopCarInfo = this.bulidShopCarInfo();

        this.setData({
            shopCarInfo: shopCarInfo,
            shopNum: shopCarInfo.shopNum
        });

        // 写入本地存储
        wx.setStorage({
            key: 'shopCarInfo',
            data: shopCarInfo
        }) 

        this.closePopupTap();

        wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
        })
    },
    /**
      * 立即购买
      */
    buyNow: function() {
        if (this.data.buyNumber < 1) {
            wx.showModal({
                title: '提示',
                content: '购买数量不能为0！',
                showCancel: false
            }) 
            return;
        }
        //组建立即购买信息
        var buyNowInfo = this.buliduBuyNowInfo();
        // 写入本地存储
        wx.setStorage({
            key: "buyNowInfo",
            data: buyNowInfo
        }) 
        this.closePopupTap();

        wx.navigateTo({
            url: "/pages/to-pay-order/index?orderType=buyNow"
        })
    },
    /**
   * 组建购物车信息
   */
    bulidShopCarInfo: function() {
        // 加入购物车
        var shopCarMap = {};
        shopCarMap.goodsId = this.data.goodsDetail.product_id;
        shopCarMap.pic =  app.globalData.host + this.data.goodsDetail.product_logo;
        shopCarMap.name = this.data.goodsDetail.product_name;
        shopCarMap.price = this.data.goodsDetail.product_smoney;
        shopCarMap.active = true;
        shopCarMap.number = this.data.buyNumber;

        var shopCarInfo = this.data.shopCarInfo;
        if (!shopCarInfo.shopNum) {
            shopCarInfo.shopNum = 0;
        }
        if (!shopCarInfo.shopList) {
            shopCarInfo.shopList = [];
        }

        var hasSameGoodsIndex = -1;
        for (var i = 0; i < shopCarInfo.shopList.length; i++) {
            var tmpShopCarMap = shopCarInfo.shopList[i];
            if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
                hasSameGoodsIndex = i;
                shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
                break;
            }
        }
        shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
        if (hasSameGoodsIndex > -1) {
            shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
        } else {
            shopCarInfo.shopList.push(shopCarMap);
        }
        shopCarInfo.kjId = this.data.kjId;
        return shopCarInfo;
    },

    /**
     * 组建立即购买信息
     */
    buliduBuyNowInfo: function() {
        var shopCarMap = {};
        shopCarMap.goodsId = this.data.goodsDetail.product_id;
        shopCarMap.pic = app.globalData.host + this.data.goodsDetail.product_logo;
        shopCarMap.name = this.data.goodsDetail.product_name;

        shopCarMap.price = this.data.goodsDetail.product_smoney;

        shopCarMap.active = true;
        shopCarMap.number = this.data.buyNumber;

        var buyNowInfo = {};
        if (!buyNowInfo.shopNum) {
            buyNowInfo.shopNum = 0;
        }
        if (!buyNowInfo.shopList) {
            buyNowInfo.shopList = [];
        }

        buyNowInfo.shopList.push(shopCarMap);
        // buyNowInfo.kjId = this.data.kjId;
        return buyNowInfo;
    },

    reputation: function(goodsId) {
        var that = this;
        wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/reputation',
            data: {
                goodsId: goodsId
            },
            success: function(res) {
                if (res.data.code == 0) {
                    that.setData({
                        reputation: res.data.data
                    });
                }
            }
        })
    },

})