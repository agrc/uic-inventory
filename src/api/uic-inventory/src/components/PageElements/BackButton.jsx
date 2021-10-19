import { useHistory } from 'react-router-dom';

export default function BackButton() {
  const history = useHistory();

  return (
    <button type="button" meta="default" onClick={() => history.goBack()}>
      Back
    </button>
  );
}
