import NavLink from 'umi/navlink';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import routes from '../../config/router.config';
import styles from './index.less';

export default withBreadcrumbs(routes)(({ breadcrumbs }) => {
  return (
    <div className={styles['crumbs']}>
      {breadcrumbs.map((item, index) => (
        <span key={item.key}>
          <NavLink to={item.match.url}>
            {item.breadcrumb.props.children}
          </NavLink>
          {item.breadcrumb.props.children && (index < breadcrumbs.length - 1) && <span> / </span>}
        </span>
      ))}
    </div>
  )
});