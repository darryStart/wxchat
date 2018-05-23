//index.js
//获取应用实例
var app = getApp()
Page({

    data:{
        start:0,
        count:10,
        videos:[]
    },
    onLoad: function () {

        this.setData({
            loadingMoreHidden:true,
        });
        this.getVideoList();
    },

    toVideo:function(e){
        if(e.currentTarget.dataset.status == 1){
            wx.navigateTo({
                url:"/pages/live/live?"+
                "vid="+e.currentTarget.dataset.vid+
                "&url="+e.currentTarget.dataset.url
            })
        }else{
            wx.navigateTo({
                url:"/pages/video/video?"+
                "vid="+e.currentTarget.dataset.vid
            })
        }
    },

    onPullDownRefresh(){
        this.getVideoList();
    },

    onReachBottom(){
        this.setData({
            loading:false,
        });
        this.getVideoList();
    },


    
    getVideoList: function () {
        var that = this;
        wx.request({
            url: app.globalData.host +'/v2/miniprog/livehot',
            data: {'start':that.data.start,'count':that.data.count},
            success: function(res) {
                console.log(res);
                // var videos = that.data.videos;
                if (res.data.retval != 'ok') {
                    that.setData({
                        loadingMoreHidden:false,
                    });
                    return;
                }
                var count = res.data.retinfo.count;
                for(var i=0;i<count;i++){
                    that.data.videos.push(res.data.retinfo.videos[i]);
                }
                that.data.start += that.data.count; 

                if(count == 0){
                    that.setData({
                        loading:true,
                        loadingMoreHidden:false,
                    });
                }else{
                    that.setData({
                        videos:that.data.videos,
                        loadingMoreHidden:true,
                    });
                }
            },
            fail:function(){
                that.setData({
                    loading:true,
                });
            },
            complete:function(){
                wx.hideNavigationBarLoading() //完成停止加载
                wx.stopPullDownRefresh() //停止下拉刷新
            }
        })
    }
})
