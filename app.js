//app.js
App({
    globalData:{
        // domain:'http://192.168.8.233/wx_shop/api.php',
        // host:'http://192.168.8.233/wx_shop/',

        domain:'https://mall.yizhibo.tv/api.php',
        host:'https://mall.yizhibo.tv/',

        videoHost:'https://api.yizhibo.tv',
        recommend_key:'',
        userInfo:null,
        shopName:'红哥精品',
        aboutUs:'红哥精品店，只为您提供网红精品商品，给您最好的购物体验。'
    },

    onLaunch: function (e) {
        if(e.query.key){
            this.globalData.recommend_key = e.query.key;
        }
    },

    wxLogin:function(){
        var that = this;
        wx.getSetting({
            success: function(res){
                if (res.authSetting['scope.userInfo']) {
                    wx.login({
                        success:function(res){
                            if(res.errMsg == 'login:ok' && res.code) {
                                wx.getUserInfo({
                                    success: function(msg) {
                                        wx.request({
                                            url: that.globalData.domain,
                                            data: {
                                                mod: 'user',
                                                act: 'login',
                                                code: res.code,
                                                iv:msg.iv,
                                                encrypted_data:msg.encryptedData,
                                                recommend_key:that.globalData.recommend_key
                                            },
                                            success: function(res) {
                                                console.log(that.globalData.recommend_key);
                                                if(res.data.code == 200){
                                                    that.globalData.userInfo = res.data.data;
                                                } else {
                                                    console.log('登录失败！');
                                                }
                                            },
                                            fail:function(msg) {
                                                console.log(msg);
                                            }
                                        })
                                    }
                                })

                            } else {
                                console.log('login err');
                            }
                        }
                    })
                    
                } else {
                    console.log('没有授权');
                }
            },
            fail:function(res){
                console.log(res);
                wx.openSetting({
                    success:function(){
                        that.wxLogin();
                    }
                })
            },
            ccomplete:function(res){
                console.log(res);
            }
        })
    }
})
