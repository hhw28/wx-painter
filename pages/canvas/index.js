
Page({
  /**
 * 页面的初始数据
 */
  data: {
    color: 'black',
    lastColor: 'black',
    brushSize: 5,
    width: 500,
    height: 300,
    eraserEnable: false,
    isUse: false,
    deleteImg: false,
    downloadImg: false,
    lastPoint: {
      x: undefined,
      y: undefined
    },
    scope: false,
    saving: false,
    canvasImgSrc: '',
    commonColors: [
      {
        value: '#000000',
        checked: false,
      }, {
        value: '#ffffff',
        checked: false,
      }, {
        value: '#fed3c7',
        checked: false,
      }, {
        value: '#ffc4ce',
        checked: false,
      }, {
        value: '#faac8e',
        checked: false,
      }, {
        value: '#ff8b83',
        checked: false,
      }, {
        value: '#f44336',
        checked: false,
      }, {
        value: '#e91e63',
        checked: false,
      }, {
        value: '#e2669e',
        checked: false,
      }, {
        value: '#9c27b0',
        checked: false,
      }, {
        value: '#673ab7',
        checked: false,
      }, {
        value: '#2196f3',
        checked: false,
      }, {
        value: '#00bcd4',
        checked: false,
      }, {
        value: '#3be5db',
        checked: false,
      }, {
        value: '#97fddc',
        checked: false,
      }, {
        value: '#167300',
        checked: false,
      }, {
        value: '#37a93c',
        checked: false,
      }, {
        value: '#89e642',
        checked: false,
      }, {
        value: '#d7ff07',
        checked: false,
      }, {
        value: '#fff6d1',
        checked: false,
      }, {
        value: '#f8cbbc',
        checked: false,
      }, {
        value: '#ffeb3b',
        checked: false,
      }, {
        value: '#ffc107',
        checked: false,
      }, {
        value: '#ff9800',
        checked: false,
      }
    ],
  },

  checkColor: function(e){
    let color = e.currentTarget.dataset.color
    let index = e.currentTarget.dataset.index
    this.setData({
      color: color
    })

    this.data.commonColors.forEach((item, index) => {
      this.setData({
        [`commonColors[${index}].checked`]: false
      })
    })
    this.setData({
      [`commonColors[${index}].checked`]: true
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initCanvas()
  },
  initCanvas:function(){
    let _this = this
    wx.getSystemInfo({
      success: function(res){
        _this.setData({
          width: res.windowWidth,
          height: res.windowHeight
        })
      }
    })
    wx.getStorage({
      key: 'scope',
      success (res) {
        _this.setData({
          scope: res.data
        })
      }
    })
  },
  touchStart(e){
    this.setData({
      isUse: true
    })

    let x = e.touches[0].x
    let y = e.touches[0].y
    let ctx = wx.createCanvasContext('canvas')

    if(this.data.eraserEnable){
      ctx.clearRect(x-5, y-5, 10, 10)
      ctx.draw(true)
    }else{
      this.setData({
        lastPoint: {x:x, y:y}
      })
    }
  },
  touchMove(e){
    let x = e.touches[0].x
    let y = e.touches[0].y
    var newPoint = {x:x, y:y}
    let ctx = wx.createCanvasContext('canvas')

    if(!this.data.isUse){ return }
    // if(this.data.eraserEnable){
    //   this.setData({
    //     color: '#fff',
    //     brushSize: 7
    //   })
    // }
    this.drawLine(this.data.lastPoint.x, this.data.lastPoint.y, newPoint.x, newPoint.y)
    this.setData({
      lastPoint: newPoint
    })
  },
  touchEnd(){
    this.setData({
      isUse: false
    })
  },
  // 画线
  drawLine(x1, y1, x2, y2){
    let ctx = wx.createCanvasContext('canvas')
    ctx.beginPath()
    ctx.setLineWidth(this.data.brushSize)
    ctx.setStrokeStyle(this.data.color)
    ctx.setLineCap('round')
    ctx.setLineJoin('round')
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.draw(true)
  },

  // 橡皮擦与画笔的切换
  clickBrush(){
    this.setData({
      eraserEnable: false,
      color: this.data.lastColor,
      brushSize: 5,
    })
  },
  clickEraser(){
    this.setData({
      eraserEnable: true,
      color: '#fff',
      brushSize: 7,
      lastColor: this.data.lastColor,
    })
  },
  // 删除图像
  delete(){
    let ctx = wx.createCanvasContext('canvas')
    ctx.clearRect(0, 0, this.data.width, this.data.height)
    ctx.draw(true)

    this.setData({
      deleteImg: true
    })
    setTimeout(() => {
      this.setData({
        deleteImg: false
      })
    }, 300)
  },
  // 下载图像
  download(){
    this.setData({
      downloadImg: true
    })
    setTimeout(() => {
      this.setData({
        downloadImg: false
      })
    }, 300)

    // 判断用户是否授权相册功能
    let _this = this
    if (!this.data.scope) {
      wx.showModal({
        title: '需要授权',
        content: '保存图片需要获取您的授权',
        success: (res) => {
          if(res.confirm){
            wx.openSetting({
              success: (res) => {
                if(res.authSetting['scope.writePhotosAlbum']){
                  _this.setData({
                    scope: true
                  })
                }
                wx.setStorage({
                  key:"scope",
                  data:"true"
                })
                console.log('开始缓存')
              }
            })
          }
        }
      })
    }
    // 已经获得授权且不在保存中
    if(this.data.scope && !this.data.saving){
      wx.showLoading({
        title: '保存中',
        mask: true,
      })
      this.setData({
        saving: true
      })
      this.canvasSaveToImg()
    }
  },
  // 把当前画布的内容生成图片
  canvasSaveToImg(){
    console.log('saving')
    let _this = this
    wx.canvasToTempFilePath({
      canvasId: 'canvas',
      fileType: 'jpg',
      quality: 1,
      success: function (res) {
        _this.downloadCanvasImg(res)
      },
      fail: function () {
        // canvas转图片失败
        wx.hideLoading();
        wx.showToast({
          icon: 'loading',
          title: '保存失败',
        })
      }
    })
  },
  // 生成图片成功，继续调用存储相册接口
  downloadCanvasImg(res){
    let _this = this
    wx.saveImageToPhotosAlbum({
      filePath: res.tempFilePath,
      // 存储成功
      success: function () {
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
        })
        _this.setData({
          saving: false,
        })
      },
      // 失败弹窗
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '保存失败',
          icon: 'loading',
        })
        _this.setData({
          saving: false,
        })
      }
    })
  }
})