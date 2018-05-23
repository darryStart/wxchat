
const app = getApp();
var helper = require('../../utils/helper.js');
Page({
    data: {
        play_url:'/',
        share_url:'/pages/index/index',
        share_title:'易直播',
        sid:0,
        vid:0,
        thumb: '/imgs/default.jpg',
        name:0,
        nickname:0,
        watching_num:0,
        watching_users:[],
        lt:0,
        aid:0,
        cid:0,
        gid:-1,
        hid:-1,
        cnt:0,
        live_status:1
    },

    onLoad(e) {
        
        this.setData({startPlay: 'none'});
        wx.showLoading({
            title:'加载中...',
            mask:true
        });

        this.ctx = wx.createLivePlayerContext('player');
        this.data.vid = e.vid;
        this.data.play_url = e.url;
        this.data.sid = wx.getStorageSync('gust_session_id');

        if(this.data.sid == 0 || this.data.sid == ''){
            app.createGust();
            this.data.sid = wx.getStorageSync('gust_session_id');
        }
        this.data.share_url = helper.getCurrentPageUrlWithArgs();
        this.getWatchStart();        
    },

    onUnload(e){
        clearInterval(this.activeTimeout);
    },

    getWatchStart:function(){
        var that = this;
        wx.request({
            url: app.globalData.host +'/watchstart',
            data: {'sessionid':this.data.sid,'vid':this.data.vid},
            success: function(res) {
                if (res.data.retval == 'ok') {
                    if(that.data.lt == 0){
                        //保留变量
                        that.data.thumb = res.data.retinfo.thumb;
                        that.data.nickname = res.data.retinfo.nickname;
                        that.data.name = res.data.retinfo.name;
                        that.data.share_title = res.data.retinfo.title;

                        //设置标题
                        wx.setNavigationBarTitle({
                            title: that.data.nickname
                        });

                        //加载视频
                        that.setVideo();
                    }
                    that.getVideoStatus(res.data.retinfo);
                }else{
                    console.log(res);
                    //视频其他状态
                    that.toVideoList();
                    
                }
            }
        })
    },

    getVideoStatus:function(info){
        var that = this;
        wx.request({
            url: app.globalData.host +'/chat',
            data: {
                'vid':that.data.vid,
                'sid':that.data.sid,
                'lt':that.data.lt,
                'aid':that.data.aid,
                'hcs_ip':info.hcs_inner,
                'hcs_port':info.hcs_port,
                'cid':that.data.cid,
                'gid':that.data.gid,
                'hid':that.data.hid,
                'cnt':that.data.cnt
            },

            success: function(res) {
                if (res.data.rv == 'ok') {
                    var res_info = res.data.ri; 

                    //设置心跳参数
                    that.data.aid = res_info.aid;
                    that.data.cid = res_info.cid;
                    that.data.gid = res_info.gid;
                    that.data.hid = res_info.hid;
                    that.data.lt = res_info.ut;

                    if(res_info.wl.length > 0)
                        wx.setStorageSync(that.data.vid,res_info.wl);

                    that.data.watching_users = wx.getStorageSync(that.data.vid).reverse();

                    if(res_info.jl)
                        that.data.watching_users = res_info.jl.concat(that.data.watching_users);

                    //离开
                    if(res_info.ll){
                        res_info.ll.map((v, idx, arr) => {
                            that.data.watching_users.map((val, index, arr) => {
                                if(v.nm == val.nm){
                                    that.data.watching_users.splice(index,1);
                                }
                            });
                        });
                    }

                    that.setData({
                        'watch_num' : res_info.vi.wic,
                        'rice_num':res_info.vi.rr,
                        'watchings':that.data.watching_users,
                        'live_status':that.data.live_status
                    });
                }
            }
        })
    },


    onShareAppMessage:function () {
        return helper.shareAppMessage(this.data.share_title,this.data.share_url,this.data.thumb);
    },

    setVideo:function(){
        var that = this;
        that.setData({
            'url' : that.data.play_url,
            'thumb':that.data.thumb,
            'name':that.data.name,
        }, () => {
            that.ctx.play({
                success: function() {
                    that.activeTimeout = setInterval(() => {
                        that.getWatchStart();
                    }, 2000);
                    console.log('play success');
               },
                fail: function() {
                  console.log('play fail');
                },
                complete: function() {
                    console.log('complete');
                }
            });
        });
    },


    toVideoList:function() {
        wx.redirectTo({
            url:"/pages/index/index"
        })
    },

    statechange(e) {
        console.log(e.detail.code);
        switch (e.detail.code) {
            case 2004:
                wx.hideLoading();
                this.setData({ startPlay: '' });
                break;
            case 2103:
                wx.showToast({ title: '断开连接，正在重连', icon: 'none' });
                break;
            case -2301:
                wx.showToast({ title: '和远程服务断开连接', icon: 'none' });
            break;
        }
    }
});
