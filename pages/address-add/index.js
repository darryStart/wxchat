var commonCityData = require('../../utils/city.js')
//获取应用实例
var app = getApp() 
Page({
    data: {
        provinces: [],
        citys: [],
        districts: [],
        selProvince: '请选择',
        selCity: '请选择',
        selDistrict: '请选择',
        selProvinceIndex: 0,
        selCityIndex: 0,
        selDistrictIndex: 0,
        id:0,
        is_default:1
    },


    onLoad: function(e) {
        var that = this;
        this.initCityData(1);
        var id = e.id;
        if (id) {
            that.data.id = id;

            // 初始化原数据
            wx.showLoading();
            wx.request({
                url: app.globalData.domain,
                data: {
                    mod:'address',
                    act:'edit',
                    token: app.globalData.userInfo.token,
                    aid: id
                },
                success: function(res) {
                    console.log(res);
                    wx.hideLoading();
                    if (res.data.code == 200) {
                        that.setData({
                            addressData: res.data.data,
                            selProvince: res.data.data.address_province,
                            selCity: res.data.data.address_city,
                            selDistrict: res.data.data.address_area,
                            is_default:res.data.data.address_default
                        });
                        that.setDBSaveAddressId(res.data.data);
                        return;
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '无法获取快递地址数据',
                            showCancel: false
                        })
                    }
                },
                fail:function(){
                    wx.hideLoading();
                }
            })
        }
    },

    bindCancel: function() {
        wx.navigateBack({})
    },


    bindSave: function(e) {
        var that = this;
        var linkMan = e.detail.value.linkMan;
        var address = e.detail.value.address;
        var mobile = e.detail.value.mobile;
        var code = e.detail.value.code;

        if (linkMan == "") {
            wx.showModal({
                title: '提示',
                content: '请填写联系人姓名',
                showCancel: false
            }) 
            return;
        }
        if (mobile.length != 11) {
            wx.showModal({
                title: '提示',
                content: '请正确填写手机号码',
                showCancel: false
            }) 
            return;
        }
        if (this.data.selProvince == "请选择") {
            wx.showModal({
                title: '提示',
                content: '请选择地区',
                showCancel: false
            }) 
            return;
        }
        if (this.data.selCity == "请选择") {
            wx.showModal({
                title: '提示',
                content: '请选择地区',
                showCancel: false
            }) 
            return;
        }


   
        var districtId;
        var districtName = '';
        if (this.data.selDistrict == "请选择" || !this.data.selDistrict) {
            districtId = '';
        } else {
            if(this.data.selDistrictIndex){
                districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
                districtName = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].name;
            }
            districtName = this.data.selDistrict;
        }

        var cityName = this.data.selCity;
        if(this.data.selCityIndex){
            var cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
            cityName = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].name;
        }
   
        var provinceId = commonCityData.cityData[this.data.selProvinceIndex].id;
        var provinceName = commonCityData.cityData[this.data.selProvinceIndex].name;
        if(this.data.selProvinceIndex == 0 && this.data.selCityIndex == 0 && this.data.selDistrictIndex == 0){
            provinceName = this.data.selProvince;
        }

        if (address == "") {
            wx.showModal({
                title: '提示',
                content: '请填写详细地址',
                showCancel: false
            }) 
            return;
        }

        wx.request({
            url: app.globalData.domain,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                mod:'address',
                act: 'add',
                aid:that.data.id,
                token: app.globalData.userInfo.token,
                province: provinceName,
                city: cityName,
                area: districtName,
                link_man: linkMan,
                address: address,
                mobile: mobile,
                is_default: that.data.is_default
            },
            success: function(res) {
                if (res.data.code != 200) {
                    // 登录错误 
                    wx.hideLoading();
                    wx.showModal({
                        title: '失败',
                        content: '添加失败!',
                        showCancel: false
                    }) 
                    return;
                }
                // 跳转到结算页面
                wx.navigateBack({
                    success:function(){
                        onShow();
                    }
                })
            }
        })
    },


    initCityData: function(level, obj) {
        if (level == 1) {
            var pinkArray = [];
            for (var i = 0; i < commonCityData.cityData.length; i++) {
                pinkArray.push(commonCityData.cityData[i].name);
            }
            this.setData({
                provinces: pinkArray
            });
        } else if (level == 2) {
            var pinkArray = [];
            var dataArray = obj.cityList
            for (var i = 0; i < dataArray.length; i++) {
                pinkArray.push(dataArray[i].name);
            }
            this.setData({
                citys: pinkArray
            });
        } else if (level == 3) {
            var pinkArray = [];
            var dataArray = obj.districtList
            for (var i = 0; i < dataArray.length; i++) {
                pinkArray.push(dataArray[i].name);
            }
            this.setData({
                districts: pinkArray
            });
        }

    },


    bindPickerProvinceChange: function(event) {
        var selIterm = commonCityData.cityData[event.detail.value];
        this.setData({
            selProvince: selIterm.name,
            selProvinceIndex: event.detail.value,
            selCity: '请选择',
            selCityIndex: 0,
            selDistrict: '请选择',
            selDistrictIndex: 0
        }) 
        this.initCityData(2, selIterm)
    },


    bindPickerCityChange: function(event) {
        var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
        this.setData({
            selCity: selIterm.name,
            selCityIndex: event.detail.value,
            selDistrict: '请选择',
            selDistrictIndex: 0
        }) 
        this.initCityData(3, selIterm)
    },

    bindPickerChange: function(event) {
        var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
        if (selIterm && selIterm.name && event.detail.value) {
            this.setData({
                selDistrict: selIterm.name,
                selDistrictIndex: event.detail.value
            })
        }
    },

    setDBSaveAddressId: function(data) {
        var retSelIdx = 0;
        for (var i = 0; i < commonCityData.cityData.length; i++) {
            if (data.provinceId == commonCityData.cityData[i].id) {
                this.data.selProvinceIndex = i;
                for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
                    if (data.cityId == commonCityData.cityData[i].cityList[j].id) {
                        this.data.selCityIndex = j;
                        for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                            if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id) {
                                this.data.selDistrictIndex = k;
                            }
                        }
                    }
                }
            }
        }
    },
    selectCity: function() {},
    deleteAddress: function(e) {
        var that = this;
        var id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '提示',
            content: '确定要删除该收货地址吗？',
            success: function(res) {
                if (res.confirm) {
                    wx.request({
                        url: app.globalData.domain,
                        data: {
                            mod:'address',
                            act:'del',
                            token: app.globalData.userInfo.token,
                            aid: id
                        },
                        success: (res) => {
                            wx.navigateBack({})
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    readFromWx: function() {
        let that = this;
        wx.chooseAddress({
            success: function(res) {
                let provinceName = res.provinceName;
                let cityName = res.cityName;
                let diatrictName = res.countyName;
                let retSelIdx = 0;

                for (var i = 0; i < commonCityData.cityData.length; i++) {
                    if (provinceName == commonCityData.cityData[i].name) {
                        let eventJ = {
                            detail: {
                                value: i
                            }
                        };
                        that.bindPickerProvinceChange(eventJ);
                        that.data.selProvinceIndex = i;
                        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
                            if (cityName == commonCityData.cityData[i].cityList[j].name) {
                                //that.data.selCityIndex = j;
                                eventJ = {
                                    detail: {
                                        value: j
                                    }
                                };
                                that.bindPickerCityChange(eventJ);
                                for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                                    if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                                        //that.data.selDistrictIndex = k;
                                        eventJ = {
                                            detail: {
                                                value: k
                                            }
                                        };
                                        that.bindPickerChange(eventJ);
                                    }
                                }
                            }
                        }

                    }
                }

                that.setData({
                    wxaddress: res,
                });
            }
        })
    }
})