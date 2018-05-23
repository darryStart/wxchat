//index.js
//获取应用实例
var app = getApp()

Page({
    data: {
        goodsList: [],
        isNeedLogistics: 0,
        allGoodsPrice: 0,
        goodsJsonStr: "",
        goodsData:[],
        orderType: "",
        goodsAllName:''
    },

    onLoad: function(e) {
        var that = this;
        //显示收货地址标识
        that.setData({
            isNeedLogistics: 1,
            orderType: e.orderType
        });

    },

    onShow: function() {
        var that = this;
        var shopList = [];
        //立即购买下单
        if ("buyNow" == that.data.orderType) {
            var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
            if (buyNowInfoMem && buyNowInfoMem.shopList) {
                shopList = buyNowInfoMem.shopList
            }
        } else {
            //购物车下单
            var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
            if (shopCarInfoMem && shopCarInfoMem.shopList) {
                shopList = shopCarInfoMem.shopList.filter(entity => {
                    return entity.active;
                });
            }
        }
        that.setData({
            goodsList: shopList,
        });
        that.initShippingAddress();
    },

    goodsInfo: function () {
        var that = this;
        var goodsList = this.data.goodsList;
        var goodsJsonStr = "[";
        var isNeedLogistics = 0;
        var allGoodsPrice = 0;
        var goodsAllName = '';


        for (let i = 0; i < goodsList.length; i++) {
            let carShopBean = goodsList[i];
        
            allGoodsPrice += carShopBean.price * carShopBean.number;

            goodsAllName += carShopBean.name + ','; 

            var goodsJsonStrTmp = '';
            if (i > 0) {
                goodsJsonStrTmp = ",";
            }
            goodsJsonStrTmp += '{"goodsId":"'+carShopBean.goodsId+'","name":"'+carShopBean.name+'","pic":"'+carShopBean.pic+'","price":"'+carShopBean.price+'","number":'+carShopBean.number+'}';
            goodsJsonStr += goodsJsonStrTmp;

        }
        goodsJsonStr += "]";

        that.setData({
            goodsAllName:goodsAllName,
            goodsJsonStr:goodsJsonStr,
            allGoodsPrice:allGoodsPrice
        });
    },

    createOrder: function(e) {
        wx.showLoading();
        var that = this;
        var remark = ""; // 备注信息
        if (e) {
            remark = e.detail.value.remark;
        }


        var postData = {
            id: app.globalData.userInfo.token,
            goods_data: that.data.goodsJsonStr,
            goods_all_money:that.data.allGoodsPrice,
            goods_all_name:that.data.goodsAllName,
            remark: remark
        };
   
        if (that.data.isNeedLogistics > 0) {
            if (!that.data.curAddressData) {
                wx.hideLoading();
                wx.showModal({
                    title: '错误',
                    content: '请先设置您的收货地址！',
                    showCancel: false
                }) 
                return;
            }
            postData.user_tname = that.data.curAddressData.user_tname;
            postData.user_phone = that.data.curAddressData.user_phone;
            postData.area_content = that.data.curAddressData.address_province + that.data.curAddressData.address_city + that.data.curAddressData.address_area + that.data.curAddressData.address_text;
        }

        wx.request({
            url: app.globalData.domain + '?mod=order&act=add_order',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: postData,
            // 设置请求的 参数
            success: (res) => {
                wx.hideLoading();
                if (res.data.code != 200) {
                    wx.showModal({
                        title: '错误',
                        content: res.data.msg,
                        showCancel: false
                    }) 
                    return;
                }

                if (e && "buyNow" != that.data.orderType) {
                    // 清空购物车数据
                    wx.removeStorageSync('shopCarInfo');
                }
           
                // 下单成功，跳转到订单管理界面
                wx.redirectTo({
                    url: "/pages/order-list/index"
                });
            }
        })
    },

    initShippingAddress: function() {
        var that = this;
        wx.request({
            url: app.globalData.domain,
            data: {
                mod:'address',
                act:'get_default',
                token: app.globalData.userInfo.token
            },
            success: (res) => {
                if (res.data.code == 200) {
                    that.setData({
                        curAddressData: res.data.data
                    });
                } else {
                    that.setData({
                        curAddressData: null
                    });
                }
                that.goodsInfo(); 
            }
        })
    },

    addAddress: function() {
        wx.navigateTo({
            url: "/pages/address-add/index"
        })
    },
    selectAddress: function() {
        wx.navigateTo({
            url: "/pages/select-address/index"
        })
    }
})