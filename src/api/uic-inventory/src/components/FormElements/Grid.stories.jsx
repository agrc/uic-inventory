import { FormGrid, PageGrid } from './Grid';

export default {
  title: 'FormElements/Grids',
  component: FormGrid,
};

export const FormGridDefault = () => (
  <FormGrid>
    <div>child</div>
    <div>child</div>
    <div>child</div>
    <div>child</div>
  </FormGrid>
);

export const PageGridDefault = () => (
  <PageGrid heading="hello" subtext="stories are fun" site={{}}>
    <div>child</div>
    <div>child</div>
    <div>child</div>
    <div>child</div>
  </PageGrid>
);

export const PageGridWithoutSite = () => (
  <PageGrid heading="hello" subtext="stories are fun">
    <div>child</div>
    <div>child</div>
    <div>child</div>
    <div>child</div>
  </PageGrid>
);
