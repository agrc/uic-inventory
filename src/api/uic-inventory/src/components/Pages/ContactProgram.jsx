import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from 'react-query';
import ky from 'ky';
import { Chrome, onRequestError, toast } from '../PageElements';
import { FormGrid, PageGrid, ContactProgramSchema as schema, ResponsiveGridColumn, TextInput } from '../FormElements';

export function ContactProgram() {
  const { formState, handleSubmit, register, reset } = useForm({
    resolver: yupResolver(schema),
  });

  //* pull isDirty from form state to activate proxy
  const { isDirty, isSubmitSuccessful } = formState;

  const { mutate, status } = useMutation((json) => ky.post('/api/notify/staff', { json }), {
    onError: (error) => onRequestError(error, 'We had some trouble updating your profile.'),
  });

  useEffect(() => {
    if (!isSubmitSuccessful) {
      return;
    }

    toast.success('Your message has been sent');

    reset();
  }, [isSubmitSuccessful, reset]);

  const sendMessage = (data) => {
    mutate(data);
  };

  return (
    <main>
      <Chrome>
        <form onSubmit={handleSubmit(sendMessage)}>
          <PageGrid
            heading="Contact the UIC Program"
            subtext="Provide a clear and concise message for the staff"
            submitLabel="Send"
            submit={true}
            back={true}
            disabled={!isDirty}
          >
            <FormGrid>
              <ResponsiveGridColumn full={true}>
                <TextInput id="message" register={register} errors={formState.errors} disabled={status === 'loading'} />
              </ResponsiveGridColumn>
            </FormGrid>
          </PageGrid>
        </form>
      </Chrome>
    </main>
  );
}

export default ContactProgram;
