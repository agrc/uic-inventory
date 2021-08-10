import { toast } from 'react-toastify';

const onRequestError = async (error, defaultMessage = 'Something went terribly wrong that we did not expect.') => {
  // TODO: log error
  console.error(error);
  let toastMessage = defaultMessage;

  const response = await error.response.json();

  if (response.message) {
    toastMessage = response.message;
  }

  return toast.error(toastMessage);
};

export default onRequestError;
