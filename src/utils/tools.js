/**
 * @param {Array} target 目标数组
 * @param {Array} arr 需要查询的数组
 * @description 判断要查询的数组是否至少有一个元素包含在目标数组中
 * @jurisdiction 表示在验证权限，本项目的超级管理员的id为 1
 */
// const hasOneOf = (target, arr, jurisdiction) => {
//   let user_id = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).id : null;
//   if (jurisdiction && user_id === 1) return true; // 此处判断为超级管理员的id为 1 时，有所有的权限
//   return target.some(_ => arr.indexOf(_) > -1)
//   return true;
// };

/**
 * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
 * @param {*} route 路由列表
 */
// const hasAccess = (access, route) => {
//   if (route.meta && route.meta.access) {
//     return hasOneOf(access, route.meta.access, true);
//   } else {
//     return true;
//   }
// };

/**
 * 鉴权
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组
 * @param {*} routes 路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes) => {
  const routePermissionJudge = (list = []) => {
    return list.some((item) => {
      if (item.sub && item.sub.length) {
        return routePermissionJudge(item.sub);
      } else if (item.url.includes(name) || name.indexOf(item.url) === 0) {
        // hasAccess(access, item); // 用于用户组权限验证
        return true;
      }
    });
  };

  return routePermissionJudge(routes);
};
