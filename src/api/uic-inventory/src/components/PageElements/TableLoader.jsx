import ContentLoader from 'react-content-loader';

const TableLoader = (props) => (
  <ContentLoader
    speed={2}
    width={400}
    height={40}
    viewBox="0 0 400 40"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <circle cx="10" cy="20" r="8" />
    <rect x="25" y="15" rx="5" ry="5" width="220" height="10" />
  </ContentLoader>
);

export default TableLoader;
