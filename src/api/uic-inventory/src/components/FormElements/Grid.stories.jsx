import { FormGrid, PageGrid } from './Grid';

export default {
  title: 'FormElements/Grids',
  component: FormGrid,
};

const getChildren = (size = 4) => {
  const children = [];
  for (let i = 0; i < size; i++) {
    children.push(<div key={i}>child {i}</div>);
  }
  return children;
};

export const FormGridDefault = () => <FormGrid>{getChildren()}</FormGrid>;

export const PageGridDefault = () => (
  <PageGrid heading="hello" subtext="stories are fun" site={{}}>
    {getChildren()}
  </PageGrid>
);

export const PageGridWithoutSite = () => (
  <PageGrid heading="hello" subtext="stories are fun">
    {getChildren()}
  </PageGrid>
);
