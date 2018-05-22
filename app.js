//app.js
App({
    globalData:{
        domain:'http://localhost/wx_shop/api.php',
        host:'http://localhost/wx_shop/',
        recommend_key:'',
        userInfo:null,
        subDomain: "tz",
        version: "2.0",
    },

    onLaunch: function (e) {
        var that = this;
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
                                                if(res.data.code == 200){
                                                    that.globalData.userInfo = res.data.data;
                                                } else {
                                                    console.log('登录失败！');
                                                }
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
                    console.log('213');
                }
            },
            fail:function(res){
                console.log(res);
            }
            ,
            ccomplete:function(res){
                console.log(res);
            }
        })
    }
})
