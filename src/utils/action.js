//页面自适应；不同的屏幕获取不同的初始宽度以rem模式获取宽度，原始比例1rem=100px；
export function adaptive(sw) {
  const w = document.documentElement.clientWidth;
  let f = w / sw * 100;
  f = f > 100 ? 100 + "px" : f + "px";
  document.documentElement.style.fontSize = f;
}