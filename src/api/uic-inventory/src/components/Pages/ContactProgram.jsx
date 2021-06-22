import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Chrome } from '../PageElements';
import { FormGrid, PageGrid, ContactProgramSchema as schema, ResponsiveGridColumn, TextInput } from '../FormElements';

export function ContactProgram() {
  const { formState, handleSubmit, register } = useForm({
    resolver: yupResolver(schema),
  });

  //! pull isDirty from form state to activate proxy
  const { isDirty } = formState;

  return (
    <main>
      <Chrome>
        <form onSubmit={handleSubmit((data) => console.log(data))}>
          <PageGrid
            heading="Contact the UIC Program"
            subtext="Provide a clear and concise message for the staff"
            submitLabel="Send"
            submit={true}
            disabled={!isDirty}
          >
            <FormGrid>
              <ResponsiveGridColumn full={true}>
                <TextInput id="message" register={register} errors={formState.errors} />
              </ResponsiveGridColumn>
            </FormGrid>
          </PageGrid>
        </form>
      </Chrome>
    </main>
  );
}

export default ContactProgram;
