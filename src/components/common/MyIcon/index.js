/**
 * MyIcon组件
 */

function MyIcon({ type, text, style, onClick, className, title }) {
  return (
    <i
      onClick={onClick}
      title={title}
      className={`iconfont ${type} ${className}`}
      style={style}>
      {text}
    </i>
  );
}

export default MyIcon;
