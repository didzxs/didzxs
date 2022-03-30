import React, { Component } from 'react';
import styles from './ImageMagnifier.less';

class ImageMagnifier extends Component {
  static defaultProps = {
    width: 400,
    height: 400,
    scale: 3, // 放大倍数
  };

  state = {
    // 略缩图
    minImg: "",
    // 大图
    maxImg: "",
    //开关
    magnifierOff: false,
    // 图片加载情况
    imgLoad: false,
    cssStyle: {
      // 鼠标悬停小方块样式
      mouseBlock: {
        top: 0,
        left: 0,
      },
      // 图片放大样式
      // 此处图片宽高不能设置为百分比，在scale作用下，放大的只是图片初始的宽高
      imgStyle: {
        top: 0,
        left: 0,
      }
    }
  };
  
  componentDidMount() {
    this.initParam();
    this.updataImg(this.props);
  }

  // 初始化静态参数
  initParam() {
    let cssStyle = JSON.parse(JSON.stringify(this.state.cssStyle));

    let { width, height, scale } = this.props;

    cssStyle.mouseBlock.width = width / scale + 'px';
    cssStyle.mouseBlock.height = height / scale + 'px';

    cssStyle.imgStyle.width = width + 'px';
    cssStyle.imgStyle.height = height + 'px';
    cssStyle.imgStyle.transform = "scale(" + scale + ")";

    this.setState({
      cssStyle: cssStyle
    });
  }

  // props 变化时更新
  componentWillReceiveProps(nextProps) {
    this.updataImg(nextProps);
  }

  // 鼠标移入
  mouseEnter = () => {
    this.setState({
      magnifierOff: true,
    })
  };
  // mouse remove
  mouseLeave = () => {
    this.setState({
      magnifierOff: false,
    })
  }
  // mouse move
  mouseMove = event => {
    let e = event.nativeEvent;
    // console.log('e x y', e);
    this.calculationBlock(e.offsetX, e.offsetY);
  }
  // calculation params
  calculationBlock(offsetx, offsety) {
    
    let cssStyle = JSON.parse(JSON.stringify(this.state.cssStyle));
    let { width, height, scale } = this.props;
    let slidingBlockW = width / scale;
    let slidingBlockH = height / scale;
    
    let offsetX = offsetx - slidingBlockW / 2;  // 鼠标在盒子中的位置 - 滑块宽的一半
    let offsetY = offsety - slidingBlockH / 2; // 鼠标在盒子中的位置 - 滑块高的一半
    /*block position*/
    // 防止鼠标移动过快导致计算失误，只要小于或大于对应值，直接设置偏移量等于最小或最大值
    // left 取值为 大于 0, 小于 盒子的宽 - mask的宽
    if (offsetX < 0) {
      offsetX = 0;
    }
    if (offsetX > width - slidingBlockW) {
      offsetX = width - slidingBlockW;
    }
    // top 取值为 大于0 ，小于 盒子的高 - mask的高
    if (offsetY < 0) {
      offsetY = 0;
    }
    if (offsetY > height - slidingBlockH) {
      offsetY = height - slidingBlockH;
    }
    // 移动滑块
    if(offsetX > 0 && offsetX < 300) {
      cssStyle.mouseBlock.left = parseFloat(offsetX) + "px";
    }
    if(offsetY > 0 && offsetY < 300) {
      cssStyle.mouseBlock.top = parseFloat(offsetY) + "px";
    }

    /*计算图片放大位置*/
    // 右侧大图片，等比例移动
    cssStyle.imgStyle.left = - parseFloat((offsetX) * scale) + "px";
    cssStyle.imgStyle.top = - parseFloat((offsetY) * scale) + "px";

    this.setState({
      cssStyle: cssStyle,
    });
  }

  // 更新图片
  updataImg(props) {
    this.setState({
      minImg: props.minImg,
      maxImg: props.maxImg,
    })
  }

  // 图片加载情况
  handleImageLoaded(e) {
    this.setState({ imgLoad: true })
  }

  // 图片加载中
  handleImageErrored() {
    this.setState({
      imgLoad: false,
    })
  }

  render() {
    const { cssStyle, magnifierOff, minImg, maxImg, imgLoad } = this.state;
    return (
      <div className={styles['container']}>
        <div className={`${styles['small']} small`}>
          {/* 加载小图 */}
          <img
            className={styles['small-img']}
            src={minImg} alt={""}
          />
          <div
            className={styles['mask']}
            onMouseEnter={this.mouseEnter}
            onMouseLeave={this.mouseLeave}
            onMouseMove={this.mouseMove}
          />
          {magnifierOff && <div className={`${styles['sliding-block']} sliding-block`} style={cssStyle.mouseBlock} />}
        </div>
        {
          magnifierOff &&
          <div className={`${styles['big']} big`}>
            <img
              className={styles['big-img']}
              style={cssStyle.imgStyle}
              src={maxImg}
              onLoad={this.handleImageLoaded.bind(this)}
              onError={this.handleImageErrored.bind(this)}
              alt={""} />
            {!imgLoad && "failed to load"}
          </div>
        }
      </div>
    )
  }
}

export default ImageMagnifier;