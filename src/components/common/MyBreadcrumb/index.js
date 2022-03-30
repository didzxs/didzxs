import React from 'react';
import { Breadcrumb, Icon } from 'antd';
import { Link } from 'umi';

const MyBreadcrumb = (props) => {
  let { list } = props;

  function itemRender(route, params, routes, paths) {
    const last = routes.indexOf(route) === routes.length - 1;
    return last ? (
      <span>{route.breadcrumbName}</span>
    ) : (
      <Link to={route.path}>
        {route.icon && <Icon type={route.icon} />}
        {route.breadcrumbName}
      </Link>
    );
  }
  return (
    <div className='my-breadcrumb'>
      <Breadcrumb itemRender={itemRender} routes={list}></Breadcrumb>
    </div>
  );
}

export default MyBreadcrumb;