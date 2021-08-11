import { toast } from 'react-toastify';

const onRequestError = async (error, defaultMessage = 'Something went terribly wrong that we did not expect.') => {
  // TODO: log error
  console.error(error);
  let toastMessage = defaultMessage;
  let response = { message: undefined };

  try {
    response = await error.response.json();
  } catch (ex) {
    console.error(ex);
  }

  if (response.errors) {
    toastMessage = response.errors.map((x) => x.message).join('\n');
  }

  return toast.error(toastMessage);
};

export default onRequestError;
